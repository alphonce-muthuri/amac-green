-- Create delivery applications table
CREATE TABLE IF NOT EXISTS delivery_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  driver_license VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  vehicle_registration VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_phone VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_applications_user_id ON delivery_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_applications_status ON delivery_applications(status);
CREATE INDEX IF NOT EXISTS idx_delivery_applications_email ON delivery_applications(email);

-- Enable Row Level Security
ALTER TABLE delivery_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist before creating new ones
DROP POLICY IF EXISTS "Users can view their own delivery applications" ON delivery_applications;
DROP POLICY IF EXISTS "Users can insert their own delivery applications" ON delivery_applications;
DROP POLICY IF EXISTS "Users can update their own delivery applications" ON delivery_applications;

-- Create RLS policies
CREATE POLICY "Users can view their own delivery applications" ON delivery_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery applications" ON delivery_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery applications" ON delivery_applications
  FOR UPDATE USING (auth.uid() = user_id);
