-- Create payment_transactions table for Daraja API integration

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    checkout_request_id VARCHAR(255) NOT NULL UNIQUE,
    merchant_request_id VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'mpesa_daraja',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    result_code INTEGER,
    result_desc TEXT,
    mpesa_receipt_number VARCHAR(255),
    transaction_date BIGINT,
    callback_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_checkout_request_id ON payment_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own payment transactions
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        )
    );

-- Policy for service role to manage all payment transactions
CREATE POLICY "Service role can manage all payment transactions" ON payment_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE payment_transactions IS 'Stores M-Pesa payment transaction details from Daraja API';
COMMENT ON COLUMN payment_transactions.checkout_request_id IS 'Unique identifier from Daraja STK Push response';
COMMENT ON COLUMN payment_transactions.merchant_request_id IS 'Merchant request ID from Daraja API';
COMMENT ON COLUMN payment_transactions.result_code IS 'Result code from M-Pesa callback (0 = success)';
COMMENT ON COLUMN payment_transactions.mpesa_receipt_number IS 'M-Pesa transaction receipt number';
COMMENT ON COLUMN payment_transactions.transaction_date IS 'Transaction timestamp from M-Pesa (Unix timestamp)';
COMMENT ON COLUMN payment_transactions.callback_metadata IS 'Full callback metadata from Daraja API';