-- Create delivery locations table for real-time tracking
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_person_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- GPS accuracy in meters
  heading DECIMAL(5, 2), -- Direction in degrees (0-360)
  speed DECIMAL(8, 2), -- Speed in km/h
  is_online BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true, -- Available for new deliveries
  battery_level INTEGER, -- Battery percentage
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_locations_person_id ON delivery_locations(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_updated ON delivery_locations(last_updated);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_available ON delivery_locations(is_available, is_online);

-- Enable RLS
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Policies for delivery locations
DROP POLICY IF EXISTS "Delivery persons can manage their own location" ON delivery_locations;
CREATE POLICY "Delivery persons can manage their own location" ON delivery_locations
  FOR ALL USING (auth.uid() = delivery_person_id);

DROP POLICY IF EXISTS "Admins can view all delivery locations" ON delivery_locations;
CREATE POLICY "Admins can view all delivery locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to update location (upsert)
CREATE OR REPLACE FUNCTION update_delivery_location(
  p_latitude DECIMAL(10, 8),
  p_longitude DECIMAL(11, 8),
  p_accuracy DECIMAL(10, 2) DEFAULT NULL,
  p_heading DECIMAL(5, 2) DEFAULT NULL,
  p_speed DECIMAL(8, 2) DEFAULT NULL,
  p_is_online BOOLEAN DEFAULT true,
  p_is_available BOOLEAN DEFAULT true,
  p_battery_level INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  location_id UUID;
BEGIN
  -- Insert or update location
  INSERT INTO delivery_locations (
    delivery_person_id,
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    is_online,
    is_available,
    battery_level,
    last_updated
  )
  VALUES (
    auth.uid(),
    p_latitude,
    p_longitude,
    p_accuracy,
    p_heading,
    p_speed,
    p_is_online,
    p_is_available,
    p_battery_level,
    NOW()
  )
  ON CONFLICT (delivery_person_id) 
  DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    accuracy = EXCLUDED.accuracy,
    heading = EXCLUDED.heading,
    speed = EXCLUDED.speed,
    is_online = EXCLUDED.is_online,
    is_available = EXCLUDED.is_available,
    battery_level = EXCLUDED.battery_level,
    last_updated = NOW()
  RETURNING id INTO location_id;
  
  RETURN location_id;
END;
$$;

-- Add unique constraint to ensure one location per delivery person
ALTER TABLE delivery_locations 
ADD CONSTRAINT unique_delivery_person_location 
UNIQUE (delivery_person_id);
