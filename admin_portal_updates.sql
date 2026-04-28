-- Admin Portal SQL Updates
-- Run this in your SQL Editor

-- 1. Add password_hash column to admin_users table
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Insert a default super admin (Email: admin@rishtawaala.com, Password: admin123)
-- Only if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'admin@rishtawaala.com') THEN
        INSERT INTO public.admin_users (name, email, role, password_hash, is_active)
        VALUES (
            'Super Admin', 
            'admin@rishtawaala.com', 
            'superadmin', 
            crypt('admin123', gen_salt('bf')), 
            true
        );
    END IF;
END $$;

-- 4. Create function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_email TEXT, p_password TEXT)
RETURNS TABLE (id UUID, name TEXT, email TEXT, role TEXT, is_active BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.name, au.email, au.role, au.is_active
    FROM public.admin_users au
    WHERE au.email = p_email
      AND au.password_hash = crypt(p_password, au.password_hash)
      AND au.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Audit Log for admin login tracking
-- Already exists in schema, just ensuring table is ready
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
