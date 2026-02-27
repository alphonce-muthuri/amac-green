-- Create reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);

-- Enable Row Level Security
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reviews for active products
CREATE POLICY "Users can view product reviews" ON product_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_reviews.product_id 
            AND products.status = 'active'
        )
    );

-- Policy: Authenticated users can create reviews for products they've purchased
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON product_reviews
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Policy: Service role can manage all reviews
CREATE POLICY "Service role can manage all reviews" ON product_reviews
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();
