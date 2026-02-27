-- Add MPESA-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS mpesa_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_notes TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for MPESA tracking
CREATE INDEX IF NOT EXISTS idx_orders_mpesa_checkout_request_id ON orders(mpesa_checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_orders_mpesa_transaction_id ON orders(mpesa_transaction_id);

-- Update the orders table to allow notes column (if it doesn't exist)
-- This handles the case where we renamed customer_notes to notes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
END $$;
