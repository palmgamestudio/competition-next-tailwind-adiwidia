# Brief Frontend — Museum Virtual Tour 360

Dokumen ini merangkum **data structure**, **migration**, **Supabase Storage**, dan **flow API** untuk fitur Virtual Tour Museum di Adiwidia. Dipakai sebagai kontrak antara admin (`adiwidia-admin`) dan landing frontend.

---

## 1. Ringkasan fitur (mapping UI landing)

| Area UI landing | Field DB | Keterangan |
|-----------------|----------|------------|
| Hijau — selector bagian | `name`, `slug`, `sort_order` | Daftar scene yang bisa dipilih |
| Merah — viewer 360 | `panorama_url` | URL publik gambar equirectangular |
| Pink — deskripsi | `description` | HTML (dari TipTap di admin) |
| Biru — AI ChatBot | `ai_context` | Teks konteks/pengetahuan untuk chatbot |

Hanya tampilkan scene dengan `is_published = true`, urutkan `sort_order ASC`.

---

## 2. Data structure

### Tabel: `public.museum_scenes`

| Kolom | Tipe | Nullable | Default | Keterangan |
|-------|------|----------|---------|------------|
| `id` | `serial` (PK) | no | auto | ID scene |
| `name` | `text` | no | — | Nama bagian (UNIQUE) |
| `slug` | `text` | no | — | Slug URL-friendly (UNIQUE), diisi admin otomatis dari `name` |
| `panorama_url` | `text` | no | — | URL publik Supabase Storage |
| `description` | `text` | yes | `null` | HTML deskripsi |
| `ai_context` | `text` | yes | `null` | Konteks untuk AI chatbot |
| `sort_order` | `integer` | no | `0` | Urutan di selector |
| `is_published` | `boolean` | no | `true` | Flag publish ke landing |
| `created_at` | `timestamptz` | no | `now()` | Waktu dibuat |

### TypeScript (kontrak frontend)

```ts
export interface MuseumScene {
  id: number;
  name: string;
  slug: string;
  panorama_url: string;      // https://....supabase.co/storage/v1/object/public/museum-panoramas/...
  description?: string | null; // HTML
  ai_context?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
}
```

### Contoh row

```json
{
  "id": 1,
  "name": "Ruang Wayang & Gamelan",
  "slug": "ruang-wayang-gamelan",
  "panorama_url": "https://llvkwvkslocqvmtapqfa.supabase.co/storage/v1/object/public/museum-panoramas/ruangan-wayang.jpg",
  "description": "<p>Ruangan ini menampilkan koleksi <strong>Wayang Kulit</strong>...</p>",
  "ai_context": "Scene: Ruang Wayang & Gamelan. Topik: Wayang Kulit, Gamelan Jawa...",
  "sort_order": 1,
  "is_published": true,
  "created_at": "2025-09-01T10:00:00+00:00"
}
```

---

## 3. Migration files (urutan jalankan di Supabase SQL Editor)

| File | Isi |
|------|-----|
| `migrations/003_museum_scenes.sql` | CREATE TABLE `museum_scenes` + index + RLS admin |
| `migrations/005_museum_panorama_storage.sql` | Bucket Storage `museum-panoramas` + policy |
| `migrations/004_museum_scenes_seed.sql` | Seed 5 scene (opsional; butuh file sudah di-upload ke bucket) |

> Catatan RLS saat ini di `003`: SELECT/INSERT/UPDATE/DELETE hanya untuk role **`authenticated`** (admin).  
> Untuk **landing publik**, frontend butuh policy tambahan agar `anon` bisa **SELECT** scene yang published. Contoh:

```sql
CREATE POLICY "museum_scenes_public_read_published"
ON public.museum_scenes
FOR SELECT
TO anon, authenticated
USING (is_published = true);
```

(Sesuaikan / gabungkan dengan policy existing agar tidak bentrok.)

---

## 4. Supabase Storage

### Bucket

| Property | Value |
|----------|--------|
| Bucket ID / name | `museum-panoramas` |
| Public | `true` |
| Max size | 50 MB |
| MIME allowed | `image/jpeg`, `image/png`, `image/webp` |

### Format URL publik

```
{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/museum-panoramas/{object-path}
```

Contoh path object dari admin upload:

```
1730000000000-ruangan-wayang.jpg
```

### Policy Storage (dari migrasi 005)

| Operasi | Role | Keterangan |
|---------|------|------------|
| `SELECT` | `public` | Landing & preview bisa load gambar |
| `INSERT` | `authenticated` | Upload dari admin |
| `UPDATE` | `authenticated` | Replace (jika dipakai) |
| `DELETE` | `authenticated` | Hapus file (opsional) |

Frontend landing **tidak perlu upload** — cukup pakai `panorama_url` dari row DB.

---

## 5. Flow API (Supabase Client)

Tidak ada custom REST API di Next admin. Semua lewat **Supabase JS** (PostgREST + Storage).

### 5.1 Env yang dibutuhkan frontend

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5.2 Flow admin (sudah di `adiwidia-admin`)

```text
[Form Create/Update]
   │  pilih File panorama
   ▼
uploadMuseumPanorama(file)
   │  storage.from('museum-panoramas').upload(path, file)
   │  getPublicUrl(path) → panorama_url
   ▼
insert / update public.museum_scenes
   │  name, slug, panorama_url, description, ai_context,
   │  sort_order, is_published
   ▼
List / Detail admin
```

### 5.3 Flow landing (yang perlu diimplement frontend)

```text
1. Fetch daftar scene published
2. Render selector (hijau) dari name + sort_order
3. Saat scene dipilih → tampilkan panorama_url di viewer 360 (merah)
4. Render description HTML (pink)
5. Inisialisasi chatbot dengan ai_context scene aktif (biru)
```

#### Query list (direkomendasikan)

```ts
const { data, error } = await supabase
  .from("museum_scenes")
  .select("id, name, slug, panorama_url, description, ai_context, sort_order")
  .eq("is_published", true)
  .order("sort_order", { ascending: true });
```

#### Query by slug (deep link)

```ts
const { data, error } = await supabase
  .from("museum_scenes")
  .select("*")
  .eq("slug", slug)
  .eq("is_published", true)
  .single();
```

### 5.4 Diagram singkat

```text
┌─────────────┐     upload file      ┌──────────────────────┐
│ Admin Form  │ ───────────────────► │ Storage              │
│ (auth user) │                      │ museum-panoramas     │
└──────┬──────┘                      └──────────┬───────────┘
       │ insert/update panorama_url             │ public URL
       ▼                                        ▼
┌──────────────────┐                  ┌─────────────────────┐
│ museum_scenes    │ ◄── select ───── │ Landing Frontend    │
│ (Postgres)       │   published only │ (anon key + RLS)    │
└──────────────────┘                  └─────────────────────┘
```

---

## 6. Seed scene (referensi konten)

Setelah file panorama di-upload ke bucket dengan nama berikut, seeder `004` mengisi:

| sort_order | name | object file |
|------------|------|-------------|
| 1 | Ruang Wayang & Gamelan | `ruangan-wayang.jpg` |
| 2 | Ruang Candi & Tektonik | `ruangan-candi-tektonik.jpg` |
| 3 | Ruang Pelayaran Indonesia | `ruangan-pelayaran.jpg` |
| 4 | Ruang Tekstil Batik & Tenun | `ruangan-tekstil-batik.jpg` |
| 5 | Ruang Pahat & Seni Kayu | `ruangan-pahat-seni-kayu.jpg` |

---

## 7. Checklist frontend landing

- [ ] Client Supabase dengan `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`
- [ ] Pastikan RLS **public read published** sudah aktif di project Supabase
- [ ] Fetch `museum_scenes` where `is_published = true` order by `sort_order`
- [ ] Selector memakai `name` / `slug`
- [ ] Viewer 360 load `panorama_url` (equirectangular JPEG/PNG/WebP)
- [ ] Panel deskripsi render HTML dari `description` (sanitize jika perlu)
- [ ] Chatbot memakai `ai_context` scene yang sedang aktif
- [ ] Handle loading / empty state jika belum ada scene published

---

## 8. Out of scope (belum ada di admin v1)

- Hotspot koordinat di dalam panorama
- Nested scene linking (portal antar ruang)
- Upload dari landing
- Endpoint chat AI dedicated (hanya field `ai_context` sebagai knowledge base)

Jika frontend butuh hotspot / navigasi antar scene, diskusikan schema tambahan terpisah.
