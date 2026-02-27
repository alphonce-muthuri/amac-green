-- Create vendor_profiles table
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_name VARCHAR(255),
    business_description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    business_address TEXT,
    business_city VARCHAR(100),
    business_state VARCHAR(100),
    business_country VARCHAR(100) DEFAULT 'Kenya',
    business_website VARCHAR(255),
    business_logo VARCHAR(500),
    tax_id VARCHAR(100),
    business_license VARCHAR(100),
    payment_methods TEXT[] DEFAULT ARRAY['mpesa'],
    notification_preferences JSONB DEFAULT '{
        "email_notifications": true,
        "sms_notifications": true,
        "order_notifications": true,
        "inventory_alerts": true,
        "marketing_emails": false
    }',
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "15:00", "closed": false},
        "sunday": {"open": "09:00", "close": "15:00", "closed": true}
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_business_name ON vendor_profiles(business_name);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_business_city ON vendor_profiles(business_city);

-- Enable Row Level Security
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own vendor profile" ON vendor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendor profile" ON vendor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" ON vendor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor profile" ON vendor_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_vendor_profiles_updated_at
    BEFORE UPDATE ON vendor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_profiles_updated_at();
