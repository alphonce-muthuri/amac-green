-- Add documents column to vendor_applications table
ALTER TABLE vendor_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the documents column structure
COMMENT ON COLUMN vendor_applications.documents IS 'Array of document objects with url, type, and name fields';

-- Create index for documents column for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_applications_documents ON vendor_applications USING GIN (documents);