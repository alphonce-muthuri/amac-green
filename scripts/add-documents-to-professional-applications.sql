-- Add documents column to professional_applications table
ALTER TABLE professional_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the documents column structure
COMMENT ON COLUMN professional_applications.documents IS 'Array of document objects with url, type, and name fields';

-- Create index for documents column for better performance
CREATE INDEX IF NOT EXISTS idx_professional_applications_documents ON professional_applications USING GIN (documents);