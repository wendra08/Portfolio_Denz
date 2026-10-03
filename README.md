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

Salin `.env.example` ke `.env` dan isi `SITE_URL` dengan domain HTTPS final tanpa path. Environment variable `SITE_URL` pada hosting juga didukung. Jalankan build ulang setelah mengganti domain.

Tanpa `SITE_URL`, canonical dan URL schema tidak diterbitkan, gambar Open Graph memakai path relatif, serta sitemap belum berisi URL. Isi domain sebelum publikasi agar preview sosial dan sitemap lengkap. Jangan memakai domain contoh pada build produksi.

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
