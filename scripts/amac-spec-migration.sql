-- AMAC Green spec alignment — run against your Supabase Postgres (SQL editor or psql).
-- Safe to re-run: uses IF NOT EXISTS where supported.

-- ---------------------------------------------------------------------------
-- Orders: financing + fulfilment (spec §4.4, §4.5)
-- ---------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS financing_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS financing_reference VARCHAR(128);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS financing_requested_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS financing_decided_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS financing_payload JSONB;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_stage VARCHAR(40) DEFAULT 'order_received';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_financing_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_financing_status_check
      CHECK (financing_status IN ('none', 'pending', 'approved', 'declined', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_fulfillment_stage_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_fulfillment_stage_check
      CHECK (fulfillment_stage IN (
        'order_received',
        'installation_in_progress',
        'commissioned',
        'completed'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_financing_status ON orders(financing_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_stage ON orders(fulfillment_stage);

-- ---------------------------------------------------------------------------
-- Order line items: optional link to a product package
-- ---------------------------------------------------------------------------
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID;

-- FK added after product_packages exists (see below)

-- ---------------------------------------------------------------------------
-- Customer programme / energy demand profile (spec §4.1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_program_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile JSONB NOT NULL DEFAULT '{}',
  county VARCHAR(100),
  user_segment VARCHAR(80),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_program_profiles_county ON customer_program_profiles(county);
CREATE INDEX IF NOT EXISTS idx_customer_program_profiles_segment ON customer_program_profiles(user_segment);

ALTER TABLE customer_program_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own program profile" ON customer_program_profiles;
CREATE POLICY "Users manage own program profile" ON customer_program_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Product packages (ops-defined bundles)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  coverage_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, slug)
);

CREATE TABLE IF NOT EXISTS product_package_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES product_packages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (package_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_packages_vendor ON product_packages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_packages_status ON product_packages(status);
CREATE INDEX IF NOT EXISTS idx_product_package_items_package ON product_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_product_package_items_product ON product_package_items(product_id);

ALTER TABLE product_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_package_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own packages" ON product_packages;
CREATE POLICY "Vendors manage own packages" ON product_packages
  FOR ALL USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Anyone can view active packages" ON product_packages;
CREATE POLICY "Anyone can view active packages" ON product_packages
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Vendors manage package items" ON product_package_items;
CREATE POLICY "Vendors manage package items" ON product_package_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM product_packages p
      WHERE p.id = product_package_items.package_id AND p.vendor_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_packages p
      WHERE p.id = product_package_items.package_id AND p.vendor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public read package items for active packages" ON product_package_items;
CREATE POLICY "Public read package items for active packages" ON product_package_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM product_packages p
      WHERE p.id = product_package_items.package_id AND p.status = 'active'
    )
  );

-- FK from order_items.package_id → product_packages (deferred)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_package_id_fkey'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_package_id_fkey
      FOREIGN KEY (package_id) REFERENCES product_packages(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN orders.financing_status IS 'KCB financing lifecycle; none when paying directly.';
COMMENT ON COLUMN orders.fulfillment_stage IS 'Spec §4.5 stages for clean-energy fulfilment.';
COMMENT ON TABLE customer_program_profiles IS 'Structured demand profile (spec §4.1), JSONB for flexibility.';
COMMENT ON TABLE product_packages IS 'Vendor-defined system packages; contents in product_package_items.';
