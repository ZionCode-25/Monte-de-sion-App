-- Migration: Create credentials table for Pastoral and Ministerial verification
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'PASTORAL',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    photo_url TEXT,
    location TEXT NOT NULL DEFAULT 'San Juan, Argentina',
    document_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high performance lookup
CREATE INDEX IF NOT EXISTS idx_credentials_code ON public.credentials (code);
CREATE INDEX IF NOT EXISTS idx_credentials_status ON public.credentials (status);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials (user_id);

-- Enable RLS
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- 1. Public SELECT for verification (Anyone scanning the QR can view credential details)
DROP POLICY IF EXISTS "Public credential verification" ON public.credentials;
CREATE POLICY "Public credential verification"
ON public.credentials
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Management policy for SUPER_ADMIN & PASTOR
DROP POLICY IF EXISTS "Admins can manage credentials" ON public.credentials;
CREATE POLICY "Admins can manage credentials"
ON public.credentials
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('SUPER_ADMIN', 'PASTOR')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('SUPER_ADMIN', 'PASTOR')
    )
);

-- Insert initial sample pastoral credential if not exists
INSERT INTO public.credentials (code, full_name, role_title, category, status, issue_date, expiration_date, location, notes)
VALUES 
('PM-00125', 'Marcela Arroyo', 'Pastora Principal', 'PASTORAL', 'active', '2025-01-01', '2027-12-31', 'San Juan, Argentina', 'Credencial Pastoral Oficial Iglesia Monte de Sion')
ON CONFLICT (code) DO NOTHING;
