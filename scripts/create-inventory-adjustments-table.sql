-- Create inventory adjustments table for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('add', 'subtract')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT,
    adjusted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    adjusted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_stock INTEGER,
    new_stock INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_adjusted_by ON inventory_adjustments(adjusted_by);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_adjusted_at ON inventory_adjustments(adjusted_at);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);

-- Enable Row Level Security
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view adjustments for their own products
CREATE POLICY "Users can view own inventory adjustments" ON inventory_adjustments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = inventory_adjustments.product_id 
            AND products.vendor_id = auth.uid()
        )
    );

-- Policy: Users can create adjustments for their own products
CREATE POLICY "Users can create own inventory adjustments" ON inventory_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = inventory_adjustments.product_id 
            AND products.vendor_id = auth.uid()
        )
        AND auth.uid() = adjusted_by
    );

-- Policy: Service role can manage all adjustments
CREATE POLICY "Service role can manage all inventory adjustments" ON inventory_adjustments
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Create function to automatically set previous and new stock values
CREATE OR REPLACE FUNCTION set_inventory_adjustment_stocks()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the current stock of the product
    SELECT inventory_quantity INTO NEW.previous_stock 
    FROM products 
    WHERE id = NEW.product_id;
    
    -- Calculate new stock based on adjustment type
    IF NEW.adjustment_type = 'add' THEN
        NEW.new_stock := NEW.previous_stock + NEW.quantity;
    ELSE
        NEW.new_stock := NEW.previous_stock - NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set stock values before insert
CREATE TRIGGER set_inventory_adjustment_stocks_trigger
    BEFORE INSERT ON inventory_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION set_inventory_adjustment_stocks();
