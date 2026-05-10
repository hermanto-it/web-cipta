-- Inquiries RLS policy setup
-- Jalankan manual di Supabase SQL Editor.

alter table public.inquiries enable row level security;

drop policy if exists "public can insert inquiries" on public.inquiries;
create policy "public can insert inquiries" on public.inquiries
for insert to anon, authenticated
with check (true);

drop policy if exists "admin can read inquiries" on public.inquiries;
create policy "admin can read inquiries" on public.inquiries
for select to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.is_active = true
      and (au.user_id = auth.uid() or au.email = auth.email())
  )
);

drop policy if exists "admin can update inquiries" on public.inquiries;
create policy "admin can update inquiries" on public.inquiries
for update to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.is_active = true
      and (au.user_id = auth.uid() or au.email = auth.email())
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.is_active = true
      and (au.user_id = auth.uid() or au.email = auth.email())
  )
);
