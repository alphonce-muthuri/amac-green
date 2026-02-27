-- Create installation jobs and bids tables

-- Installation jobs table
CREATE TABLE IF NOT EXISTS installation_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_address TEXT NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  location_coordinates POINT,
  preferred_date DATE,
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'assigned', 'in_progress', 'completed', 'cancelled')),
  selected_bid_id UUID,
  total_product_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Installation job items (products to be installed)
CREATE TABLE IF NOT EXISTS installation_job_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES installation_jobs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- References products table
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional bids table
CREATE TABLE IF NOT EXISTS installation_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES installation_jobs(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  labor_cost DECIMAL(10,2) NOT NULL,
  material_cost DECIMAL(10,2) DEFAULT 0,
  additional_costs DECIMAL(10,2) DEFAULT 0,
  total_bid_amount DECIMAL(10,2) NOT NULL,
  estimated_duration_hours INTEGER,
  proposal_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_installation_jobs_customer_id ON installation_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_installation_jobs_status ON installation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_installation_jobs_created_at ON installation_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_installation_job_items_job_id ON installation_job_items(job_id);
CREATE INDEX IF NOT EXISTS idx_installation_job_items_product_id ON installation_job_items(product_id);

CREATE INDEX IF NOT EXISTS idx_installation_bids_job_id ON installation_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_installation_bids_professional_id ON installation_bids(professional_id);
CREATE INDEX IF NOT EXISTS idx_installation_bids_status ON installation_bids(status);

-- Add foreign key constraint for selected bid
ALTER TABLE installation_jobs 
ADD CONSTRAINT fk_installation_jobs_selected_bid 
FOREIGN KEY (selected_bid_id) REFERENCES installation_bids(id);

-- Enable Row Level Security
ALTER TABLE installation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for installation_jobs
CREATE POLICY "Customers can view their own jobs" ON installation_jobs
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create their own jobs" ON installation_jobs
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own jobs" ON installation_jobs
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Professionals can view open jobs" ON installation_jobs
  FOR SELECT USING (status IN ('open', 'bidding'));

-- RLS Policies for installation_job_items
CREATE POLICY "Users can view job items for accessible jobs" ON installation_job_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM installation_jobs 
      WHERE installation_jobs.id = installation_job_items.job_id 
      AND (installation_jobs.customer_id = auth.uid() OR installation_jobs.status IN ('open', 'bidding'))
    )
  );

CREATE POLICY "Customers can manage their job items" ON installation_job_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM installation_jobs 
      WHERE installation_jobs.id = installation_job_items.job_id 
      AND installation_jobs.customer_id = auth.uid()
    )
  );

-- RLS Policies for installation_bids
CREATE POLICY "Professionals can view and manage their own bids" ON installation_bids
  FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Customers can view bids on their jobs" ON installation_bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM installation_jobs 
      WHERE installation_jobs.id = installation_bids.job_id 
      AND installation_jobs.customer_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_installation_jobs_updated_at 
    BEFORE UPDATE ON installation_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installation_bids_updated_at 
    BEFORE UPDATE ON installation_bids 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();