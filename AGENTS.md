# AGENTS

## Repo at a glance
- Single-package Next.js app (no monorepo) using App Router with sources under `src/`.
- Main route entrypoints are `src/app/layout.tsx` and `src/app/page.tsx`.

## Verified commands
- Install deps: `npm install`
- Dev server: `npm run dev` (serves at `http://localhost:3000`)
- Production build: `npm run build`
- Start built app: `npm run start`
- Lint: `npm run lint`

## Tooling and conventions that matter
- TypeScript path alias is configured as `@/* -> ./src/*` in `tsconfig.json`; prefer alias imports for app code.
- ESLint config is flat config in `eslint.config.mjs`, extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Tailwind is v4-style setup via `@import "tailwindcss"` in `src/app/globals.css` and `@tailwindcss/postcss` in `postcss.config.mjs`.
- `README.md` still mentions editing `app/page.tsx`, but this repo uses `src/app/page.tsx` (`--src-dir` scaffold).

## Scope boundaries
- No test framework is configured yet (no `test` script, no CI workflow in `.github/workflows`). Do not invent test commands; use lint/build for verification unless tests are added.

## Agent logging rules (mandatory)
- Semua agent wajib membaca `AGENT_LOG.md` sebelum melakukan perubahan apa pun.
- Setiap kali menerima instruksi user, agent wajib mencatat instruksi tersebut ke `AGENT_LOG.md`.
- Setiap file yang dibaca, dibuat, diubah, dan dihapus wajib dicatat.
- Setiap command terminal yang dijalankan wajib dicatat.
- Setiap error, warning, dan keputusan teknis wajib dicatat.
- Log lama tidak boleh dihapus atau ditimpa.
- Entri log baru harus ditambahkan di bagian paling atas agar log terbaru mudah dibaca.
- Semua timestamp wajib menggunakan timezone Asia/Jakarta (WIB).
- Format log harus konsisten mengikuti template di `AGENT_LOG.md`.

## Mandatory Agent Logging Rules
- Semua instruksi user wajib dicatat ke `AGENT_LOG.md`.
- Sebelum melakukan perubahan file, baca `AGENT_LOG.md` dan `AGENTS.md` terlebih dahulu.
- Setiap file yang dibaca, dibuat, diubah, atau dihapus wajib dicatat.
- Setiap command terminal yang dijalankan wajib dicatat.
- Setiap error, warning, keputusan teknis, atau asumsi penting wajib dicatat.
- Log baru harus selalu ditambahkan di bagian paling atas `AGENT_LOG.md`.
- Jangan pernah menghapus log lama.
- Gunakan timezone Asia/Jakarta / WIB.
- Jika tidak ada perubahan file, tetap catat bahwa tidak ada perubahan file.
- Jika tidak ada command terminal, tetap catat bahwa tidak ada command terminal.
- Setelah selesai task, update `AGENT_LOG.md` dengan status hasil dan next step.

## Project Infrastructure Rules
- Setiap perubahan frontend wajib dicatat sebagai kategori Frontend.
- Setiap perubahan backend wajib dicatat sebagai kategori Backend.
- Setiap perubahan API route, endpoint, middleware, atau server action wajib dicatat sebagai kategori API.
- Setiap perubahan database, schema, migration, ORM, seed, atau query wajib dicatat sebagai kategori Database.
- Setiap perubahan authentication, authorization, session, token, role, permission, atau security config wajib dicatat sebagai kategori Security.
- Setiap perubahan environment variable, `.env` example, config, secret handling, atau runtime config wajib dicatat sebagai kategori Configuration.
- Setiap perubahan `package.json`, dependency, npm package, build tool, lint tool, atau TypeScript config wajib dicatat sebagai kategori Dependency/Tooling.
- Setiap perubahan Docker, CI/CD, deployment, server, VPS, reverse proxy, Nginx, PM2, cloud, atau hosting wajib dicatat sebagai kategori Infrastructure/Deployment.
- Setiap perubahan dokumentasi, `README.md`, `AGENTS.md`, `AGENT_LOG.md`, atau technical note wajib dicatat sebagai kategori Documentation.
- Setiap perubahan UI/UX, layout, component, responsive design, styling, Tailwind, image, icon, atau asset wajib dicatat sebagai kategori UI/UX.
- Setiap perubahan testing, linting, build verification, QA, atau debugging wajib dicatat sebagai kategori Testing/QA.
- Jika task menyentuh lebih dari satu area, catat semua kategori yang relevan.

## Architecture Awareness Rules
- Sebelum membuat fitur baru, identifikasi apakah fitur termasuk frontend, backend, API, database, security, infrastructure, atau kombinasi beberapa area.
- Jangan mencampur logic frontend dan backend tanpa alasan teknis yang jelas.
- Untuk Next.js App Router, prioritaskan struktur yang rapi di bawah folder `src/`.
- Untuk komponen UI, gunakan pendekatan reusable component jika fitur berpotensi dipakai ulang.
- Untuk logic bisnis, pisahkan dari komponen UI jika logic mulai kompleks.
- Untuk API/backend, gunakan naming folder dan file yang konsisten.
- Untuk konfigurasi environment, jangan pernah menulis secret asli ke repository.
- Jika perlu file `.env`, gunakan `.env.example` untuk dokumentasi variable.
- Jika ada keputusan arsitektur penting, catat alasan teknisnya di `AGENT_LOG.md`.
- Jika ada risiko terhadap security, performance, maintainability, atau deployment, wajib dicatat di `AGENT_LOG.md`.
