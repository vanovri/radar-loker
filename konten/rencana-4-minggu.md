# Rencana konten 4 minggu

| Minggu | Hook | Data yang dibutuhkan | Fitur yang ditambah |
|---|---|---|---|
| 1 (25–31 Okt) | "AI ngelamarin 70 kerja buat gw, interview: 0" + launch Radar Loker | `eksperimen.json` hari 3 & 7 | — (MVP sudah jadi) |
| 2 (1–7 Nov) | "Gw scan 100 lowongan. X% punya red flag. Ini yang paling sering." | 100 teks lowongan → `node scripts/scan.mjs` | Kumpulkan contoh dari reply netizen; tambah aturan baru dari temuan |
| 3 (8–14 Nov) | "Portal mana yang paling sering di-ghosting? JobStreet vs KarirJakarta vs portal perusahaan" | Response rate per portal (tambah kolom tanggal lamar & tanggal respons di CSV) | Grafik respons per portal + rata-rata hari sampai direspons |
| 4 (15–22 Nov) | "30 hari, N lamaran, M interview. Ini semua yang gw pelajari." + open-source repo | Data final | README rapi, tag rilis v1.0, cross-post LinkedIn |

## Aturan main eksperimen (biar kredibel)
1. Semua angka bisa dicek. Simpan bukti (screenshot/email) di folder lokal, jangan dipublikasikan.
2. Update `data/log.json` minimal 2× seminggu.
3. Kalau dapat interview atau offer, catat juga lamaran mana dan dari portal apa. Itu data paling berharga.
4. Jangan pernah sebut nama perusahaan yang nolak atau ghosting.

## Metrik sukses
- Thread minggu 1 dapat ≥ 50 ribu impresi, atau ada ≥ 100 orang yang pakai detektor (pasang analitik ringan seperti GoatCounter atau Cloudflare Web Analytics; dua-duanya tanpa cookie).
- Ada ≥ 20 lowongan kiriman netizen buat bahan konten minggu 2.
- Ada 1 interview yang datang gara-gara proyek ini (portofolio).
