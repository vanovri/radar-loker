# Radar Loker

**Live:** https://vanovri.github.io/radar-loker/ · [Dashboard eksperimen](https://vanovri.github.io/radar-loker/eksperimen.html)

Dua hal dalam satu situs statis:

1. **Detektor red flag lowongan** (`index.html`). Tempel teks lowongan, keluar skor 0–100 + penjelasan tiap red flag: biaya pendaftaran, penahanan ijazah, kerja tugas online, minta OTP, gaji di bawah UMP, gaji tidak wajar untuk pemula, denda resign, jam kerja berlebih, dll. Berjalan 100% di browser — tanpa API, tanpa server, teks tidak dikirim ke mana pun.
2. **Eksperimen "30 Hari AI Ngelamarin Kerja Buat Gw"** (`eksperimen.html`). Dashboard publik dari data lamaran asli. Hanya agregat; nama perusahaan dan portal karier milik perusahaan disamarkan.

## Jalankan lokal

```powershell
npm test            # 10 tes rule engine (node:test, tanpa dependency)
npm run data        # bangun data/eksperimen.json dari CSV crosscheck Codex
npm run dev         # http://127.0.0.1:5173
```

`eksperimen.html` memakai `fetch`, jadi harus dibuka lewat server (bukan `file://`).

## Update data eksperimen

```powershell
python scripts/build_data.py "C:\path\ke\Crosscheck_Lamaran_<tanggal>.csv" --start 2026-10-23
```

CSV butuh kolom `portal,id,posisi,perusahaan,status`. Tambah catatan harian di `data/log.json`.

> `--with-roles` menyertakan nama posisi + perusahaan. Jangan pakai flag ini untuk versi yang dipublikasikan.

## Scan banyak lowongan (bahan konten)

Simpan tiap lowongan sebagai `.txt` di satu folder, lalu:

```powershell
node scripts/scan.mjs .\lowongan\
```

Keluar: distribusi level, red flag paling sering, 10 skor tertinggi.

## Deploy (GitHub Pages)

```powershell
git init; git add .; git commit -m "feat: radar loker mvp"
gh repo create radar-loker --public --source . --push
gh api -X POST repos/{owner}/radar-loker/pages -f "source[branch]=main" -f "source[path]=/"
```

Situs statis murni, jadi Netlify/Vercel/Cloudflare Pages juga bisa (drag-drop folder).

## Struktur

```
src/rules.js        rule engine (aturan, parser gaji, skor)
src/app.js          UI detektor
tests/              tes node:test
scripts/build_data.py   CSV lamaran → data/eksperimen.json (agregat)
scripts/scan.mjs    scan banyak lowongan sekaligus
data/log.json       catatan harian eksperimen (edit manual)
konten/             draf thread & rencana konten
```

## Menambah aturan

Tambah objek ke `RULES` di `src/rules.js` (`id`, `severity`, `weight`, `patterns`, `why`, `tip`, opsional `ref` + `negatable`), lalu tambah tes di `tests/rules.test.mjs`. Setiap aturan wajib punya penjelasan yang bisa dipertanggungjawabkan; dasar hukum hanya dicantumkan kalau sudah diverifikasi.

## Batasan

Heuristik regex, bukan AI. Bisa salah positif (mis. kata "denda" dalam konteks lain) dan salah negatif (penipuan dengan bahasa rapi). Skor rendah ≠ lowongan pasti asli.
