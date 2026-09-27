# Final polishing — 27 September 2026

## Status audit

Seluruh homepage ditinjau dari source dan HTML hasil render. Browser desktop/mobile tidak tersedia di sesi pengerjaan, sehingga hasil visual, overflow aktual, interaksi klik, dan metrik Lighthouse belum dinyatakan lulus.

| Area | Perbaikan / hasil pemeriksaan kode dan HTML |
| --- | --- |
| Navbar dan footer | Tautan booking lintas halaman, latar navbar pada journal, fokus keyboard menu, spasi nama footer, footer pada halaman journal. |
| Hero | Gambar WebP responsif, prioritas pemuatan tinggi, ukuran eksplisit, posisi foto tetap mengikuti breakpoint. |
| About, Wedding MC, Why Kang Denz | Reset CSS dipindah ke base layer agar utility Tailwind bekerja; ukuran judul minimum dan keterbacaan microcopy diperbaiki. |
| Showreel | Video tidak preload, poster, dialog native, fokus kembali setelah ditutup, preview hover mengikuti reduced motion. |
| Portfolio, Ecosystem, Nata Manten, Natsume, MC Class | Dimensi gambar, lazy loading, tipografi responsif, spasi antarelemen dan kontras teks. |
| Journey, Testimonials, Social, Journal | Spasi dapat berpindah baris, ukuran teks kecil, status filter untuk pembaca layar, cover journal yang hilang diperbaiki. |
| Booking, FAQ, Contact | Fokus pilihan layanan, label yang lebih terbaca, hubungan pertanyaan/jawaban FAQ, jawaban menyesuaikan tinggi saat viewport berubah. |
| Semua halaman | Skip link, offset anchor untuk navbar fixed, reduced motion, fallback konten tanpa JavaScript. |

## SEO dan identitas

- Title, description, robots, Open Graph, dan Twitter card disediakan melalui BaseLayout.
- Canonical, URL Open Graph absolut, schema Person/WebSite, serta sitemap menggunakan `SITE_URL`.
- Domain final belum diberikan. Tanpa konfigurasi tersebut, canonical/schema URL tidak diterbitkan dan sitemap tidak berisi URL.
- Favicon KD dalam SVG/PNG/ICO, Apple touch icon, dan kartu sosial 1200 x 630 tersedia.
- Journal memiliki metadata artikel, cover, published time, dan modified time jika tersedia.
- 404 khusus menyediakan tautan beranda/booking dan meta `noindex`.

## Performa aset

| Gambar | Sumber | WebP desktop | WebP mobile |
| --- | ---: | ---: | ---: |
| Hero | 1.614.500 byte | 61.844 byte | 18.170 byte |
| Wedding MC | 2.033.378 byte | 140.090 byte | 57.088 byte |

Foto asli tidak dihapus. Ukuran file di atas merupakan pengukuran aset, bukan skor Core Web Vitals. Video asli masih berukuran besar ketika diputar; tidak dilakukan re-encoding video. Preview tidak memuat video sebelum interaksi. Semua gambar yang dirender memiliki dimensi intrinsik; gambar di bawah hero memakai lazy loading, kecuali cover utama artikel.

## Verifikasi

- Build produksi: 8 halaman HTML, robots.txt, sitemap.xml.
- Kompilasi 26 file Astro beserta script client: lulus.
- Audit HTML build: tidak ada gambar hilang, tautan internal/anchor putus, ID duplikat, heading utama ganda, atau metadata wajib yang hilang.
- Konfigurasi domain diuji memakai origin contoh hanya dalam proses build lokal: canonical, URL gambar OG, JSON-LD, 7 URL sitemap, dan robots konsisten. Build akhir dikembalikan ke konfigurasi tanpa domain.
- Dev server: homepage/journal/favicon/OG/robots/sitemap HTTP 200; URL yang tidak dikenal HTTP 404.
- Kartu sosial JPG diperiksa secara visual sebagai aset terpisah.

## Sebelum publikasi

1. Isi domain final pada `SITE_URL` dan build ulang.
2. Lengkapi nama pasangan di Portfolio, testimonial asli, serta kontak yang masih “Soon”. Data dan klaim pelanggan tidak dibuat-buat.
3. Periksa seluruh section pada viewport 320, 390, 768, 1280, dan 1440 px: tidak ada overflow, tulisan terpotong, atau overlap dengan navbar.
4. Uji menu mobile (Tab/Escape/tutup setelah klik), filter testimonial/journal, semua kategori FAQ, resize jawaban FAQ, serta modal video (buka/tutup/putar/pause).
5. Uji validasi booking dan pembentukan pesan WhatsApp memakai data uji; jangan mengirim pesan uji tanpa kebutuhan.
6. Jalankan Lighthouse pada build produksi dan uji 404 di hosting yang digunakan. Pastikan 404 tetap berstatus 404.
