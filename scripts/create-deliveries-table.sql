-- Create deliveries table to track order deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  delivery_person_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Delivery address (can be different from order shipping address)
  delivery_address_line1 TEXT NOT NULL,
  delivery_address_line2 TEXT,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_state VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  delivery_country VARCHAR(100) NOT NULL DEFAULT 'Kenya',
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  
  -- Delivery details
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  
  -- Delivery notes
  delivery_instructions TEXT,
  delivery_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  
  -- Tracking
  assigned_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_person_id ON deliveries(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- Enable Row Level Security
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deliveries
CREATE POLICY "Customers can view their order deliveries" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Delivery persons can view their assigned deliveries" ON deliveries
  FOR SELECT USING (delivery_person_id = auth.uid());

CREATE POLICY "Delivery persons can update their assigned deliveries" ON deliveries
  FOR UPDATE USING (delivery_person_id = auth.uid());

-- Service role can manage all deliveries
CREATE POLICY "Service role can manage all deliveries" ON deliveries
  FOR ALL USING (true);

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL, 
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Earth's radius in kilometers
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  
  a := SIN(dLat/2) * SIN(dLat/2) + 
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
       SIN(dLon/2) * SIN(dLon/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest available delivery person
CREATE OR REPLACE FUNCTION find_nearest_delivery_person(
  delivery_lat DECIMAL,
  delivery_lon DECIMAL,
  max_distance DECIMAL DEFAULT 50 -- Maximum distance in km
) RETURNS UUID AS $$
DECLARE
  delivery_person_id UUID;
BEGIN
  SELECT da.user_id INTO delivery_person_id
  FROM delivery_applications da
  JOIN delivery_locations dl ON da.user_id = dl.delivery_person_id
  WHERE da.status = 'approved'
    AND da.availability_status = 'available'
    AND dl.is_online = true
    AND dl.updated_at > NOW() - INTERVAL '30 minutes' -- Only consider recent locations
    AND calculate_distance(dl.latitude, dl.longitude, delivery_lat, delivery_lon) <= max_distance
  ORDER BY calculate_distance(dl.latitude, dl.longitude, delivery_lat, delivery_lon) ASC
  LIMIT 1;
  
  RETURN delivery_person_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign delivery after order payment
CREATE OR REPLACE FUNCTION auto_assign_delivery()
RETURNS TRIGGER AS $$
DECLARE
  delivery_person_id UUID;
  delivery_lat DECIMAL;
  delivery_lon DECIMAL;
BEGIN
  -- Only trigger for orders that are paid and confirmed
  IF NEW.payment_status = 'paid' AND NEW.status = 'confirmed' AND OLD.payment_status != 'paid' THEN
    
    -- Check if delivery already exists for this order
    IF NOT EXISTS (SELECT 1 FROM deliveries WHERE order_id = NEW.id) THEN
      
      -- Try to geocode the shipping address (simplified - in production you'd use a geocoding service)
      -- For now, we'll use default coordinates for major Kenyan cities
      CASE 
        WHEN LOWER(NEW.shipping_city) LIKE '%nairobi%' THEN
          delivery_lat := -1.2921;
          delivery_lon := 36.8219;
        WHEN LOWER(NEW.shipping_city) LIKE '%mombasa%' THEN
          delivery_lat := -4.0435;
          delivery_lon := 39.6682;
        WHEN LOWER(NEW.shipping_city) LIKE '%kisumu%' THEN
          delivery_lat := -0.0917;
          delivery_lon := 34.7680;
        ELSE
          -- Default to Nairobi if city not recognized
          delivery_lat := -1.2921;
          delivery_lon := 36.8219;
      END CASE;
      
      -- Find nearest available delivery person
      delivery_person_id := find_nearest_delivery_person(delivery_lat, delivery_lon);
      
      -- Create delivery record
      INSERT INTO deliveries (
        order_id,
        delivery_person_id,
        delivery_address_line1,
        delivery_address_line2,
        delivery_city,
        delivery_state,
        delivery_postal_code,
        delivery_country,
        delivery_latitude,
        delivery_longitude,
        delivery_status,
        delivery_fee,
        estimated_delivery_time,
        delivery_instructions
      ) VALUES (
        NEW.id,
        delivery_person_id,
        NEW.shipping_address_line1,
        NEW.shipping_address_line2,
        NEW.shipping_city,
        NEW.shipping_state,
        NEW.shipping_postal_code,
        NEW.shipping_country,
        delivery_lat,
        delivery_lon,
        CASE WHEN delivery_person_id IS NOT NULL THEN 'assigned' ELSE 'pending' END,
        CASE WHEN NEW.shipping_amount > 0 THEN NEW.shipping_amount ELSE 500 END, -- Default delivery fee
        NOW() + INTERVAL '2 hours', -- Estimated 2 hours for delivery
        NEW.customer_notes
      );
      
      -- Update delivery person availability if assigned
      IF delivery_person_id IS NOT NULL THEN
        UPDATE delivery_applications 
        SET availability_status = 'busy',
            updated_at = NOW()
        WHERE user_id = delivery_person_id;
        
        -- Update delivery record with assignment time
        UPDATE deliveries 
        SET assigned_at = NOW(),
            updated_at = NOW()
        WHERE order_id = NEW.id;
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign delivery after payment
DROP TRIGGER IF EXISTS auto_assign_delivery_trigger ON orders;
CREATE TRIGGER auto_assign_delivery_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION auto_assign_delivery();
