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
