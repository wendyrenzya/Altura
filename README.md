# Altura

Situs company profile PT. Altura Abadi Investama, mengikuti panduan identitas visual v1.0
(`Altura_Corporate_Identity.pdf`). Live di https://qilo.one/altura/

Situs statis di `public/altura/`, disajikan oleh Cloudflare Worker (static assets) pada route
`qilo.one/altura` dan `qilo.one/altura/*`. Struktur folder sengaja mengikuti path URL.

## Deploy

Push ke `main` menjalankan `.github/workflows/deploy.yml`.

Secrets repo yang dibutuhkan (Settings, Secrets and variables, Actions):

| Secret | Isi |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token dari template "Edit Cloudflare Workers" (sudah mencakup Workers Routes untuk zone) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare |

Syarat di Cloudflare: zone `qilo.one` ada di akun yang sama, dan hostname `qilo.one` punya record DNS
yang diproxy (awan oranye). Kalau belum ada record, tambahkan `A qilo.one 192.0.2.1` dengan proxy aktif.

## Preview lokal

```sh
npx wrangler@4 dev
# buka http://localhost:8787/altura/
```

## Yang perlu diisi

- Kontak resmi (email, telepon, alamat): `public/altura/index.html`, section `#contact`. Ganti "To be announced" dan hapus atribut `data-id` pada barisnya.
- Section Insights masih kosong. Isi saat ada laporan atau tulisan.
- Logo berasal dari raster di PDF. Ganti dengan master vektor bila sudah ada. Animasi logo di hero memakai `img/logo.png` sebagai mask.

## Mockup multi-halaman (qilo.one/altura-mockup)

Versi alternatif dengan halaman terpisah (Home, About, Focus, Portfolio, Insights + 6 artikel, Team, Contact),
transisi tirai garis antar halaman, dan logo yang digambar satu garis. Semua nama, angka, artikel, dan tanggal
di dalamnya adalah konten contoh (ada penanda di setiap halaman).

- HTML dihasilkan oleh `mockup-src/build.mjs` (tanpa dependensi). Setelah mengubah konten, jalankan
  `node mockup-src/build.mjs` lalu commit hasilnya di `public/altura-mockup/`. Workflow deploy tidak menjalankan build.
- CSS dan JS ditulis langsung di `public/altura-mockup/styles.css` dan `app.js`.
- Jalur garis logo (`mockup-src/logo-path.json`) diturunkan dari simbol logo di PDF: satu jalur tengah, lebar goresan 39.92.
  Frame akhir animasi memakai `img/logo.png` asli, jadi bentuk akhirnya identik dengan logo.
- Route Worker: `qilo.one/altura-mockup` dan `qilo.one/altura-mockup/*` (di `wrangler.jsonc`).
- Ikon Lucide: `img/icons.svg` (ISC, `img/LICENSE-lucide.txt`).

## Bahasa

Teks Inggris adalah default di HTML. Terjemahan Indonesia ada di samping tiap teks, pada atribut
`data-id` (juga `data-id-aria-label` dan `data-id-content`). Logika toggle EN/ID ada di `app.js`.
Teks baru cukup diberi `data-id` pada elemen yang tidak berisi ikon.

## Lisensi aset

- Font Inter di `public/altura/fonts/`: OFL (`OFL-LICENSE.txt`).
- Ikon Lucide di `public/altura/img/icons.svg`: ISC (`img/LICENSE-lucide.txt`).
