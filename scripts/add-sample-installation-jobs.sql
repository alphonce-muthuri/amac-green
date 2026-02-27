-- Add sample installation jobs for testing
-- Note: Replace the customer_id with actual customer user IDs from your auth.users table

-- Sample Job 1: Solar Panel Installation
INSERT INTO installation_jobs (
  customer_id, 
  title, 
  description, 
  location_address, 
  location_city, 
  preferred_date, 
  urgency, 
  status, 
  total_product_cost
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual customer ID
  'Solar Panel Installation - Residential',
  'Need installation of 6kW solar panel system on residential rooftop. House has good sun exposure and suitable roof structure.',
  '123 Kiambu Road, Kiambu',
  'Kiambu',
  '2024-12-15',
  'normal',
  'open',
  450000.00
);

-- Sample Job 2: LPG System Installation
INSERT INTO installation_jobs (
  customer_id, 
  title, 
  description, 
  location_address, 
  location_city, 
  preferred_date, 
  urgency, 
  status, 
  total_product_cost
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Replace with actual customer ID
  'Commercial LPG System Setup',
  'Installation of commercial LPG system for restaurant. Includes gas lines, safety equipment, and regulatory compliance.',
  '456 Moi Avenue, Nairobi CBD',
  'Nairobi',
  '2024-12-10',
  'high',
  'open',
  280000.00
);

-- Sample Job 3: Battery Backup System
INSERT INTO installation_jobs (
  customer_id, 
  title, 
  description, 
  location_address, 
  location_city, 
  preferred_date, 
  urgency, 
  status, 
  total_product_cost
) VALUES (
  '00000000-0000-0000-0000-000000000003', -- Replace with actual customer ID
  'Battery Backup System Installation',
  'Install lithium battery backup system for home office. Need reliable power during outages.',
  '789 Ngong Road, Karen',
  'Karen',
  '2024-12-20',
  'urgent',
  'open',
  320000.00
);

-- Add sample job items for Job 1 (Solar Panels)
INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '11111111-1111-1111-1111-111111111111', -- Replace with actual product ID
  '300W Solar Panel',
  25000.00,
  20
FROM installation_jobs ij 
WHERE ij.title = 'Solar Panel Installation - Residential';

INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '22222222-2222-2222-2222-222222222222', -- Replace with actual product ID
  'Solar Inverter 6kW',
  85000.00,
  1
FROM installation_jobs ij 
WHERE ij.title = 'Solar Panel Installation - Residential';

-- Add sample job items for Job 2 (LPG System)
INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '33333333-3333-3333-3333-333333333333', -- Replace with actual product ID
  'Commercial LPG Tank 100kg',
  45000.00,
  2
FROM installation_jobs ij 
WHERE ij.title = 'Commercial LPG System Setup';

INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '44444444-4444-4444-4444-444444444444', -- Replace with actual product ID
  'LPG Regulator Commercial',
  15000.00,
  2
FROM installation_jobs ij 
WHERE ij.title = 'Commercial LPG System Setup';

-- Add sample job items for Job 3 (Battery System)
INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '55555555-5555-5555-5555-555555555555', -- Replace with actual product ID
  'Lithium Battery 10kWh',
  180000.00,
  1
FROM installation_jobs ij 
WHERE ij.title = 'Battery Backup System Installation';

INSERT INTO installation_job_items (job_id, product_id, product_name, product_price, quantity)
SELECT 
  ij.id,
  '66666666-6666-6666-6666-666666666666', -- Replace with actual product ID
  'Battery Management System',
  35000.00,
  1
FROM installation_jobs ij 
WHERE ij.title = 'Battery Backup System Installation';