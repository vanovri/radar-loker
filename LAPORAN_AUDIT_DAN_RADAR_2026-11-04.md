# LAPORAN AUDIT LAMARAN KERJA, VERIFIKASI DOKUMEN LOCKED, & RADAR LOKER BARU
**Tanggal Audit**: Rabu, 4 November 2026 (`2026-11-04 06:05:00 WIB`)  
**Kandidat**: Ardhya Novri Ramadhan, S.T. (`S1 Teknik Elektro UNDIP`, IPK `3,43 / 4,00`, NIN `001008202012026100162`)  
**Workspace**: `C:\Users\ardhy\.gemini\antigravity\scratch\radar-loker`

---

## 1. Verifikasi Integritas Dokumen Lamaran (LOCKED POLICY — 100% PASS)

| Dokumen | Path Lokal | Ukuran (Byte) | SHA-256 Hash | Status & Aturan Pakai |
|---|---|---:|---|---|
| **Master CV ATS Utama (1 Halaman A4)** | `C:\Users\ardhy\OneDrive\Documents\My Docs\Ardhya Novri Ramadhan - CV ATS.pdf` | `99,026` | `c0a566b32a6cee1472509d2a01bab538dbdf95494fc7df45adcd61e41f3f8bc3` | ✅ VERIFIED LOCKED — MANDATORY_SINGLE_CV — Wajib digunakan untuk seluruh lamaran kerja. Dilarang membuat/menggunakan CV varian. |
| **Ijazah Resmi S1 Teknik Elektro UNDIP (BSrE BSSN)** | `C:\Users\ardhy\OneDrive\Documents\My Docs\Ijazah Ardhya Novri.pdf` | `1,056,099` | `650935932916f5655ba50151caed6fd07b52acabecf2cb41f60046f29a86d5ab` | ✅ VERIFIED LOCKED — MANDATORY_IJAZAH — Wajib gunakan Ijazah resmi, JANGAN PERNAH gunakan SKL. |
| **Transkrip Akademik Resmi UNDIP (BSrE BSSN, 2 Halaman)** | `C:\Users\ardhy\OneDrive\Documents\My Docs\Transkrip Ardhya Novri.pdf` | `1,629,959` | `d27c9b75d19440d75603910f32130e43bc7ce14e90e2d7bebc002e1160d952f2` | ✅ VERIFIED LOCKED — CONDITIONAL_ONLY — Hanya dilampirkan/diunggah jika portal atau lowongan mensyaratkan transkrip. |
| **SKL Sementara (DEPRECATED / DILARANG DIPAKAI)** | `C:\Users\ardhy\OneDrive\Documents\My Docs\SKL ARDHYA NOVRI.pdf` | `461,678` | `79e722e641f33d7fce21c003c0094fe7214e9856f0fa0c30da40c7db6b81a21b` | 🚫 DO NOT USE (LOCKED OUT) — LOCKED_OUT / DO_NOT_USE — Sudah digantikan permanen oleh Ijazah Resmi. |

- **Pengecekan Varian CV Liar di `My Docs`**: `0` file ditemukan (**AMAN — hanya ada 1 Master CV tunggal**).
- **Aturan Mutlak**: Tidak ada pembuatan CV varian baru dan tidak ada pengiriman form eksternal berulang.

---

## 2. Prioritas Tindakan Segera (*Active Test & Employer View Stage*)

| Prioritas | Perusahaan & Posisi | Status Saat Ini | Bukti & Tindak Lanjut |
|---|---|---|---|
| **P0 — URGENT TEST** | **Formulatrix Indonesia** — System Integration Engineer (Batch 29 Okt 2026) | `Test Invitation Received` | Cek jadwal & instruksi pengerjaan tes teknis Formulatrix di inbox ardhyasan@gmail.com. Siapkan konsep C/Python, serial UART, ADC/DMA, dan troubleshooting sistem. |
| **P0 — URGENT TEST** | **PT United Tractors Tbk (Astra)** — Technology & Infrastructure Trainee - UT Trainee (Vacancy 14929, App ID 7969871) | `Online Test (Dalam Proses) — Naik Tahap 31 Okt 2026` | Login ke career.astra.co.id & cek inbox email untuk link dan batas waktu pengerjaan Online Test United Tractors. |
| **P1 — EMPLOYER VIEWED** | **PT Prakarsa Alam Segar (Wings Food)** — Automation Engineering Project (JobStreet) | `Viewed by employer` | Siapkan materi interview proyek dari C:\Users\ardhy\Documents\SCRIPT_INTERVIEW_PROYEK.txt (STM32 4kHz EMG, ESP32 PWM, uart-fixture-kit, SCADA/PLC Bandara Soetta). |
| **P1 — EMPLOYER VIEWED** | **RGF HR Agent Indonesia** — IT Staff (Fresh Graduate only) - Trading - Jakarta (B-134429) | `Viewed by employer (Notifikasi 28 Okt 2026)` | Pantau panggilan telepon/email dari konsultan RGF HR Agent Indonesia. |

---

## 3. Rekapitulasi Bukti Lintas Kategori (*Evidence-First Ledger*)

- **Total Entri Terlacak**: **`174`** entri
  1. **(A) Terkirim & Terverifikasi Live (`A_SENT_VERIFIED`)**: **`153`** lamaran
     - PT HM Sampoerna Tbk / PMI (`join.pmicareers.com`): **`42`** posisi (`candidateId: 1356638`, `applicationId: 1802344..1802524`)
     - Riwayat 23–25 Oktober 2026 (`KarirJakarta` 29, `JobStreet` 32, `Glints` 1, `OCBC NISP` 2, `Amazon DCEO` 1, `RINA` 1, `Michelin` 3, `United Tractors` 2): **`71`** catatan (`1` naik ke Online Test)
     - Paket Instagram `DdyuLBGlLve` (26 Oktober 2026): **`6`** lamaran terkirim (`4` bersih tanpa bounce: Itron, BCA Infra, RoviSys, Luwes; `2` kanal cadangan sukses setelah bounce email: PDG CC `info@` & EPL Web Form)
     - Batch Eksekusi 29 Oktober – 3 November 2026: **`37`** lamaran terkonfirmasi (`1` naik ke Test Invitation: Formulatrix System Integration Engineer)
  2. **(B) Tahap Tes Aktif (`B_ACTIVE_TEST_STAGE`)**: **`2`** lamaran utama (**Formulatrix System Integration Engineer** & **United Tractors Technology & Infrastructure Trainee `14929`**) + 1 riwayat psikotes MTF (`3400`)
  3. **(C) Target Baru Siap Lamar (`C_READY_TO_APPLY_2026_11_04`)**: **`0`** lowongan kurasi tinggi (Non-Sales, Non-Duplikat)
  4. **(D) Bounce Email yang Sudah Ditangani (`D_BOUNCE_HANDLED`)**: **`2`** kasus (`careers@princetondg.com` -> CC `info@princetondg.com` terkirim; `loker@epl-group.com` -> Web Form resmi terkirim — **JANGAN KIRIM ULANG**)
  5. **(E) Skip / Tidak Memenuhi Syarat / Tutup (`E_SKIPPED_INELIGIBLE`)**: **`8`** grup lowongan (Nawatech mahasiswa aktif, APP Group IPK >= 3,50, Kompas Gramedia sysadmin mendalam, Sinar Sosro Jatim Sales/Akuntansi, Komdigi mahasiswa aktif, IMIP walk-in Sulawesi, Samsung C++/C#, dll.)

---

## 4. Radar 10 Target Lowongan Baru Terbaik (Rabu, 4 November 2026 — Non-Sales)

| # | Perusahaan | Posisi | Lokasi | Skor Fit | Kanal Resmi & Dokumen Wajib |
|---:|---|---|---|---:|---|
| **1** | **PT Chandra Asri Pacific Tbk (Chandra Asri Group)** | ASPIRE Graduate Development Program (GDP) — Operations & Engineering Track (Electrical / Instrumentation) | Cilegon (Site Office) / Jakarta (Head Office) | **94/100** | [Official Career Portal (SuccessFactors)](https://careers.chandra-asri.com/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf — NIN 001008202012026100162); Transkrip Akademik Resmi (Transkrip Ardhya Novri.pdf — HANYA jika diminta field upload portal) |
| **2** | **PT Hartono Istana Teknologi (Polytron)** | Hardware Engineer Trainee / EV R&D Electrical & Embedded Engineer | Kudus / Sayung (Jawa Tengah) & Jakarta | **93/100** | [Official Career Portal (career.polytron.co.id)](https://polytron.co.id/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf — NIN 001008202012026100162); Transkrip Akademik Resmi (Transkrip Ardhya Novri.pdf — jika diminta di form profil) |
| **3** | **PT Indonesia Epson Industry** | Automation Electrical Engineering Staff (Fresh Graduate) | EJIP Industrial Park, Cikarang Selatan (Bekasi) | **92/100** | [JobStreet Official Verified Account / Epson Recruitment](https://id.jobstreet.com/id/PT-Indonesia-Epson-Industry-jobs) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf) |
| **4** | **PT DCI Indonesia Tbk** | Electrical / Critical Facilities Operations Engineer (Fresh Graduate) | Cibitung (H1) / Karawang (H2) / Jakarta (E1) | **91/100** | [Official Website / LinkedIn Verified Easy Apply](https://www.dci-indonesia.com/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf) |
| **5** | **Mubadala Energy Indonesia** | Fresh Graduate Program 2027 — Project & Engineering Stream | Jakarta Selatan | **90/100** | [Mubadala Energy Official Careers Portal](https://www.mubadalaenergy.com/careers/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf); Transkrip Akademik Resmi (Transkrip Ardhya Novri.pdf — bila diminta verifikasi IPK >= 3,20) |
| **6** | **PT Astra Otoparts Tbk (Grup Astra)** | Engineering - AOP (Vacancy ID: 13651 — Maintenance, Process & Automation Engineering) | Jakarta Utara / Cikarang / Karawang | **90/100** | [Portal Resmi Astra Career (career.astra.co.id)](https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — sudah tersimpan di profil Astra Career per 31 Okt 18:26 WIB); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf) |
| **7** | **PT Astra Honda Motor (AHM)** | Engineering Development / Production Engineering Staff | Sunter / Cikarang / Karawang / Deltamas | **89/100** | [Portal Resmi Rekrutmen AHM (recruitment.astra-honda.com)](https://recruitment.astra-honda.com/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf); Transkrip Akademik Resmi (Transkrip Ardhya Novri.pdf — jika diminta di profil AHM) |
| **8** | **PT Djarum** | Electrical Engineer (Fresh Graduate) | Kudus, Jawa Tengah | **88/100** | [Portal Resmi Djarum Careers (djarumkarir.com)](https://www.djarum.com/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf); Transkrip Akademik Resmi (Transkrip Ardhya Novri.pdf — jika diminta) |
| **9** | **BDx Data Centers Indonesia** | Junior Critical Facility / Electrical Operations Engineer | Jakarta / Tangerang / Jatiluhur | **87/100** | [Official Career Page / LinkedIn Verified](https://www.bdxworld.com/careers/) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf) |
| **10** | **PT Kalbe Farma Tbk (Kalbe Group)** | Engineering & Automation Trainee / Supervisor | Cikarang / Pulogadung (Jabodetabek) | **86/100** | [Portal Resmi Karir Kalbe](https://www.kalbe.co.id/id/karir) <br> **Dokumen**: Master CV ATS (Ardhya Novri Ramadhan - CV ATS.pdf — 99.026 B); Ijazah Resmi UNDIP (Ijazah Ardhya Novri.pdf) |

### Detail Kecocokan & Alasan Teknis per Target Baru

#### `RADAR-261104-01` — PT Chandra Asri Pacific Tbk (Chandra Asri Group) (ASPIRE Graduate Development Program (GDP) — Operations & Engineering Track (Electrical / Instrumentation))
- **URL Resmi**: https://careers.chandra-asri.com/
- **Lokasi**: Cilegon (Site Office) / Jakarta (Head Office) | **Sektor**: Petrochemical & Energy Infrastructure | **Skor Kecocokan**: `94/100`
- **Audit Kualifikasi**: Lulusan S1 Teknik Elektro / Instrumentasi, Fresh Graduate (maks. 2 tahun pengalaman), IPK min. 3,30 (IPK Ardhya: 3,43 — LOLOS), Bahasa Inggris aktif.
- **Alasan Kecocokan Bukti CV**: Rotasi 8 minggu di PT Angkasa Pura Indonesia (5 minggu UPS/converter, 3 minggu relai proteksi, inspeksi gardu induk, SCADA & instalasi PLC) ditambah tesis akusisi sinyal & instrumentasi STM32 4 kHz sangat cocok untuk reliabilitas elektrikal & instrumentasi pabrik petrokimia Cilegon.
- **Subjek Email / Lamaran**: `Application - ASPIRE Graduate Development Program (Electrical Engineering) - Ardhya Novri Ramadhan`

#### `RADAR-261104-02` — PT Hartono Istana Teknologi (Polytron) (Hardware Engineer Trainee / EV R&D Electrical & Embedded Engineer)
- **URL Resmi**: https://polytron.co.id/
- **Lokasi**: Kudus / Sayung (Jawa Tengah) & Jakarta | **Sektor**: Consumer Electronics & Electric Vehicle (EV) R&D | **Skor Kecocokan**: `93/100`
- **Audit Kualifikasi**: S1 Teknik Elektro (Konsentrasi Elektronika / Arus Lemah / Kontrol), Fresh Graduate, menguasai mikrokontroler, C, sensor, PWM, dan pengujian hardware.
- **Alasan Kecocokan Bukti CV**: Kesesuaian langsung dengan konsentrasi Elektronika UNDIP, tesis STM32F411CEU6 (12-bit ADC + DMA nominal 4.000 Hz, filter digital IIR Butterworth/Notch), magang kontrol motor PWM ESP32 di Redesma Technologies, serta asisten praktikum perakitan & troubleshooting rangkaian 2 semester.
- **Subjek Email / Lamaran**: `Hardware Engineer Trainee - Ardhya Novri Ramadhan - S1 Teknik Elektro UNDIP`

#### `RADAR-261104-03` — PT Indonesia Epson Industry (Automation Electrical Engineering Staff (Fresh Graduate))
- **URL Resmi**: https://id.jobstreet.com/id/PT-Indonesia-Epson-Industry-jobs
- **Lokasi**: EJIP Industrial Park, Cikarang Selatan (Bekasi) | **Sektor**: Precision Manufacturing & Industrial Robotics | **Skor Kecocokan**: `92/100`
- **Audit Kualifikasi**: S1 Teknik Elektro / Elektronika, menguasai bahasa pemrograman C & Python, dasar sistem PLC/otomasi, dan pemecahan masalah perangkat keras-perangkat lunak.
- **Alasan Kecocokan Bukti CV**: JD Automation Electrical Engineering Epson secara spesifik meminta kombinasi Python, C, dan kontrol/PLC — sangat klop dengan pipeline STM32 C + Python UART telemetry, paket pengujian `uart-fixture-kit`, dan pelatihan PLC/SCADA.
- **Subjek Email / Lamaran**: `Automation Electrical Engineering - Ardhya Novri Ramadhan - Universitas Diponegoro`

#### `RADAR-261104-04` — PT DCI Indonesia Tbk (Electrical / Critical Facilities Operations Engineer (Fresh Graduate))
- **URL Resmi**: https://www.dci-indonesia.com/
- **Lokasi**: Cibitung (H1) / Karawang (H2) / Jakarta (E1) | **Sektor**: Tier-IV Hyperscale Data Center | **Skor Kecocokan**: `91/100`
- **Audit Kualifikasi**: S1 Teknik Elektro, memahami sistem distribusi daya kritikal (UPS, converter, relai proteksi, gardu induk, SCADA/BMS), siap bekerja dengan SOP fasilitas kritikal.
- **Alasan Kecocokan Bukti CV**: Pengalaman magang 8 minggu di Bandara Internasional Soekarno-Hatta (PT Angkasa Pura Indonesia) pada sistem UPS/converter (5 minggu), relai proteksi (3 minggu), inspeksi gardu induk, dan pemantauan SCADA adalah fondasi paling relevan untuk operasional data center Tier IV.
- **Subjek Email / Lamaran**: `Application - Electrical Facility Engineer - Ardhya Novri Ramadhan, S.T.`

#### `RADAR-261104-05` — Mubadala Energy Indonesia (Fresh Graduate Program 2027 — Project & Engineering Stream)
- **URL Resmi**: https://www.mubadalaenergy.com/careers/
- **Lokasi**: Jakarta Selatan | **Sektor**: Energy & Offshore Engineering | **Skor Kecocokan**: `90/100`
- **Audit Kualifikasi**: WNI, S1 Engineering (termasuk Electrical Engineering), IPK min. 3,20/4,00 (IPK Ardhya: 3,43 — LOLOS), Fresh Graduate / pengalaman maks. 1 tahun.
- **Alasan Kecocokan Bukti CV**: Program terstruktur penuh hingga Desember 2027 bagi fresh graduate teknik dengan IPK >= 3,20; kombinasi disiplin kelistrikan gardu/proteksi dan validasi data teknis mendukung stream Project & Engineering.
- **Subjek Email / Lamaran**: `Fresh Graduate Program 2027 (Project & Engineering) - Ardhya Novri Ramadhan`

#### `RADAR-261104-06` — PT Astra Otoparts Tbk (Grup Astra) (Engineering - AOP (Vacancy ID: 13651 — Maintenance, Process & Automation Engineering))
- **URL Resmi**: https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP
- **Lokasi**: Jakarta Utara / Cikarang / Karawang | **Sektor**: Automotive Components & Manufacturing Automation | **Skor Kecocokan**: `90/100`
- **Audit Kualifikasi**: S1 Teknik Elektro / Mekatronika, Fresh Graduate, minat pada process engineering, otomasi pabrik, dan efisiensi lini produksi.
- **Alasan Kecocokan Bukti CV**: Profil `career.astra.co.id` Ardhya sudah aktif dan memakai Master CV ATS 99.026 B; tinggal 1-klik Apply pada lowongan Engineering Astra Otoparts tanpa perlu upload ulang CV varian.
- **Subjek Email / Lamaran**: `Engineering - Astra Otoparts - Ardhya Novri Ramadhan`

#### `RADAR-261104-07` — PT Astra Honda Motor (AHM) (Engineering Development / Production Engineering Staff)
- **URL Resmi**: https://recruitment.astra-honda.com/
- **Lokasi**: Sunter / Cikarang / Karawang / Deltamas | **Sektor**: Automotive Manufacturing | **Skor Kecocokan**: `89/100`
- **Audit Kualifikasi**: S1 Teknik Elektro, IPK >= 3,00 (IPK Ardhya: 3,43 — LOLOS), memahami sistem kelistrikan, elektronika, kontrol/PLC, dan analisis data pengujian.
- **Alasan Kecocokan Bukti CV**: Belum ada aplikasi ke AHM pada riwayat 156 lamaran sebelumnya; pabrik Cikarang/Karawang AHM secara konsisten merekrut S1 Teknik Elektro untuk Production Engineering & Plant Maintenance.
- **Subjek Email / Lamaran**: `Production Engineering Staff - Ardhya Novri Ramadhan - S1 Teknik Elektro UNDIP`

#### `RADAR-261104-08` — PT Djarum (Electrical Engineer (Fresh Graduate))
- **URL Resmi**: https://www.djarum.com/
- **Lokasi**: Kudus, Jawa Tengah | **Sektor**: FMCG & High-Speed Industrial Manufacturing | **Skor Kecocokan**: `88/100`
- **Audit Kualifikasi**: S1 Teknik Elektro (Arus Kuat / Arus Lemah / Otomasi), IPK min. 3,00 (IPK Ardhya: 3,43 — LOLOS), bersedia ditempatkan di Kudus.
- **Alasan Kecocokan Bukti CV**: Posisi reguler resmi di `djarumkarir.com` khusus lulusan S1 Teknik Elektro untuk menangani sistem kelistrikan, PLC, sensor, dan mesin otomasi pabrik.
- **Subjek Email / Lamaran**: `Electrical Engineer - Ardhya Novri Ramadhan - S1 Teknik Elektro UNDIP`

#### `RADAR-261104-09` — BDx Data Centers Indonesia (Junior Critical Facility / Electrical Operations Engineer)
- **URL Resmi**: https://www.bdxworld.com/careers/
- **Lokasi**: Jakarta / Tangerang / Jatiluhur | **Sektor**: AI & Cloud Data Center Infrastructure | **Skor Kecocokan**: `87/100`
- **Audit Kualifikasi**: S1 Teknik Elektro, memahami sistem UPS, distribusi daya, relai proteksi, pemantauan fasilitas 24/7, dan dokumentasi SOP.
- **Alasan Kecocokan Bukti CV**: Melengkapi pipeline Data Center (setelah Amazon DCEO & PDG) dengan fokus pemeliharaan preventif UPS/converter dan relai proteksi.
- **Subjek Email / Lamaran**: `Application - Junior Critical Facility Engineer - Ardhya Novri Ramadhan, S.T.`

#### `RADAR-261104-10` — PT Kalbe Farma Tbk (Kalbe Group) (Engineering & Automation Trainee / Supervisor)
- **URL Resmi**: https://www.kalbe.co.id/id/karir
- **Lokasi**: Cikarang / Pulogadung (Jabodetabek) | **Sektor**: Pharmaceutical & Healthcare Manufacturing | **Skor Kecocokan**: `86/100`
- **Audit Kualifikasi**: S1 Teknik Elektro / Instrumentasi, IPK >= 3,00, memahami sistem otomasi mesin produksi, kalibrasi sensor, dan dokumentasi teknis.
- **Alasan Kecocokan Bukti CV**: Pengalaman kalibrasi sinyal & akuisisi data presisi (CRC-32/SHA-256 verification) serta pelatihan PLC/SCADA sangat relevan dengan standar Engineering & Utility pabrik farmasi Kalbe.
- **Subjek Email / Lamaran**: `Engineering & Automation Trainee - Ardhya Novri Ramadhan - S1 Teknik Elektro UNDIP`

---

## 5. Template Surat Lamaran / Email Siap Pakai (Patuh Batas Klaim CV)

### A. Template Bahasa Indonesia (Manufaktur, Otomasi, Elektrikal & MT — Polytron, Djarum, AHM, Astra Otoparts, Kalbe)
```text
Subjek: [Posisi yang Dilamar] - Ardhya Novri Ramadhan - S1 Teknik Elektro UNDIP

Yth. Tim Rekrutmen [Nama Perusahaan],

Perkenalkan, saya Ardhya Novri Ramadhan, S.T., lulusan S1 Teknik Elektro (Konsentrasi Elektronika) Universitas Diponegoro pada September 2026 dengan IPK 3,43/4,00 (148 SKS, Nomor Ijazah Nasional: 001008202012026100162). Melalui pesan ini, saya mengajukan lamaran untuk posisi [Nama Posisi] di [Nama Perusahaan].

Selama masa studi dan magang, saya membangun fondasi praktis di bidang sistem kelistrikan, elektronika terbenam (embedded systems), dan otomasi:
1. Electrical Engineering Intern di PT Angkasa Pura Indonesia (Bandara Internasional Soekarno-Hatta, 8 minggu): mengikuti rotasi 5 minggu pada sistem UPS/converter dan 3 minggu pada relai proteksi kelistrikan, serta berpartisipasi dalam inspeksi gardu induk, pemantauan SCADA, dan pelatihan instalasi PLC.
2. Tugas Akhir Akuisisi & Pemrosesan Sinyal Digital (STM32F411CEU6 & Python): merancang sistem akuisisi sinyal elektromiografi (EMG) 12-bit ADC dengan DMA pada frekuensi pencuplikan nominal 4.000 Hz, mengimplementasikan filter digital IIR Biquad (Butterworth HPF 20 Hz, LPF 500 Hz, dan Notch 50 Hz), serta membangun antarmuka telemetri UART ke Python dengan verifikasi integritas data CRC-32 dan SHA-256.
3. IoT & Embedded Systems Intern di Redesma Technologies: mengembangkan prototipe telemetri suhu berbasis ESP32 dan kontrol motor PWM, serta menyusun SOP teknis komparasi platform IoT.

Sebagai lampiran, saya sertakan CV ATS utama (`Ardhya Novri Ramadhan - CV ATS.pdf`) dan Ijazah Resmi S1 Teknik Elektro UNDIP (`Ijazah Ardhya Novri.pdf`). Transkrip Akademik resmi siap saya lampirkan sesuai kebutuhan portal rekrutmen.

Besar harapan saya untuk dapat mengikuti tahapan seleksi dan mendiskusikan kontribusi teknis yang dapat saya berikan bagi tim [Nama Perusahaan]. Terima kasih atas waktu dan perhatian Bapak/Ibu.

Hormat saya,
Ardhya Novri Ramadhan, S.T.
Email: ardhyasan@gmail.com
Portofolio: https://ardhyanovri.my.id/ | GitHub: https://github.com/vanovri | LinkedIn: https://www.linkedin.com/in/dhya
```

### B. Template Bahasa Inggris (Multinasional, Data Center, Petrokimia & Energi — Chandra Asri ASPIRE, Mubadala Energy, DCI Indonesia, BDx, Epson)
```text
Subject: Application - [Role Title] - Ardhya Novri Ramadhan (B.Eng. Electrical Engineering, UNDIP)

Dear Talent Acquisition Team at [Company Name],

I am writing to apply for the [Role Title] position at [Company Name]. I graduated with a Bachelor of Engineering in Electrical Engineering (Electronics Concentration) from Diponegoro University (UNDIP) in September 2026 with a cumulative GPA of 3.43/4.00 (National Diploma Number: 001008202012026100162).

My academic and internship background combines critical electrical infrastructure exposure, embedded firmware development, and automated Python verification:
- Critical Power & Protection Exposure (PT Angkasa Pura Indonesia, Soekarno-Hatta International Airport): Completed an 8-week Electrical Engineering internship (5 weeks in UPS/converter systems and 3 weeks in electrical protection relays), participating in substation inspections, SCADA monitoring, and guided PLC installation training.
- Embedded Signal Acquisition & Telemetry (Undergraduate Thesis): Built an STM32F411CEU6 surface EMG acquisition subsystem using a 12-bit ADC with DMA at a nominal 4,000 Hz sampling rate, cascaded 2nd-order Butterworth (20 Hz HPF, 500 Hz LPF) and 50 Hz Notch digital filters, and UART telemetry to a Python desktop application verified with CRC-32 and SHA-256 checks.
- IoT Prototyping & Software Verification (Redesma Technologies & Independent Projects): Developed ESP32 temperature telemetry and PWM motor-control prototypes, authored technical SOPs, and created `uart-fixture-kit` (an open-source Python package for synthetic UART stream parser verification with 130 passing pytest tests).

Attached are my single-page ATS CV (`Ardhya Novri Ramadhan - CV ATS.pdf`) and official Bachelor's Degree Diploma (`Ijazah Ardhya Novri.pdf`). My official academic transcript is also available upon request.

Thank you for your time and consideration. I look forward to the opportunity to discuss how my foundation in electrical systems, instrumentation, and software tooling can contribute to [Company Name].

Sincerely,
Ardhya Novri Ramadhan, S.T.
Email: ardhyasan@gmail.com
Portfolio: https://ardhyanovri.my.id/ | GitHub: https://github.com/vanovri | LinkedIn: https://www.linkedin.com/in/dhya
```
