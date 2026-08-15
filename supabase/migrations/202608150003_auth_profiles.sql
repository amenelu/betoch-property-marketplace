-- Create the marketplace profile atomically when Supabase Auth creates a user.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare requested_role public.user_role;
begin
  requested_role := case when new.raw_user_meta_data->>'role' in ('buyer','owner','broker') then (new.raw_user_meta_data->>'role')::public.user_role else 'buyer'::public.user_role end;
  insert into public.profiles(id,name,role,email_verified,created_at,updated_at)
  values(new.id,coalesce(nullif(new.raw_user_meta_data->>'name',''),split_part(new.email,'@',1)),requested_role,new.email_confirmed_at is not null,now(),now())
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Admins can promote roles; users cannot self-promote through profile updates.
create policy "admins update profiles" on public.profiles for update using(public.is_admin()) with check(public.is_admin());
