-- PT Cipta Solusi Techindo Ecommerce Seed
-- Run this file after schema.sql

insert into public.brands (name, slug, sort_order, is_active)
values
  ('Dell Technologies', 'dell-technologies', 1, true),
  ('HPE', 'hpe', 2, true),
  ('Lenovo', 'lenovo', 3, true),
  ('Asus', 'asus', 4, true),
  ('Synology', 'synology', 5, true),
  ('Supermicro', 'supermicro', 6, true),
  ('Mikrotik', 'mikrotik', 7, true),
  ('Cisco', 'cisco', 8, true),
  ('Fortinet', 'fortinet', 9, true),
  ('APC', 'apc', 10, true),
  ('Microsoft', 'microsoft', 11, true),
  ('VMware', 'vmware', 12, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.categories (name, slug, sort_order, is_active)
values
  ('PC Desktop', 'pc-desktop', 1, true),
  ('Laptop', 'laptop', 2, true),
  ('Workstation', 'workstation', 3, true),
  ('Server', 'server', 4, true),
  ('Storage', 'storage', 5, true),
  ('Networking', 'networking', 6, true),
  ('Accessories', 'accessories', 7, true),
  ('UPS & Power', 'ups-power', 8, true),
  ('Software License', 'software-license', 9, true),
  ('Security Appliance', 'security-appliance', 10, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

do $$
declare
  v_brand_dell uuid;
  v_cat_pc uuid;
  v_cat_laptop uuid;
  v_cat_workstation uuid;
  v_cat_server uuid;
  v_cat_storage uuid;

  n_pc uuid;
  n_pc_tower uuid;
  n_laptop uuid;
  n_workstation uuid;
  n_server uuid;
  n_srv_rack uuid;
  n_srv_rack_1 uuid;
  n_srv_rack_2 uuid;
  n_srv_rack_4 uuid;
  n_storage uuid;
  n_powerstore uuid;
  n_powerscale uuid;
  n_powerprotect uuid;
begin
  select id into v_brand_dell from public.brands where slug = 'dell-technologies';
  select id into v_cat_pc from public.categories where slug = 'pc-desktop';
  select id into v_cat_laptop from public.categories where slug = 'laptop';
  select id into v_cat_workstation from public.categories where slug = 'workstation';
  select id into v_cat_server from public.categories where slug = 'server';
  select id into v_cat_storage from public.categories where slug = 'storage';

  delete from public.product_taxonomy where brand_id = v_brand_dell;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values (v_brand_dell, v_cat_pc, null, 'brand_category', 'PC Desktop', 'pc-desktop', 1, true)
  returning id into n_pc;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_pc, n_pc, 'subcategory', 'Tower', 'tower', 1, true),
    (v_brand_dell, v_cat_pc, n_pc, 'subcategory', 'All-in-One', 'all-in-one', 2, true),
    (v_brand_dell, v_cat_pc, n_pc, 'subcategory', 'Slim', 'slim', 3, true);

  select id into n_pc_tower from public.product_taxonomy
  where brand_id = v_brand_dell and category_id = v_cat_pc and parent_id = n_pc and slug = 'tower';

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_pc, n_pc_tower, 'type', 'Dell Tower', 'dell-tower', 1, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'type', 'Dell Pro', 'dell-pro', 2, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'type', 'Dell Pro Max', 'dell-pro-max', 3, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'series', 'Dell Pro 5 Micro', 'dell-pro-5-micro', 4, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'series', 'Dell Pro Max Tower T2', 'dell-pro-max-tower-t2', 5, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'series', 'Dell Pro Max Slim', 'dell-pro-max-slim', 6, true),
    (v_brand_dell, v_cat_pc, n_pc_tower, 'series', 'Dell Pro Max Micro', 'dell-pro-max-micro', 7, true),
    (v_brand_dell, v_cat_pc, n_pc, 'series', 'Dell 24 All-in-One', 'dell-24-all-in-one', 8, true),
    (v_brand_dell, v_cat_pc, n_pc, 'series', 'Dell Slim Desktop', 'dell-slim-desktop', 9, true);

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values (v_brand_dell, v_cat_laptop, null, 'brand_category', 'Laptop', 'laptop', 1, true)
  returning id into n_laptop;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_laptop, n_laptop, 'subcategory', 'Dell Pro', 'dell-pro', 1, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'subcategory', 'XPS', 'xps', 2, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'subcategory', 'Dell Plus', 'dell-plus', 3, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'subcategory', 'Dell', 'dell', 4, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell Pro 3', 'dell-pro-3', 5, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell Pro 5', 'dell-pro-5', 6, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell Pro 7', 'dell-pro-7', 7, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell Pro Premium', 'dell-pro-premium', 8, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'XPS 14', 'xps-14', 9, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell 16 Plus Intel', 'dell-16-plus-intel', 10, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell 16 Plus AMD', 'dell-16-plus-amd', 11, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell 15 Intel', 'dell-15-intel', 12, true),
    (v_brand_dell, v_cat_laptop, n_laptop, 'series', 'Dell 15 AMD', 'dell-15-amd', 13, true);

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values (v_brand_dell, v_cat_workstation, null, 'brand_category', 'Workstation', 'workstation', 1, true)
  returning id into n_workstation;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_workstation, n_workstation, 'subcategory', 'Tower', 'tower', 1, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'subcategory', 'Rackmount', 'rackmount', 2, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'subcategory', 'Laptop', 'laptop', 3, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'series', 'Precision 3680 Tower', 'precision-3680-tower', 4, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'series', 'Precision 5860 Tower', 'precision-5860-tower', 5, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'series', 'Precision 7960 Rackmount', 'precision-7960-rackmount', 6, true),
    (v_brand_dell, v_cat_workstation, n_workstation, 'series', 'Dell Precision 5690 16', 'dell-precision-5690-16', 7, true);

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values (v_brand_dell, v_cat_server, null, 'brand_category', 'Server', 'server', 1, true)
  returning id into n_server;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_server, n_server, 'subcategory', 'Data Center Tower Server', 'data-center-tower-server', 1, true),
    (v_brand_dell, v_cat_server, n_server, 'subcategory', 'Data Center Rackmount Server', 'data-center-rackmount-server', 2, true),
    (v_brand_dell, v_cat_server, n_server, 'subcategory', 'AI Server', 'ai-server', 3, true),
    (v_brand_dell, v_cat_server, n_server, 'subcategory', 'Edge Server', 'edge-server', 4, true);

  select id into n_srv_rack from public.product_taxonomy
  where brand_id = v_brand_dell and category_id = v_cat_server and parent_id = n_server and slug = 'data-center-rackmount-server';

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_server, n_srv_rack, 'type', '1-socket', '1-socket', 1, true),
    (v_brand_dell, v_cat_server, n_srv_rack, 'type', '2-socket', '2-socket', 2, true),
    (v_brand_dell, v_cat_server, n_srv_rack, 'type', '4-socket', '4-socket', 3, true);

  select id into n_srv_rack_1 from public.product_taxonomy where parent_id = n_srv_rack and slug = '1-socket';
  select id into n_srv_rack_2 from public.product_taxonomy where parent_id = n_srv_rack and slug = '2-socket';
  select id into n_srv_rack_4 from public.product_taxonomy where parent_id = n_srv_rack and slug = '4-socket';

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_server, n_srv_rack_1, 'series', 'PowerEdge R570 (Intel)', 'poweredge-r570-intel', 1, true),
    (v_brand_dell, v_cat_server, n_srv_rack_1, 'series', 'PowerEdge R470 (Intel)', 'poweredge-r470-intel', 2, true),
    (v_brand_dell, v_cat_server, n_srv_rack_1, 'series', 'PowerEdge R7715 (AMD)', 'poweredge-r7715-amd', 3, true),
    (v_brand_dell, v_cat_server, n_srv_rack_2, 'series', 'PowerEdge R760 (Intel)', 'poweredge-r760-intel', 4, true),
    (v_brand_dell, v_cat_server, n_srv_rack_2, 'series', 'PowerEdge R660 (Intel)', 'poweredge-r660-intel', 5, true),
    (v_brand_dell, v_cat_server, n_srv_rack_2, 'series', 'PowerEdge R7725 (AMD)', 'poweredge-r7725-amd', 6, true),
    (v_brand_dell, v_cat_server, n_srv_rack_4, 'series', 'PowerEdge R860 (Intel)', 'poweredge-r860-intel', 7, true),
    (v_brand_dell, v_cat_server, n_srv_rack_4, 'series', 'PowerEdge R960 (Intel)', 'poweredge-r960-intel', 8, true);

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values (v_brand_dell, v_cat_storage, null, 'brand_category', 'Storage', 'storage', 1, true)
  returning id into n_storage;

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_storage, n_storage, 'subcategory', 'PowerStore', 'powerstore', 1, true),
    (v_brand_dell, v_cat_storage, n_storage, 'subcategory', 'PowerScale', 'powerscale', 2, true),
    (v_brand_dell, v_cat_storage, n_storage, 'subcategory', 'PowerProtect', 'powerprotect', 3, true);

  select id into n_powerstore from public.product_taxonomy where parent_id = n_storage and slug = 'powerstore';
  select id into n_powerscale from public.product_taxonomy where parent_id = n_storage and slug = 'powerscale';
  select id into n_powerprotect from public.product_taxonomy where parent_id = n_storage and slug = 'powerprotect';

  insert into public.product_taxonomy (brand_id, category_id, parent_id, level, name, slug, sort_order, is_active)
  values
    (v_brand_dell, v_cat_storage, n_powerstore, 'series', 'PowerStore 500T', 'powerstore-500t', 1, true),
    (v_brand_dell, v_cat_storage, n_powerstore, 'series', 'PowerStore 3200T', 'powerstore-3200t', 2, true),
    (v_brand_dell, v_cat_storage, n_powerstore, 'series', 'PowerStore 9200T', 'powerstore-9200t', 3, true),
    (v_brand_dell, v_cat_storage, n_powerscale, 'type', 'All-flash', 'all-flash', 4, true),
    (v_brand_dell, v_cat_storage, n_powerscale, 'type', 'Archive', 'archive', 5, true),
    (v_brand_dell, v_cat_storage, n_powerscale, 'type', 'Hybrid', 'hybrid', 6, true),
    (v_brand_dell, v_cat_storage, n_powerprotect, 'type', 'Data Manager', 'data-manager', 7, true),
    (v_brand_dell, v_cat_storage, n_powerprotect, 'type', 'Data Domain', 'data-domain', 8, true),
    (v_brand_dell, v_cat_storage, n_powerprotect, 'series', 'Cyber Recovery', 'cyber-recovery', 9, true),
    (v_brand_dell, v_cat_storage, n_powerprotect, 'series', 'Backup Services', 'backup-services', 10, true);
end
$$;

insert into public.products (
  brand_id,
  category_id,
  taxonomy_id,
  sku,
  name,
  slug,
  short_description,
  description,
  price,
  compare_at_price,
  stock_quantity,
  is_featured,
  is_best_seller,
  is_promo,
  is_active,
  badge,
  sort_order
)
select
  b.id,
  c.id,
  t.id,
  v.sku,
  v.name,
  v.slug,
  v.short_description,
  v.description,
  v.price,
  v.compare_at_price,
  v.stock_quantity,
  v.is_featured,
  v.is_best_seller,
  v.is_promo,
  true,
  v.badge,
  v.sort_order
from (
  values
    ('DL-SRV-R760', 'Dell PowerEdge R760 Server', 'dell-poweredge-r760-server', 'Enterprise rack server 2-socket', 'Server rackmount enterprise untuk data center modern.', 87500000::numeric, 92500000::numeric, 8, true, true, true, 'Best Seller', 1, 'dell-technologies', 'server', 'poweredge-r760-intel'),
    ('DL-LTP-PRO7', 'Dell Pro 7 Business Laptop', 'dell-pro-7-business-laptop', 'Laptop bisnis premium', 'Laptop bisnis dengan durabilitas tinggi dan keamanan enterprise.', 27900000::numeric, 29900000::numeric, 24, true, false, true, 'Promo', 2, 'dell-technologies', 'laptop', 'dell-pro-7'),
    ('DL-WKS-5860', 'Dell Precision 5860 Tower', 'dell-precision-5860-tower', 'Workstation performa tinggi', 'Workstation untuk CAD, render, dan analitik skala enterprise.', 64500000::numeric, 68900000::numeric, 6, false, true, false, 'Best Seller', 3, 'dell-technologies', 'workstation', 'precision-5860-tower'),
    ('DL-STR-500T', 'PowerStore 500T', 'powerstore-500t', 'Storage all-flash entry enterprise', 'Storage platform scalable untuk workload bisnis kritikal.', 132500000::numeric, 138000000::numeric, 4, true, false, false, 'New', 4, 'dell-technologies', 'storage', 'powerstore-500t'),
    ('CS-SW-48P', 'Cisco Managed Switch 48 Port', 'cisco-managed-switch-48-port', 'Managed switch enterprise', 'Switching enterprise untuk jaringan kantor dan data center.', 18250000::numeric, 19500000::numeric, 18, false, true, true, 'Promo', 5, 'cisco', 'networking', null)
) as v(
  sku,
  name,
  slug,
  short_description,
  description,
  price,
  compare_at_price,
  stock_quantity,
  is_featured,
  is_best_seller,
  is_promo,
  badge,
  sort_order,
  brand_slug,
  category_slug,
  taxonomy_slug
)
join public.brands b on b.slug = v.brand_slug
join public.categories c on c.slug = v.category_slug
left join public.product_taxonomy t on t.slug = v.taxonomy_slug and t.brand_id = b.id and t.category_id = c.id
on conflict (slug) do update
set name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    stock_quantity = excluded.stock_quantity,
    is_featured = excluded.is_featured,
    is_best_seller = excluded.is_best_seller,
    is_promo = excluded.is_promo,
    badge = excluded.badge,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.homepage_banners (
  title, subtitle, description, image_url, cta_label, cta_href, placement, badge, price_text, sort_order, is_active
)
values
  ('Enterprise IT Hardware', 'Infrastructure Ready for Business', 'From endpoint hingga data center untuk operasional enterprise.', null, 'Shop now', '/products', 'hero', 'Top Deal', 'From Rp 2.870.000', 1, true),
  ('Server Deals', 'Rackmount & Tower Solutions', 'Promo perangkat server untuk ekspansi bisnis.', null, 'View deal', '/products/server', 'side_promo', 'SALE', null, 1, true),
  ('Networking Deals', 'Switching, Routing, Wireless', 'Solusi jaringan untuk kantor dan cabang.', null, 'View deal', '/products/networking', 'side_promo', 'PROMO', null, 2, true),
  ('Upgrade & SAVE BIG on Enterprise IT Infrastructure', null, 'Dapatkan penawaran server, storage, networking, dan support profesional.', null, 'Shop now', '/solutions', 'middle_promo', 'Limited Offer', null, 1, true),
  ('Need Complete IT Infrastructure for Your Business?', null, 'Konsultasikan kebutuhan server, storage, networking, endpoint, dan security.', null, 'Konsultasi Sekarang', '/contact', 'bottom_cta', null, null, 1, true)
on conflict do nothing;

insert into public.homepage_sections (section_key, title, subtitle, description, is_active, sort_order)
values
  ('hero', 'Enterprise IT Products & Infrastructure Solutions', null, 'Section hero utama homepage ecommerce.', true, 1),
  ('deal_of_the_day', 'Deal Of The Day', null, 'Section promosi harian untuk produk unggulan.', true, 2),
  ('featured_products', 'Featured Products', null, 'Produk pilihan dengan badge promo dan best seller.', true, 3),
  ('best_seller', 'Best Seller', null, 'Produk populer dengan performa penjualan tinggi.', true, 4),
  ('solutions_cta', 'Need Complete IT Infrastructure for Your Business?', null, 'CTA konsultasi kebutuhan infrastruktur enterprise.', true, 5)
on conflict (section_key) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    description = excluded.description,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.company_settings (key, value)
values
  ('company_profile', '{"name":"PT Cipta Solusi Techindo","tagline":"Enterprise IT Products & Infrastructure Solutions","description":"Partner pengadaan IT enterprise untuk bisnis, data center, dan transformasi digital."}'::jsonb),
  ('contact_info', '{"email":"sales@cst.co.id","phone":"+62 811-9000-221","address":"Jakarta, Indonesia"}'::jsonb),
  ('social_links', '{"linkedin":"#","instagram":"#","youtube":"#"}'::jsonb),
  ('header_settings', '{"show_top_bar":true,"show_search":true,"show_cart":true}'::jsonb),
  ('footer_settings', '{"copyright":"PT Cipta Solusi Techindo","year":"2026"}'::jsonb)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();
