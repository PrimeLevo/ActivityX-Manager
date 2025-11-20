-- RLS Policies for user_profiles table
-- Run these in your Supabase SQL Editor

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for new user registration)
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Enable RLS on law_firms table
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view law firms (read-only access for all authenticated users)
CREATE POLICY "Authenticated users can view law firms"
ON public.law_firms
FOR SELECT
TO authenticated
USING (true);
