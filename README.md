# Anargya

Website Anargya memperkenalkan konsep mobil listrik Formula Student untuk pelatihan pembalap dan riset kendaraan. Situs ini menjelaskan tujuan kendaraan, sistem yang dikembangkan, rencana penjualan untuk akademi balap di Jepang, serta konsep aplikasi telemetry.

Harga kendaraan ¥6.627.281 adalah harga tetap. Volume dan jadwal di situs merupakan target dalam rencana proyek, bukan komitmen produksi. Spesifikasi performa kendaraan belum dipublikasikan sebagai data tervalidasi.

## Isi situs

### Beranda

Halaman utama menggabungkan pengenalan program dan presentasi kendaraan:

- Hero berbahasa Inggris dan Jepang, dengan tautan ke informasi produk dan formulir kontak.
- Bagian alasan memilih Anargya, termasuk target harga dan gambaran rencana proyek.
- Urutan cerita kendaraan yang mengikuti scroll. Model mobil 3D berpindah sudut pandang ketika konten berganti.
- Formulir pertanyaan untuk presentasi kendaraan, evaluasi tim, atau proposal armada.
- Pratinjau aplikasi live telemetry.

Formulir kontak tidak mengirimkan data ke server. Setelah formulir diisi, situs menyusun draf pesan di browser. Pengunjung dapat menyalin pesan tersebut untuk dikirim melalui saluran yang disepakati.

### Informasi kendaraan

`/specifications` menyediakan model 3D interaktif. Pengunjung dapat memilih kendaraan secara keseluruhan atau melihat kelompok komponen seperti chassis, suspensi, kontrol pengemudi, roda dan rem, aerodinamika, serta sistem EV.

Pemilihan sistem mengubah sorotan komponen dan sudut kamera. Powertrain, inverter, dan perangkat lunak termasuk dalam lingkup pengembangan, tetapi belum ditampilkan sebagai komponen terpisah pada model. Angka keluaran motor, torsi, kapasitas baterai, massa, dimensi, dan kecepatan maksimum menunggu validasi.

### Informasi penjualan

`/sales` menjelaskan arah penjualan yang direncanakan untuk Jepang, harga tetap per kendaraan (¥6.627.281), rencana ekspansi pasar, dan gagasan pilot untuk akademi. Angka serta tanggal di halaman ini merupakan asumsi atau target perencanaan. Harga final, spesifikasi, ketersediaan, dan ketentuan pembelian perlu dikonfirmasi melalui proposal atau perjanjian penjualan.

### Pratinjau live telemetry

Bagian live telemetry di beranda menampilkan rancangan antarmuka untuk desktop dan ponsel, termasuk kecepatan roda, tegangan dan arus baterai, temperatur motor, serta grafik riwayat.

Seluruh pembacaan pada pratinjau dibuat secara simulasi di browser. Pratinjau ini bukan aplikasi telemetry yang terhubung ke kendaraan. Aplikasi direncanakan sebagai tambahan untuk pelanggan yang membeli kendaraan beserta paket telemetry.

## Teknologi

- Next.js 16 dengan App Router
- React 19 dan TypeScript
- Three.js, React Three Fiber, dan Drei untuk tampilan model 3D
- Framer Motion untuk animasi, transisi, dan interaksi berbasis scroll
- CSS untuk tata letak dan gaya halaman

## Menjalankan proyek

### Persyaratan

- Node.js yang kompatibel dengan versi Next.js pada `package.json`
- npm

### Instalasi

```bash
git clone https://github.com/LitSamm/Anargya-racing.git
cd Anargya-racing
npm install
```

### Server pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Pemeriksaan dan build

```bash
npm run lint
npm run build
```

Untuk menjalankan hasil build produksi secara lokal:

```bash
npm run start
```

## Rute aplikasi

| Rute | Isi |
| --- | --- |
| `/` | Pengenalan Anargya, model kendaraan 3D, formulir kontak, dan pratinjau telemetry |
| `/specifications` | Penjelasan kendaraan dan penjelajah komponen 3D |
| `/sales` | Informasi penjualan dan rencana pasar |

Navigasi utama menghubungkan ketiga halaman tersebut dengan bagian kendaraan, alasan memilih Anargya, telemetry, dan kontak di beranda.

## Struktur proyek

```text
src/
  app/
    page.tsx                 Halaman utama
    layout.tsx               Layout global, metadata, dan font
    globals.css              Gaya dasar
    marketing.css            Gaya bagian pemasaran dan beranda
    premium.css              Gaya bagian visual premium
    balance.css              Penyesuaian tata letak
    live.css                 Gaya pratinjau telemetry
    spec.css                 Gaya halaman spesifikasi
    sales/page.tsx           Halaman informasi penjualan
    specifications/page.tsx  Halaman informasi kendaraan
  components/
    landing-page.tsx              Konten dan interaksi beranda
    car-scene.tsx                 Tampilan model kendaraan berbasis WebGL
    specification-showcase.tsx    Pemilih komponen kendaraan
    spec-car-view.tsx             Tampilan kendaraan untuk halaman spesifikasi
    live-telemetry-section.tsx    Pratinjau data telemetry simulasi
    site-navigation.tsx           Navigasi dan footer
    motion-kit.tsx                 Komponen animasi yang digunakan bersama
    custom-cursor.tsx              Efek kursor khusus
public/
  assets/
    anargya-mark.png
    anargya-wordmark.png
    car.glb
```

## Catatan implementasi

- Model kendaraan dimuat dari `public/assets/car.glb`. Browser memerlukan dukungan WebGL untuk menampilkan adegan 3D.
- Adegan kendaraan menampilkan status saat model sedang dimuat dan menyediakan tindakan coba lagi jika pemuatan gagal.
- Pengaturan reduced motion pada sistem pengunjung digunakan untuk mengurangi animasi tertentu.
- Situs saat ini tidak memerlukan variabel lingkungan untuk dijalankan.
- Proyek tidak menyertakan backend untuk formulir kontak atau sumber data kendaraan langsung.

## Perintah npm

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run lint` | Menjalankan ESLint |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan server untuk build produksi |

## Backend (Prisma + SQLite)

Route handler API di `src/app/api`, database lewat Prisma 7 dengan SQLite (`dev.db`).

### Menjalankan
```bash
cp .env.example .env        # isi AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install                 # postinstall menjalankan prisma generate
npm run db:migrate          # membuat tabel
npm run db:seed             # admin, konten awal, dan satu kendaraan demo
npm run dev
```
`npm run db:studio` membuka penjelajah data. Untuk produksi, ganti provider di `prisma/schema.prisma` ke PostgreSQL dan adapter-nya; hosting statis tidak bisa menjalankan database.

### Endpoint
| Endpoint | Akses | Fungsi |
|---|---|---|
| `POST /api/auth/login`, `/logout`, `GET /api/auth/me` | publik / sesi | Login dengan cookie sesi (JWT, httpOnly) |
| `GET/POST /api/users` | admin | Akun dibuat admin; tidak ada pendaftaran publik |
| `GET/POST /api/organizations` | admin | Akademi / tim |
| `GET/POST /api/vehicles`, `POST /api/vehicles/:id/api-key` | admin; pelanggan lihat milik organisasinya | Kendaraan dan kunci telemetry (ditampilkan sekali) |
| `POST /api/telemetry/sessions`, `POST /api/telemetry/readings`, `PATCH /api/telemetry/sessions/:id` | unit mobil (`x-vehicle-key`) | Mulai sesi, unggah hingga 500 pembacaan, tutup sesi |
| `GET /api/telemetry/sessions`, `GET /api/telemetry/sessions/:id` | pelanggan (organisasinya) / admin | Riwayat sesi dan pembacaan |
| `POST /api/inquiries` | publik (dibatasi laju, honeypot `website`) | Pesan dari formulir kontak |
| `GET /api/inquiries`, `PATCH /api/inquiries/:id` | admin | Daftar dan status pesan |
| `GET /api/content`, `GET /api/content/:key` | publik | Konten situs (harga, profil, roadmap) |
| `PUT/DELETE /api/content/:key` | admin | Ubah konten tanpa edit kode |
| `GET/POST /api/proposals`, `PATCH /api/proposals/:id` | pelanggan / admin | Proposal; harga selalu ditetapkan server dari `vehicle.priceYen` |

Frontend belum memakai API ini: formulir kontak dan halaman telemetry di situs masih seperti sebelumnya.
