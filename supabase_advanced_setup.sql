-- ==========================================
-- E-PEDAGOG ADVANCED SYSTEM SCHEMA
-- ==========================================

-- 1. Profiles & Roles
-- Roles: 'admin', 'pedagog', 'operator', 'approver'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE public.profiles ADD CONSTRAINT role_check CHECK (role IN ('admin', 'pedagog', 'operator', 'approver'));

-- 2. Structured Table Data (Academic, Methodical, etc.)
-- Instead of 4 separate tables, let's use a unified structure or keep existing ones for compatibility
-- I will add an 'is_approved' column to them.

ALTER TABLE public.academic_works ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.academic_works ADD COLUMN IF NOT EXISTS last_modified_by uuid REFERENCES auth.users(id);

-- Check for existence before creating new tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'methodical_works') THEN
        CREATE TABLE methodical_works (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
            table_data jsonb NOT NULL,
            status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scientific_works') THEN
        CREATE TABLE scientific_works (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
            table_data jsonb NOT NULL,
            status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mentor_works') THEN
        CREATE TABLE mentor_works (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
            table_data jsonb NOT NULL,
            status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- 3. File Proofs tracking (for Green/Red indicators)
CREATE TABLE IF NOT EXISTS file_proofs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    table_type text NOT NULL, -- 'academic', 'methodical', etc.
    cell_id text NOT NULL, -- format e.g. "row3-col2"
    file_path text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE file_proofs ENABLE ROW LEVEL SECURITY;

-- 4. Approvals History
CREATE TABLE IF NOT EXISTS approval_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id uuid NOT NULL,
    table_type text NOT NULL,
    reviewer_id uuid REFERENCES auth.users(id),
    status text NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enhanced RLS Policies for Role-Based Access

-- Admin helper
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Approver helper
CREATE OR REPLACE FUNCTION public.is_approver() RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'approver');
$$ LANGUAGE sql SECURITY DEFINER;

-- Operator helper
CREATE OR REPLACE FUNCTION public.is_operator() RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'operator');
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS for Academic Works (and similar for others)
ALTER TABLE public.academic_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work visibility" ON public.academic_works
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR public.is_approver() OR public.is_operator());

CREATE POLICY "Work updates" ON public.academic_works
    FOR UPDATE USING (
        (auth.uid() = user_id AND status = 'pending') -- User can edit if not approved yet
        OR public.is_admin() -- Admin can always edit
        OR public.is_operator() -- Operator can edit
    );

-- 6. RPC for AI Notes Search (Helper)
-- This function allows the frontend to fetch all notes for a user to pass to Gemini
CREATE OR REPLACE FUNCTION get_notes_for_ai(p_user_id uuid)
RETURNS SETOF personal_notes AS $$
BEGIN
    RETURN QUERY SELECT * FROM personal_notes WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
