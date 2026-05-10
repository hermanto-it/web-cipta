-- Supabase Storage setup for ecommerce assets
-- Run manually in Supabase SQL Editor after creating bucket.

-- 1) Create bucket (development: public)
insert into storage.buckets (id, name, public)
values ('ecommerce-assets', 'ecommerce-assets', true)
on conflict (id) do nothing;

-- 2) Public read for objects in ecommerce-assets
drop policy if exists "public read ecommerce assets" on storage.objects;
create policy "public read ecommerce assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'ecommerce-assets');

-- 3) Authenticated upload/update/delete (temporary until admin auth + role-based policy)
drop policy if exists "authenticated upload ecommerce assets" on storage.objects;
create policy "authenticated upload ecommerce assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'ecommerce-assets');

drop policy if exists "authenticated update ecommerce assets" on storage.objects;
create policy "authenticated update ecommerce assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'ecommerce-assets')
with check (bucket_id = 'ecommerce-assets');

drop policy if exists "authenticated delete ecommerce assets" on storage.objects;
create policy "authenticated delete ecommerce assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'ecommerce-assets');

-- NOTE:
-- If you need anonymous upload in local/dev without auth, add anon insert policy carefully.
-- Do not expose service-role key in frontend.
