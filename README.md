# Adiwidia

Platform digital edukatif-interaktif untuk memperkenalkan, melestarikan, dan menghidupkan kembali kekayaan budaya Nusantara. Pengguna dapat menjelajahi kategori budaya per provinsi, cerita rakyat, galeri, koleksi 3D, museum virtual 360°, serta Chat AI sebagai pemandu budaya.

**Demo online:** [https://adiwidia.vercel.app/](https://adiwidia.vercel.app/)

---

## Spesifikasi lingkungan pengujian

| Komponen | Versi / keterangan |
| --- | --- |
| Node.js | ≥ 20 (disarankan LTS 20/22) |
| Package manager | `pnpm` (disarankan) atau `npm` |
| Framework | Next.js **15.5.9** (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database / API | Supabase (PostgreSQL + client SDK) |
| AI Chat | Google Gemini (`gemini-3.1-flash` → fallback `gemini-3.1-flash-lite`) |
| Browser pengujian | Chrome / Edge / Firefox terbaru |
| OS pengujian | Windows 10/11, macOS, atau Linux |

---

## Persyaratan sebelum instalasi

1. Akun [Supabase](https://supabase.com/) dengan project yang sudah berisi schema Adiwidia (`categories`, `provinces`, `cultures`, `stories`, museum, dll.).
2. API key [Google AI Studio / Gemini](https://aistudio.google.com/apikey) untuk fitur Chat AI.
3. Node.js terpasang di mesin lokal.

---

## Panduan instalasi

### 1. Unduh / clone source code

```bash
git clone https://github.com/palmgamestudio/competition-next-tailwind-adiwidia.git
cd competition-next-tailwind-adiwidia
```

Atau ekstrak berkas `.zip` / `.rar` submission ke folder lokal, lalu masuk ke folder tersebut.

### 2. Install dependensi

```bash
pnpm install
# atau
npm install
```

### 3. Konfigurasi environment

Salin contoh env lalu isi nilai asli:

```bash
cp .env.example .env.local
```

Isi minimal di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Opsional
# GEMINI_MODEL=gemini-3.1-flash
# GEMINI_MODEL_LITE=gemini-3.1-flash-lite
```

> Jangan commit file `.env.local`. Jangan pakai `service_role` / secret key di sisi client.

### 4. (Opsional) Seed data budaya

File SQL seed tersedia di `supabase/seed/` (satu file per kategori). Jalankan di Supabase SQL Editor sesuai kebutuhan, misalnya `kuliner.sql`, `pakaian-adat.sql`, dll.

---

## Cara menjalankan aplikasi

### Mode development

```bash
pnpm dev
# atau
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Build & production lokal

```bash
pnpm build
pnpm start
# atau
npm run build
npm start
```

### Lint

```bash
pnpm lint
# atau
npm run lint
```

---

## Fitur utama

* Jelajah budaya per kategori & provinsi
* Detail konten budaya + Chat AI kontekstual
* Cerita rakyat
* Galeri & koleksi 3D (Sketchfab embed)
* Museum virtual tour 360°
* Navigasi kategori dinamis dari Supabase

---

## Struktur folder singkat

```text
src/
  app/                 # App Router (halaman & API)
  components/          # UI Atoms → Organisms → Templates
  hooks/               # Custom hooks
  utils/               # Query & helper
supabase/
  seed/                # SQL seed per kategori budaya
.env.example           # Template variabel lingkungan
```

---

## Akun demo

Aplikasi **tidak memerlukan login**. Semua halaman publik dapat diakses tanpa akun.

| Item | Nilai |
| --- | --- |
| URL demo | https://adiwidia.vercel.app/ |
| Username / password | Tidak ada (akses terbuka) |

Untuk pengujian Chat AI, pastikan `GEMINI_API_KEY` sudah diisi di environment (lokal atau Vercel).

---

## Deploy (Vercel)

1. Import repo ke Vercel.
2. Set Environment Variables sama seperti `.env.local` (`NEXT_PUBLIC_SUPABASE_*`, `GEMINI_API_KEY`).
3. Deploy branch `main`. Package manager yang terdeteksi: **pnpm** (ada `pnpm-lock.yaml`).

---

## Teknologi

* [Next.js](https://nextjs.org/)
* [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Supabase](https://supabase.com/)
* [Framer Motion](https://www.framer.com/motion/) / Motion
* [Swiper](https://swiperjs.com/)
* [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)
* Google Gemini API

---

## Lisensi / submission

Source code diserahkan dalam format `.zip` / `.rar` bersama `README.md` ini (panduan instalasi, cara menjalankan, spesifikasi lingkungan pengujian, dan keterangan akun demo).
