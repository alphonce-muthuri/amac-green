-- Add documents column to all application tables

-- Vendor applications
ALTER TABLE vendor_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN vendor_applications.documents IS 'Array of document objects with url, type, and name fields';
CREATE INDEX IF NOT EXISTS idx_vendor_applications_documents ON vendor_applications USING GIN (documents);

-- Professional applications  
ALTER TABLE professional_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN professional_applications.documents IS 'Array of document objects with url, type, and name fields';
CREATE INDEX IF NOT EXISTS idx_professional_applications_documents ON professional_applications USING GIN (documents);

-- Delivery applications
ALTER TABLE delivery_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN delivery_applications.documents IS 'Array of document objects with url, type, and name fields';
CREATE INDEX IF NOT EXISTS idx_delivery_applications_documents ON delivery_applications USING GIN (documents);