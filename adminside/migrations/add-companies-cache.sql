-- ================================================================
-- COMPANIES CACHE TABLE FOR ADMIN SEARCHES
-- ================================================================
-- This table stores companies from Companies House searches
-- with their due dates, allowing filtering by confirmation statement dates

-- Create the companies cache table (global, not tied to a user)
CREATE TABLE IF NOT EXISTS public.companies_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_number text NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_status text,
  company_type text,
  date_of_creation text,
  date_of_cessation text,
  registered_office_address jsonb,
  sic_codes text[],
  confirmation_statement_due date,
  accounts_due date,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_cache_pkey PRIMARY KEY (id)
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_companies_cache_company_number ON public.companies_cache(company_number);
CREATE INDEX IF NOT EXISTS idx_companies_cache_company_name ON public.companies_cache USING gin (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_cache_confirmation_due ON public.companies_cache(confirmation_statement_due);
CREATE INDEX IF NOT EXISTS idx_companies_cache_accounts_due ON public.companies_cache(accounts_due);
CREATE INDEX IF NOT EXISTS idx_companies_cache_status ON public.companies_cache(company_status);
CREATE INDEX IF NOT EXISTS idx_companies_cache_last_updated ON public.companies_cache(last_updated);

-- Enable RLS
ALTER TABLE public.companies_cache ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all cached companies
CREATE POLICY "Admins can view companies cache" ON public.companies_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow admins to insert/update cached companies
CREATE POLICY "Admins can manage companies cache" ON public.companies_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_companies_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
DROP TRIGGER IF EXISTS update_companies_cache_updated_at ON public.companies_cache;
CREATE TRIGGER update_companies_cache_updated_at
  BEFORE UPDATE ON public.companies_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_cache_timestamp();

-- ================================================================
-- DONE! Run this in your Supabase SQL Editor
-- ================================================================
