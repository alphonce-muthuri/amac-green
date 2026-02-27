-- Professional-specific tables for the Eveready platform
-- This script creates tables for professional features like projects, bulk orders, etc.

-- Professional Projects Table
CREATE TABLE IF NOT EXISTS professional_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Bulk Orders Table
CREATE TABLE IF NOT EXISTS professional_bulk_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES professional_projects(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL,
    professional_discount DECIMAL(5,2) DEFAULT 0,
    savings_amount DECIMAL(12,2) DEFAULT 0,
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Bulk Order Items Table
CREATE TABLE IF NOT EXISTS professional_bulk_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES professional_bulk_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    professional_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Quotes Table
CREATE TABLE IF NOT EXISTS professional_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES professional_projects(id) ON DELETE SET NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    subtotal DECIMAL(12,2) NOT NULL,
    professional_discount DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    valid_until DATE,
    notes TEXT,
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Quote Items Table
CREATE TABLE IF NOT EXISTS professional_quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES professional_quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    professional_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Documents Table
CREATE TABLE IF NOT EXISTS professional_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES professional_projects(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- 'license', 'certificate', 'project_document', 'quote', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Notifications Table
CREATE TABLE IF NOT EXISTS professional_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Activity Log Table
CREATE TABLE IF NOT EXISTS professional_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES professional_projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professional_projects_user_id ON professional_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_projects_status ON professional_projects(status);
CREATE INDEX IF NOT EXISTS idx_professional_bulk_orders_user_id ON professional_bulk_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_bulk_orders_status ON professional_bulk_orders(status);
CREATE INDEX IF NOT EXISTS idx_professional_quotes_user_id ON professional_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_quotes_status ON professional_quotes(status);
CREATE INDEX IF NOT EXISTS idx_professional_documents_user_id ON professional_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_notifications_user_id ON professional_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_notifications_is_read ON professional_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_professional_activity_log_user_id ON professional_activity_log(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_professional_projects_updated_at 
    BEFORE UPDATE ON professional_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_bulk_orders_updated_at 
    BEFORE UPDATE ON professional_bulk_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_quotes_updated_at 
    BEFORE UPDATE ON professional_quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE professional_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_bulk_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_projects
CREATE POLICY "Users can view their own projects" ON professional_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON professional_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON professional_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON professional_projects
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for professional_bulk_orders
CREATE POLICY "Users can view their own bulk orders" ON professional_bulk_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bulk orders" ON professional_bulk_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bulk orders" ON professional_bulk_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for professional_bulk_order_items
CREATE POLICY "Users can view their own bulk order items" ON professional_bulk_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professional_bulk_orders 
            WHERE id = professional_bulk_order_items.order_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own bulk order items" ON professional_bulk_order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM professional_bulk_orders 
            WHERE id = professional_bulk_order_items.order_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bulk order items" ON professional_bulk_order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM professional_bulk_orders 
            WHERE id = professional_bulk_order_items.order_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own bulk order items" ON professional_bulk_order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM professional_bulk_orders 
            WHERE id = professional_bulk_order_items.order_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for professional_quotes
CREATE POLICY "Users can view their own quotes" ON professional_quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes" ON professional_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" ON professional_quotes
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for professional_quote_items
CREATE POLICY "Users can view their own quote items" ON professional_quote_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professional_quotes 
            WHERE id = professional_quote_items.quote_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quote items" ON professional_quote_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM professional_quotes 
            WHERE id = professional_quote_items.quote_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own quote items" ON professional_quote_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM professional_quotes 
            WHERE id = professional_quote_items.quote_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own quote items" ON professional_quote_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM professional_quotes 
            WHERE id = professional_quote_items.quote_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for professional_documents
CREATE POLICY "Users can view their own documents" ON professional_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON professional_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON professional_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON professional_documents
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for professional_notifications
CREATE POLICY "Users can view their own notifications" ON professional_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON professional_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for professional_activity_log
CREATE POLICY "Users can view their own activity log" ON professional_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log" ON professional_activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample data for testing
INSERT INTO professional_projects (user_id, name, client_name, project_type, status, description, start_date, end_date, budget, location)
SELECT 
    u.id,
    'Solar Installation - Nairobi Office',
    'ABC Company Ltd',
    'Solar Installation',
    'in_progress',
    'Complete solar installation for office building',
    '2024-01-15',
    '2024-02-15',
    500000.00,
    'Nairobi, Kenya'
FROM auth.users u
WHERE u.user_metadata->>'role' = 'professional'
LIMIT 1;

-- Create a function to generate professional order numbers
CREATE OR REPLACE FUNCTION generate_professional_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    -- Get the next number from a sequence or counter
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'PROF-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM professional_bulk_orders
    WHERE order_number LIKE 'PROF-%';
    
    -- Format as PROF-000001, PROF-000002, etc.
    order_number := 'PROF-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate professional quote numbers
CREATE OR REPLACE FUNCTION generate_professional_quote_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    quote_number TEXT;
BEGIN
    -- Get the next number from a sequence or counter
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'QUOTE-(\d+)') AS INTEGER)), 0) + 1
    INTO professional_quotes
    WHERE quote_number LIKE 'QUOTE-%';
    
    -- Format as QUOTE-000001, QUOTE-000002, etc.
    quote_number := 'QUOTE-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;
