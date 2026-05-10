-- PT Cipta Solusi Techindo Ecommerce Schema
-- Run this file first in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_taxonomy (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  parent_id uuid references public.product_taxonomy(id) on delete cascade,
  level text not null check (level in ('brand_category', 'subcategory', 'type', 'series', 'product_line')),
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_product_taxonomy_scope_slug
on public.product_taxonomy (
  brand_id,
  category_id,
  coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
  level,
  slug
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  taxonomy_id uuid references public.product_taxonomy(id) on delete set null,
  sku text unique,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(14,2),
  compare_at_price numeric(14,2),
  currency text not null default 'IDR',
  stock_quantity integer not null default 0,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_promo boolean not null default false,
  is_active boolean not null default true,
  badge text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  image_url text,
  cta_label text,
  cta_href text,
  placement text not null check (placement in ('hero', 'side_promo', 'middle_promo', 'bottom_cta')),
  badge text,
  price_text text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  subtitle text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  subject text,
  message text not null,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null unique,
  name text,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_brands_active_order on public.brands(is_active, sort_order);
create index if not exists idx_categories_active_order on public.categories(is_active, sort_order);
create index if not exists idx_taxonomy_parent on public.product_taxonomy(parent_id);
create index if not exists idx_taxonomy_brand_category on public.product_taxonomy(brand_id, category_id);
create index if not exists idx_products_active_order on public.products(is_active, sort_order);
create index if not exists idx_products_flags on public.products(is_featured, is_best_seller, is_promo);
create index if not exists idx_product_images_product on public.product_images(product_id, sort_order);
create index if not exists idx_homepage_banners_placement on public.homepage_banners(placement, is_active, sort_order);
create index if not exists idx_homepage_sections_active_order on public.homepage_sections(is_active, sort_order);
create index if not exists idx_inquiries_status_created on public.inquiries(status, created_at desc);
create index if not exists idx_admin_users_active_role on public.admin_users(is_active, role);

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_taxonomy_updated_at on public.product_taxonomy;
create trigger trg_taxonomy_updated_at before update on public.product_taxonomy
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_homepage_banners_updated_at on public.homepage_banners;
create trigger trg_homepage_banners_updated_at before update on public.homepage_banners
for each row execute function public.set_updated_at();

drop trigger if exists trg_homepage_sections_updated_at on public.homepage_sections;
create trigger trg_homepage_sections_updated_at before update on public.homepage_sections
for each row execute function public.set_updated_at();

drop trigger if exists trg_company_settings_updated_at on public.company_settings;
create trigger trg_company_settings_updated_at before update on public.company_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.product_taxonomy enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.homepage_banners enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.company_settings enable row level security;
alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public can read active brands" on public.brands;
create policy "public can read active brands" on public.brands
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read active categories" on public.categories;
create policy "public can read active categories" on public.categories
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read active taxonomy" on public.product_taxonomy;
create policy "public can read active taxonomy" on public.product_taxonomy
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read product images for active products" on public.product_images;
create policy "public can read product images for active products" on public.product_images
for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.is_active = true
  )
);

drop policy if exists "public can read active homepage banners" on public.homepage_banners;
create policy "public can read active homepage banners" on public.homepage_banners
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read active homepage sections" on public.homepage_sections;
create policy "public can read active homepage sections" on public.homepage_sections
for select to anon, authenticated
using (is_active = true);

drop policy if exists "public can read allowed company settings" on public.company_settings;
create policy "public can read allowed company settings" on public.company_settings
for select to anon, authenticated
using (key in ('company_profile', 'contact_info', 'social_links', 'header_settings', 'footer_settings'));

drop policy if exists "public can insert inquiries" on public.inquiries;
create policy "public can insert inquiries" on public.inquiries
for insert to anon, authenticated
with check (true);

-- No public update/delete policies are created by design.
