-- Add documents column to delivery_applications table
ALTER TABLE delivery_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the documents column structure
COMMENT ON COLUMN delivery_applications.documents IS 'Array of document objects with url, type, and name fields';

-- Create index for documents column for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_applications_documents ON delivery_applications USING GIN (documents);