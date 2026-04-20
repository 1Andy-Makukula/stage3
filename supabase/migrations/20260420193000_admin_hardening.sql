-- KGCC: Admin Hardening Migration
-- 1. Advertising Engine
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('featured_ribbon', 'global_alert', 'sidebar_promo')),
    content_json JSONB NOT NULL, -- Flexible content for different ad types
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Platform Security & Monitoring Alerts
CREATE TABLE IF NOT EXISTS public.platform_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    event_type TEXT NOT NULL, -- e.g., 'FAILED_HANDSHAKE_BATCH', 'SENSITIVE_DELETE'
    message TEXT NOT NULL,
    metadata JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shop Enhancements for Admin Logic
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS is_ghost BOOLEAN DEFAULT FALSE;

-- Enable RLS (though KGCC bypasses it, we keep it secure for other users)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access to ads" ON public.ads 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins full access to alerts" ON public.platform_alerts 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Public can see active ads
CREATE POLICY "Anyone can see active ads" ON public.ads
  FOR SELECT USING (is_active = true AND (ends_at IS NULL OR ends_at > NOW()));
