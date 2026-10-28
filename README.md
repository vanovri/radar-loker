# Radar Loker & Lab (7-in-1 Suite)

Suite ini dikembangkan dengan bantuan AI. Lima belas tes Node.js lulus pada 27 Oktober 2026. Skor dan masukan berasal dari aturan deterministik. Hasilnya tidak membuktikan akurasi deteksi penipuan, keputusan perekrut, atau hasil sidang. Referensi hukum dan gaji merupakan snapshot bertanggal. Kode driver STM32/ESP32 yang dihasilkan belum diuji pada perangkat fisik.

**Live Suite:** https://radar-loker.vercel.app/

Arsitektur: **1 monorepo statis (tanpa backend, tanpa biaya server, 100% jalan di browser)** yang menggabungkan **4 alat Karir & Pencari Kerja** dan **3 alat Lab Teknis & Publik** dengan URL mandiri masing-masing:

| # | Kategori | Proyek | URL Live |
|---|---|---|---|
| 01 | Karir | **Detektor Loker Red Flag** — Cek 18 pola penipuan loker (tahan ijazah SE Menaker M/5/HK.04.00/V/2025, pungutan biaya, task scam, gaji < UMP) | [/index.html](https://radar-loker.vercel.app/) |
| 02 | Karir | **Eksperimen 30 Hari AI Lamar Kerja** — Dashboard publik 70 lamaran asli ke 54 perusahaan (agregat privasi-aman) | [/eksperimen.html](https://radar-loker.vercel.app/eksperimen.html) |
| 03 | Lab | **Simulator Sidang Skripsi** — Bedah klaim abstrak + 3 karakter dosen penguji galak dengan suara (`speechSynthesis`) & penilai jawaban | [/sidang.html](https://radar-loker.vercel.app/sidang.html) |
| 04 | Karir | **Peta Gaji Fresh Grad RI vs UMK** — Bandingkan tawaran gaji dengan UMK 16 kota industri, rentang pasar 5 bidang, sisa THP setelah kos+makan, & script nego HRD | [/gaji.html](https://radar-loker.vercel.app/gaji.html) |
| 05 | Karir | **Roast CV ala HRD** — Audit metrik, kata kerja aktif vs pasif, klise kosong, & kebocoran NIK dengan 3 persona (HRD Jaksel, HRD Pabrik, Robot ATS) + auto-rewrite | [/roast-cv.html](https://radar-loker.vercel.app/roast-cv.html) |
| 06 | Lab | **Datasheet → Driver Generator** — Ubah tabel register I2C/SPI (INA219, MPU6050, BMP280, custom) menjadi `.h`, `.c` (STM32 HAL / ESP-IDF), dan `test.c` | [/datasheet.html](https://radar-loker.vercel.app/datasheet.html) |
| 07 | Lab | **Pasal & Kontrak Diff Explainer** — Word-level diff UU Ketenagakerjaan vs UU Cipta Kerja & Kontrak PKWT wajar vs jebakan + terjemahan dampak hukum | [/pasal.html](https://radar-loker.vercel.app/pasal.html) |

## Jalankan & Uji Lokal

```powershell
npm test            # 15 tes unit seluruh engine (node:test, 0 dependency)
npm run data        # bangun data/eksperimen.json dari CSV crosscheck
npm run dev         # http://127.0.0.1:5173
```

## Struktur Modul

```
src/
  nav.js            navigasi terpadu 7 proyek
  rules.js          #1 engine detektor red flag loker
  app.js            #1 UI detektor + launchpad grid 7 proyek
  sidang.js         #3 engine simulator sidang skripsi & evaluator jawaban
  gaji.js           #4 engine UMK 16 kota, pasar fresh grad, & script nego
  roast.js          #5 engine audit CV, 3 persona roasting, & XYZ rewriter
  datasheet.js      #6 parser register map & C codegen (STM32 HAL / ESP-IDF)
  pasal.js          #7 LCS word-diff & detektor pergeseran hak hukum/kontrak
tests/
  rules.test.mjs    10 tes unit detektor loker
  suite.test.mjs    5 tes unit untuk proyek #3, #4, #5, #6, #7
```
