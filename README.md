# Ruang Senja

Situs bacaan tarot, garis tangan, dan aura. Next.js 16 (App Router) + Tailwind, Supabase (database + penyimpanan foto), deploy di Vercel. Semua di tier gratis.

## Alur

1. Pembeli pilih bacaan di beranda, bayar di Lynk.id.
2. Lynk.id kirim webhook ke `/api/lynk/webhook`. Situs membuat kode akses per produk (paket = 3 kode) dan menyimpannya dengan email pembeli.
3. Pembeli buka `/klaim`, masukkan email Lynk.id, dapat kodenya. Atau `/kode` kalau sudah punya.
4. Pembeli isi data di `/isi/[kode]` (foto langsung ke Supabase Storage, diperkecil dan EXIF dibuang di browser).
5. Kamu tulis hasilnya di `/admin`, klik **Terbitkan**, lalu **Buka WhatsApp & kirim** (pesan sudah terisi).
6. Pembeli buka `/b/[token]`. Bisa dibuka lagi selama 30 hari, lalu datanya dihapus otomatis. Foto dihapus setelah 24 jam.

## Setup (sekali)

### 1. Supabase

1. Buat project di supabase.com (pilih region **Southeast Asia (Singapore)**).
2. SQL Editor → tempel isi `supabase/schema.sql` → Run.
3. Project Settings → API Keys: catat URL, publishable key, dan secret key.

### 2. Vercel

1. Import repo ini di vercel.com → New Project.
2. Isi Environment Variables sesuai `.env.example`. Minimal: `NEXT_PUBLIC_SITE_URL`, tiga variabel Supabase, `ADMIN_PASSWORD` (min. 12 karakter), `CRON_SECRET`, `LYNK_WEBHOOK_SECRET`. Buat secret pakai `openssl rand -hex 24`.
3. Deploy. Setelah dapat domain, update `NEXT_PUBLIC_SITE_URL` lalu redeploy.

### 3. Cleanup per jam

Vercel Hobby cuma boleh cron harian (sudah ada di `vercel.json` sebagai cadangan). Supaya janji "foto dihapus dalam 24 jam" tepat:

1. Supabase → Database → Extensions: aktifkan `pg_cron` dan `pg_net`.
2. Jalankan blok `cron.schedule` di bagian bawah `supabase/schema.sql` setelah mengganti `YOUR_SITE` dan `YOUR_CRON_SECRET`.

Ini juga menjaga project Supabase gratis tidak di-pause karena tidak aktif.

### 4. Lynk.id

1. Lynk.id → Settings → Integrations → Webhook. URL: `https://<domain>/api/lynk/webhook?key=<LYNK_WEBHOOK_SECRET>`
2. Klik Test URL, lalu cek panel **Webhook Lynk.id** di `/admin`. Payload mentah tersimpan di sana.
3. Di deskripsi/pesan terima kasih tiap produk Lynk, arahkan pembeli ke `https://<domain>/klaim`.
4. Kalau nama produk Lynk tidak mengandung kata tarot / garis tangan / aura / paket, isi `LYNK_PRODUCT_MAP`.
5. Isi `NEXT_PUBLIC_LYNK_URL_*` dan `NEXT_PUBLIC_WA_NUMBER`, lalu redeploy.

Kalau webhook gagal dikenali, statusnya `unmatched` di admin. Buat kodenya manual di panel **Buat kode manual** dengan email pembeli, lalu pembeli tetap bisa klaim di `/klaim`.

## Mengubah harga dan jam operasional

Harga: `src/lib/config.ts` (`PRICES`). Jam tutup/buka: env `NEXT_PUBLIC_JAM_TUTUP` / `NEXT_PUBLIC_JAM_BUKA`.

## Develop lokal

```bash
npm install
cp .env.example .env.local   # isi
npm run dev
```

Supabase lokal (butuh Docker): `npx supabase start`, lalu jalankan `supabase/schema.sql` ke `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
