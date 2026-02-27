-- Add Gas Yetu enhanced location fields to orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_county VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_sub_county VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_ward VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_sub_location VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_street_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_landmark TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_yetu_delivery_instructions TEXT;

-- Add comment to explain these fields
COMMENT ON COLUMN orders.gas_yetu_county IS 'County for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_sub_county IS 'Sub-County for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_ward IS 'Ward/Location for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_sub_location IS 'Sub-Location/Village/Estate for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_street_address IS 'Street/Building/House Number for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_landmark IS 'Landmark for Gas Yetu product deliveries';
COMMENT ON COLUMN orders.gas_yetu_delivery_instructions IS 'Additional delivery instructions for Gas Yetu products';
