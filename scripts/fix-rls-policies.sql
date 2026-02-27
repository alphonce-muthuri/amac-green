-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own vendor applications" ON vendor_applications;
DROP POLICY IF EXISTS "Users can insert their own vendor applications" ON vendor_applications;
DROP POLICY IF EXISTS "Users can view their own professional applications" ON professional_applications;
DROP POLICY IF EXISTS "Users can insert their own professional applications" ON professional_applications;

-- Create new policies that allow service role to insert
CREATE POLICY "Users can view their own vendor applications" ON vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert vendor applications" ON vendor_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update vendor applications" ON vendor_applications
  FOR UPDATE USING (true);

CREATE POLICY "Users can view their own professional applications" ON professional_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert professional applications" ON professional_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update professional applications" ON professional_applications
  FOR UPDATE USING (true);

-- Allow service role to read all applications for admin dashboard
CREATE POLICY "Service role can read all vendor applications" ON vendor_applications
  FOR SELECT USING (true);

CREATE POLICY "Service role can read all professional applications" ON professional_applications
  FOR SELECT USING (true);

CREATE POLICY "Service role can read all customer profiles" ON customer_profiles
  FOR SELECT USING (true);
