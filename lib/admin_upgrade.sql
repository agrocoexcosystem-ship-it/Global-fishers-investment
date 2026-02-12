-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENHANCED USER PROFILES (Add columns to existing profiles table)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
ADD COLUMN IF NOT EXISTS kyc_document_url TEXT,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS automated_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'user'; -- user, support, finance, admin, super_admin

-- 2. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- e.g., 'UPDATE_USER', 'APPROVE_WITHDRAWAL'
    target_resource TEXT NOT NULL, -- e.g., 'user:123', 'transaction:456'
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, pending, resolved, closed
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    response_log JSONB[] DEFAULT '{}' -- Array of responses
);

-- 4. FRAUD ALERTS
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    trigger_rule TEXT NOT NULL, -- e.g., 'RAPID_WITHDRAWALS'
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    details JSONB,
    status TEXT DEFAULT 'new', -- new, investigating, resolved, false_positive
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN NOTES
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_user_id UUID REFERENCES auth.users(id),
    admin_id UUID REFERENCES auth.users(id),
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTOMATION RULES
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- e.g., 'NEW_DEPOSIT', 'LOGIN'
    conditions JSONB NOT NULL, -- e.g., { "amount_gt": 10000 }
    actions JSONB NOT NULL, -- e.g., { "flag_user": true, "notify_admin": true }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KYC REQUESTS (Separate table for tracking history)
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    document_type TEXT NOT NULL,
    document_urls TEXT[] NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for this upgrade context - assumming admin access checks in App logic or subsequent policies)

-- Admins can view all audit logs
CREATE POLICY "Admins view audit logs" ON public.admin_audit_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'support', 'finance')));
CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'support', 'finance')));

-- Support Tickets: Users see their own, Admins see all
CREATE POLICY "Users view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all tickets" ON public.support_tickets FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'support')));
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'support')));

-- Fraud Alerts: Admins only
CREATE POLICY "Admins manage fraud alerts" ON public.fraud_alerts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'compliance')));

-- Admin Notes: Admins only
CREATE POLICY "Admins manage notes" ON public.admin_notes FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'support', 'finance')));

-- Automation Rules: Admins only
CREATE POLICY "Admins manage automation" ON public.automation_rules FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin')));

-- KYC Requests: Users view own, Admins view all
CREATE POLICY "Users view own kyc" ON public.kyc_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all kyc" ON public.kyc_requests FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE admin_role IN ('admin', 'super_admin', 'compliance')));
