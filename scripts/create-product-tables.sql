-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2), -- Original price for discounts
  cost_price DECIMAL(10,2), -- Vendor's cost
  track_inventory BOOLEAN DEFAULT TRUE,
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  weight DECIMAL(8,2), -- in kg
  dimensions_length DECIMAL(8,2), -- in cm
  dimensions_width DECIMAL(8,2), -- in cm
  dimensions_height DECIMAL(8,2), -- in cm
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[], -- Array of tags
  specifications JSONB, -- Product specifications as JSON
  warranty_info TEXT,
  shipping_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product variants table (for different sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2),
  compare_price DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  weight DECIMAL(8,2),
  is_active BOOLEAN DEFAULT TRUE,
  variant_options JSONB, -- e.g., {"color": "red", "size": "large"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO product_categories (name, description, slug) VALUES
('Solar Panels', 'Photovoltaic solar panels and modules', 'solar-panels'),
('Batteries', 'Energy storage batteries and systems', 'batteries'),
('Inverters', 'Solar inverters and power converters', 'inverters'),
('Charge Controllers', 'Solar charge controllers and regulators', 'charge-controllers'),
('Mounting Systems', 'Solar panel mounting and racking systems', 'mounting-systems'),
('Cables & Accessories', 'Solar cables, connectors, and accessories', 'cables-accessories'),
('Monitoring Systems', 'Energy monitoring and management systems', 'monitoring-systems'),
('LPG Equipment', 'LPG cylinders, regulators, and accessories', 'lpg-equipment'),
('Wind Energy', 'Wind turbines and wind energy systems', 'wind-energy'),
('Hydropower', 'Small hydropower systems and equipment', 'hydropower')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Vendors can view their own products" ON products
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" ON products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products" ON products
  FOR DELETE USING (auth.uid() = vendor_id);

-- Public can view active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Service role can manage all products
CREATE POLICY "Service role can manage all products" ON products
  FOR ALL USING (true);

-- Create RLS policies for product images
CREATE POLICY "Vendors can manage their product images" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.vendor_id = auth.uid()
    )
  );

-- Public can view product images for active products
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.status = 'active'
    )
  );

-- Service role can manage all product images
CREATE POLICY "Service role can manage all product images" ON product_images
  FOR ALL USING (true);

-- Create RLS policies for product variants
CREATE POLICY "Vendors can manage their product variants" ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.vendor_id = auth.uid()
    )
  );

-- Public can view variants for active products
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'active'
    )
  );

-- Service role can manage all product variants
CREATE POLICY "Service role can manage all product variants" ON product_variants
  FOR ALL USING (true);

-- Categories are publicly readable
CREATE POLICY "Public can view categories" ON product_categories
  FOR SELECT USING (is_active = true);

-- Service role can manage categories
CREATE POLICY "Service role can manage categories" ON product_categories
  FOR ALL USING (true);
