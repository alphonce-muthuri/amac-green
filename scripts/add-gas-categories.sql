-- Add Gas Yetu and Super Gas categories to product_categories table

INSERT INTO product_categories (name, description, slug) VALUES
('Gas Yetu', 'Gas Yetu LPG products and equipment', 'gas-yetu'),
('Super Gas', 'Super Gas LPG products and equipment', 'super-gas')
ON CONFLICT (slug) DO NOTHING;
