-- KithLy: atomic handshake / escrow completion (PostgreSQL).
-- Apply after your `transactions`, `shops`, and ledger tables exist; rename columns to match your schema.
-- Call from Supabase client: supabase.rpc('kithly_complete_handshake_escrow', { ... })

begin;

create or replace function public.kithly_complete_handshake_escrow(
  p_transaction_id uuid,
  p_merchant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  -- Serialize concurrent claims on the same transaction
  perform pg_advisory_xact_lock(hashtext(p_transaction_id::text));

  update public.transactions t
  set
    status = 'completed',
    completed_at = coalesce(t.completed_at, now())
  where t.id = p_transaction_id
    and t.status = 'in_escrow'
    and exists (
      select 1 from public.shops s
      where s.id = t.shop_id
        and s.owner_id = p_merchant_id
    );

  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'kithly_escrow_invalid_state' using errcode = 'P0001';
  end if;

  -- Example: move balance to merchant ledger in the same transaction.
  -- insert into public.merchant_ledger (transaction_id, merchant_id, amount_zmw, kind)
  -- select t.id, p_merchant_id, t.amount_zmw, 'escrow_release'
  -- from public.transactions t where t.id = p_transaction_id;
end;
$$;

commit;



-- 1. Identity & Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Zambian Geography (10 Provinces / 110+ Districts)
CREATE TABLE districts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province_name TEXT NOT NULL,
  district_name TEXT NOT NULL UNIQUE
);

-- 3. Merchants & Shops
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  district_id UUID REFERENCES districts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Handshake Escrow Ledger
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  shop_id UUID REFERENCES shops(id),
  amount DECIMAL(12,2) NOT NULL,
  claim_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_escrow', 'completed', 'disputed', 'cancelled')),
  handshake_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT owner_id FROM shops WHERE id = transactions.shop_id));