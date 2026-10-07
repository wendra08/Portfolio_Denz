# Kang Denz Portfolio

Website Astro untuk Wedding MC, Nata Manten, Natsume Photo, MC Class, booking WhatsApp, dan journal.

## Development

Gunakan Node.js sesuai `engines` di package.json. Pada PowerShell yang membatasi script, gunakan `npm.cmd`.

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## Build dan pemeriksaan

```sh
npm run build
npm run audit:build
```

Audit membutuhkan Python 3 dan memeriksa HTML hasil build: heading utama, metadata, gambar beserta dimensi, ID duplikat, tautan internal, anchor, dan 404. Audit ini tidak menggantikan pemeriksaan browser desktop/mobile.

## Domain dan SEO

`SITE_URL` dapat diisi dengan origin HTTPS kustom tanpa path. Di Vercel, Astro otomatis memakai `VERCEL_PROJECT_PRODUCTION_URL` untuk `site` saat build, sehingga canonical, schema, sitemap, dan URL absolut Open Graph bisa menggunakan domain produksi `*.vercel.app` tanpa domain kustom. Pastikan **Automatically expose System Environment Variables** aktif pada pengaturan environment project Vercel. Untuk hosting lain, atur environment variable `SITE_URL`.

Tanpa `SITE_URL` atau domain produksi Vercel, canonical/schema URL tidak diterbitkan, gambar Open Graph memakai path relatif, serta sitemap belum berisi URL.

Metadata bersama ada di `src/layouts/BaseLayout.astro`. Artikel journal memakai judul, excerpt, cover, dan tanggalnya sendiri. Halaman `404.astro` menggunakan `noindex`; hosting perlu menyajikan `dist/404.html` dengan status HTTP 404, bukan fallback HTTP 200.

## Gambar dan identitas

```sh
npm run assets:prepare
```

Perintah ini memakai Sharp yang tersedia pada instalasi Astro untuk membuat WebP gambar utama, versi mobile, favicon PNG/ICO, kartu Open Graph JPG dari SVG, dan `src/data/image-sizes.json`. Foto sumber tetap disimpan. Jalankan lagi saat mengganti atau menambah gambar lokal yang dipakai komponen `Photo.astro`.

- Favicon: `public/favicon.svg`.
- Kartu berbagi: `public/images/og-kang-denz.svg` dan `.jpg` (1200 x 630).
- Gambar konten: `public/images/`.
- Video: `public/videos/`, dimuat setelah interaksi.
- Artikel: `src/content/journal/`.
- Portfolio: `src/data/portfolio.ts`. Data yang sama dipakai pada homepage, `/portfolio`, dan halaman detail `/portfolio/[slug]`. Ubah judul, foto, metadata, dan narasi di file ini; gunakan slug yang unik untuk setiap acara.

Lihat `docs/final-polish.md` untuk hasil pemeriksaan dan pekerjaan yang masih memerlukan data atau browser.

## Hosting ke Vercel

Proyek ini memakai Astro static output; Vercel mendeteksi Astro dan mengatur build/output secara otomatis, jadi tidak perlu adapter atau `vercel.json` khusus. [Dokumentasi Astro di Vercel](https://vercel.com/docs/frameworks/frontend/astro).

1. Masuk ke Vercel dan pilih **Add New → Project**.
2. Impor repositori GitHub `wendra08/Portfolio_Denz` dan pilih root directory repositori.
3. Biarkan framework **Astro** dan build settings pada nilai deteksi otomatis. Node.js proyek telah memenuhi kebutuhan Astro dan kompatibel dengan Node.js 24 di Vercel.
4. Deploy. Vercel memberi situs domain `*.vercel.app`; sesudah deployment, periksa halaman utama, portofolio, jurnal, `/robots.txt`, dan `/sitemap.xml`.

Setelah project terhubung ke Git, commit dan push berikutnya akan memicu deployment dari Vercel. Menambahkan custom domain bisa dilakukan belakangan lewat **Project → Settings → Domains**.
