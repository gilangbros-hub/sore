# Senjakala Reading

Situs bacaan tarot, garis tangan, dan aura. Next.js 16 (App Router) + Tailwind, Supabase (database), deploy di Vercel. Semua di tier gratis.

## Alur

1. Pembeli pilih paket di beranda → diarahkan ke halaman produk Lynk.id → bayar.
2. Lynk.id kirim webhook ke `/api/lynk/webhook` (signature divalidasi). Situs mengambil satu kode dari stok (paket = 3 kode) dan mencatat nama, email, dan nomor HP pembeli.
3. Di `/admin`, pesanan muncul di **Kirim kode ke pembeli**. Klik **Buka WhatsApp & kirim kode**: pesan berisi kode dan link progres sudah terisi.
4. Pembeli masukkan kode di `/kode` → halaman progres `/status/[kode]`. Di situ ada daftar data yang perlu dikirim, panduan foto, dan tombol WhatsApp dengan template pesan.
5. Data dan foto masuk lewat WhatsApp. Di admin isi nama panggilan (dan fokus untuk tarot), klik **Data sudah diterima** → progres pembeli pindah ke "sedang disiapkan".
6. Tulis bacaan, **Terbitkan**, lalu **Buka WhatsApp & kirim link**.
7. Pembeli buka `/b/[token]`, ada tombol WhatsApp untuk ngobrol soal bacaannya. Link aktif 30 hari, setelah itu data pribadi dihapus otomatis.

## Setup (sekali)

### 1. Supabase
1. Buat project di supabase.com, region **Southeast Asia (Singapore)**.
2. SQL Editor → tempel isi `supabase/schema.sql` → Run.
3. Project Settings → API Keys: catat Project URL dan secret key.

### 2. Vercel
1. Import repo ini di vercel.com → New Project.
2. Isi Environment Variables sesuai `.env.example`. Secret acak: `openssl rand -hex 24`.
3. Deploy. Domain (`https://senjakala.vercel.app`) di-hardcode di `src/lib/config.ts`.

Cron harian di `vercel.json` menghapus data bacaan yang lewat 30 hari, sekaligus menjaga project Supabase gratis tidak di-pause.

### 3. Lynk.id
1. Lynk.id → Settings → Integrations → Webhook. URL: `https://<domain>/api/lynk/webhook`
2. Simpan, lalu salin **merchant key** yang muncul ke env `LYNK_MERCHANT_KEY` dan redeploy.
3. Wajibkan nomor WhatsApp pembeli di checkout Lynk (kode dikirim ke nomor itu).
4. Nama produk di Lynk harus mengandung kata `tarot`, `garis tangan`, `aura`, atau `paket`. Kalau tidak, isi `LYNK_PRODUCT_MAP`.
5. Link produk Lynk dan nomor WhatsApp di-hardcode di `src/lib/config.ts` (`LYNK_URL`, `WA_NUMBER`).

Opsional: tambahkan "Additional Questions" di produk Lynk (misalnya nama panggilan, pertanyaan tarot). Jawabannya tampil di halaman pesanan admin.

## Stok kode

Buat stok di panel **Stok kode** di admin. Webhook mengambil kode tertua; kalau stok habis, kode baru dibuat otomatis. Kode stok yang kamu berikan langsung ke orang aktif sendiri saat pertama dimasukkan di `/kode`. Pembayaran di luar Lynk: pakai **Jual manual**.

## Mengubah harga dan jam operasional

Harga, link Lynk, dan nomor WhatsApp: `src/lib/config.ts`. Jam: env `NEXT_PUBLIC_JAM_TUTUP` / `NEXT_PUBLIC_JAM_BUKA`. Semua template pesan WhatsApp: `src/lib/wa.ts`.

## Develop lokal

```bash
npm install
cp .env.example .env.local   # isi
npm run dev
```

Supabase lokal (butuh Docker): `npx supabase start`, lalu jalankan `supabase/schema.sql` ke `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
