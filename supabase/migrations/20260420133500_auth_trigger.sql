-- KithLy: Identity Safeguard Trigger
-- Ensures every auth.users record has a corresponding public.profiles entry,
-- making it impossible to have orphaned users due to frontend failures.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  );
  return new;
end;
$$;

-- Trigger execution on auth.users (managed by Supabase)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
