# Web Cipta

Project ini adalah aplikasi [Next.js](https://nextjs.org) dengan **App Router** dan **TypeScript**.

## Struktur Source

- Source code berada di folder `src/`.
- Entrypoint utama halaman ada di `src/app/page.tsx`.
- Entrypoint utama layout aplikasi ada di `src/app/layout.tsx`.

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

App akan berjalan di `http://localhost:3000`.

## Build dan Run Production

Build untuk production:

```bash
npm run build
```

Menjalankan hasil build production:

```bash
npm run start
```

## Lint

Menjalankan ESLint:

```bash
npm run lint
```

## Supabase Setup

1. Buat project baru di dashboard Supabase.
2. Ambil **Project URL** dari dashboard Supabase:
   - Masuk ke project Anda
   - Buka `Settings` -> `API`
   - Salin nilai `Project URL`
3. Ambil **Anon/Public Key** dari dashboard Supabase:
   - Masih di `Settings` -> `API`
   - Salin nilai `anon public`
4. Buat file `.env.local` secara manual di root project.
5. Isi `.env.local` dengan format berikut (tanpa value asli di repository):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

6. Pastikan `.env.local` tidak di-commit ke GitHub.
7. Setelah `.env.local` siap, jalankan development server:

```bash
npm run dev
```

## Supabase Storage Setup

Untuk upload gambar product/banner, gunakan bucket:

- `ecommerce-assets`

Langkah setup di Supabase Dashboard:

1. Buka menu `Storage` -> `Buckets`.
2. Buat bucket baru dengan nama `ecommerce-assets`.
3. Untuk development, bucket boleh diset `Public` agar URL gambar bisa langsung ditampilkan di website.
4. Jalankan SQL policy storage dari file berikut di Supabase SQL Editor:

```bash
supabase/storage-policies.sql
```

Catatan policy:

- Public read diperbolehkan untuk object di bucket `ecommerce-assets`.
- Upload/update/delete disarankan `authenticated` only.
- Jangan gunakan service role key di frontend.
- Untuk production, disarankan gunakan auth admin + policy lebih ketat (role-based).

## Admin Auth Setup

Admin Dashboard sekarang menggunakan Supabase Auth + tabel `public.admin_users`.

### 1) Buat user di Supabase Auth

1. Buka `Authentication` -> `Users`.
2. Tambahkan user admin (email + password) dari dashboard Supabase.

### 2) Daftarkan user ke tabel `public.admin_users`

Setelah user dibuat di Auth, ambil `user id` (UUID) dari tabel users, lalu insert ke `public.admin_users`.

Contoh SQL:

```sql
insert into public.admin_users (user_id, email, name, role, is_active)
values ('AUTH_USER_ID_DARI_SUPABASE', 'admin@email.com', 'Admin', 'admin', true);
```

### 3) Tambahkan Redirect URL reset password

Di Supabase Dashboard, buka `Authentication` -> `URL Configuration`, lalu tambahkan:

- `http://localhost:3000/admin/reset-password`
- `https://domain-anda.com/admin/reset-password` (untuk production nanti)

### 4) Alur akses admin

- Route login: `/admin/login`
- Jika belum login dan akses `/admin`, otomatis redirect ke login.
- Setelah login, sistem cek user aktif di `public.admin_users`.
- Jika tidak terdaftar / tidak aktif, akses ditolak dan user di-sign out.

Catatan keamanan:

- Jangan gunakan service role key di frontend.
- Jangan buat public write policy untuk `admin_users`.
