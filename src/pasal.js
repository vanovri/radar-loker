// Pasal & Kontrak Diff Explainer — membandingkan draf UU/RUU atau Kontrak Kerja PKWT pasal demi pasal
// dan menerjemahkan pergeseran kata kunci hukum ke bahasa manusia.

export const PASAL_PRESETS = {
  pkwt_uu: {
    title: 'Aturan Kontrak PKWT: UU Ketenagakerjaan (Lama) vs UU Cipta Kerja & PP 35/2021 (Baru)',
    oldLabel: 'UU 13/2003 Pasal 59 (Lama)',
    newLabel: 'UU 6/2023 & PP 35/2021 (Baru)',
    oldText: `Perjanjian kerja untuk waktu tertentu hanya dapat diadakan untuk pekerjaan tertentu yang menurut jenis dan sifat atau kegiatan pekerjaannya akan selesai dalam waktu tertentu. Perjanjian kerja waktu tertentu dapat diadakan untuk paling lama 2 (dua) tahun dan hanya boleh diperpanjang 1 (satu) kali untuk jangka waktu paling lama 1 (satu) tahun. Pengusaha tidak wajib memberikan uang kompensasi saat masa PKWT berakhir sesuai jangka waktu.`,
    newText: `Perjanjian kerja untuk waktu tertentu hanya dapat diadakan untuk pekerjaan tertentu yang menurut jenis dan sifat atau kegiatan pekerjaannya akan selesai dalam waktu tertentu. Perjanjian kerja waktu tertentu berdasarkan jangka waktu dapat dibuat untuk paling lama 5 (lima) tahun termasuk perpanjangan. Pengusaha wajib memberikan uang kompensasi kepada pekerja pada saat berakhirnya PKWT yang telah mempunyai masa kerja paling sedikit 1 (satu) bulan secara terus menerus.`,
  },
  kontrak_jebakan: {
    title: 'Kontrak Kerja PKWT Wajar vs Kontrak Kerja PKWT Penuh Jebakan',
    oldLabel: 'Draf Kontrak Standar & Adil',
    newLabel: 'Draf Kontrak "Nakal" (Perlu Ditolak/Dinego)',
    oldText: `Pekerja bekerja selama 40 (empat puluh) jam seminggu dari Senin sampai Jumat. Kelebihan jam kerja dihitung sebagai kerja lembur yang wajib dibayar perusahaan sesuai peraturan perundang-undangan. Dokumen ijazah asli hanya ditunjukkan saat verifikasi awal dan tidak ditahan oleh perusahaan. Apabila Pekerja mengundurkan diri dengan pemberitahuan 30 hari sebelumnya, Pekerja tidak dikenakan denda atau penalti finansial.`,
    newText: `Pekerja bekerja dari Senin sampai Sabtu dan dapat diminta masuk pada hari Minggu sesuai kebutuhan operasional. Kelebihan jam kerja dianggap sebagai bagian dari tanggung jawab jabatan dan tidak dihitung sebagai kerja lembur. Dokumen ijazah asli wajib diserahkan untuk ditahan oleh perusahaan selama masa kontrak 2 tahun sebagai jaminan. Apabila Pekerja mengundurkan diri sebelum masa kontrak berakhir, Pekerja wajib membayar denda penalti sebesar Rp 25.000.000 secara tunai.`,
  },
  outsourcing: {
    title: 'Aturan Alih Daya (Outsourcing): UU 13/2003 vs UU Cipta Kerja',
    oldLabel: 'UU 13/2003 Pasal 65–66 (Lama)',
    newLabel: 'UU 6/2023 & PP 35/2021 (Baru)',
    oldText: `Pekerjaan yang dapat diserahkan kepada perusahaan penyedia jasa pekerja dibatasi hanya untuk kegiatan penunjang yang tidak berhubungan langsung dengan proses produksi utama, seperti usaha pelayanan kebersihan, penyediaan makanan, tenaga pengaman, dan angkutan.`,
    newText: `Perusahaan dapat menyerahkan sebagian pelaksanaan pekerjaan kepada perusahaan alih daya melalui perjanjian alih daya secara tertulis tanpa pembatasan eksplisit hanya pada kegiatan penunjang dalam undang-undang, sepanjang perusahaan alih daya wajib menerapkan prinsip pelindungan hak pekerja dan pengalihan pelindungan (TUPE) apabila menggunakan PKWT.`,
  },
};

function tokenize(text) {
  return String(text || '')
    .trim()
    .split(/(\s+|[.,;()]+)/)
    .filter((t) => t && !/^\s+$/.test(t));
}

// LCS word diff sederhana dan deterministik
export function diffWords(oldStr, newStr) {
  const a = tokenize(oldStr);
  const b = tokenize(newStr);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i].toLowerCase() === b[j].toLowerCase()) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i].toLowerCase() === b[j].toLowerCase()) {
      ops.push({ type: 'same', text: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'del', text: a[i++] });
    } else {
      ops.push({ type: 'ins', text: b[j++] });
    }
  }
  while (i < n) ops.push({ type: 'del', text: a[i++] });
  while (j < m) ops.push({ type: 'ins', text: b[j++] });
  return ops;
}

const IMPACT_RULES = [
  {
    id: 'wajib-ke-dapat',
    test: (o, n) => /\bwajib\b/i.test(o) && !/\bwajib\b/i.test(n) && /\bdapat\b/i.test(n),
    tone: 'bahaya',
    title: 'Kewajiban berubah jadi opsional ("wajib" → "dapat")',
    explain: 'Kata "wajib" yang hilang atau diganti "dapat" membuat hak Anda tidak lagi mengikat secara tegas.',
  },
  {
    id: 'tambah-kompensasi',
    test: (o, n) => /tidak\s+wajib.*kompensasi/i.test(o) && /\bwajib\s+memberikan\s+uang\s+kompensasi/i.test(n),
    tone: 'aman',
    title: 'Hak Uang Kompensasi PKWT bertambah',
    explain: 'Berdasarkan PP 35/2021, pekerja kontrak (PKWT) yang sudah bekerja minimal 1 bulan berhak atas uang kompensasi saat kontrak berakhir (proporsional 1 bulan upah per 12 bulan kerja).',
  },
  {
    id: 'durasi-kontrak',
    test: (o, n) => /2\s*\(dua\)\s*tahun/i.test(o) && /5\s*\(lima\)\s*tahun/i.test(n),
    tone: 'waspada',
    title: 'Batas maksimum kontrak PKWT naik dari 2+1 tahun menjadi 5 tahun',
    explain: 'Pekerja bisa berstatus kontrak lebih lama (sampai 5 tahun total termasuk perpanjangan) sebelum diangkat menjadi karyawan tetap (PKWTT).',
  },
  {
    id: 'hapus-lembur',
    test: (o, n) => /tidak\s+dihitung\s+sebagai\s+kerja\s+lembur|lembur\s+tidak\s+dibayar/i.test(n),
    tone: 'bahaya',
    title: 'Klausul penghapusan upah lembur',
    explain: 'Bekerja melebihi 40 jam/minggu pada posisi staf biasa wajib dibayar upah lembur (UU Ketenagakerjaan & PP 35/2021). Klausul "dianggap tanggung jawab jabatan" sering disalahgunakan untuk lembur gratis.',
  },
  {
    id: 'tahan-ijazah',
    test: (o, n) => !/ditahan\s+oleh\s+perusahaan\s+selama/i.test(o) && /((ditahan|menahan).*ijazah|ijazah.*(ditahan|sebagai\s+jaminan))/i.test(n),
    tone: 'bahaya',
    title: 'Klausul penahanan ijazah asli masuk ke kontrak',
    explain: 'Dilarang oleh SE Menaker No. M/5/HK.04.00/V/2025. Jangan serahkan ijazah asli; tawarkan legalisir cap basah atau verifikasi tunjuk-asli saat onboarding.',
  },
  {
    id: 'denda-resign',
    test: (o, n) => /tidak\s+dikenakan\s+denda/i.test(o) && /(denda|penalti).*rp/i.test(n),
    tone: 'bahaya',
    title: 'Muncul denda/penalti resign bernominal besar',
    explain: 'Dalam PKWT (Pasal 62 UU 13/2003), pihak yang mengakhiri hubungan kerja sebelum waktunya memang bisa dikenai ganti rugi sisa kontrak, tetapi denda sepihak yang hanya berlaku untuk pekerja (bukan perusahaan) sangat merugikan.',
  },
  {
    id: 'batas-outsourcing',
    test: (o, n) => /dibatasi\s+hanya\s+untuk\s+kegiatan\s+penunjang/i.test(o) && /tanpa\s+pembatasan\s+eksplisit/i.test(n),
    tone: 'waspada',
    title: 'Pembatasan jenis pekerjaan outsourcing melonggar',
    explain: 'Pembatasan eksplisit 5 bidang penunjang di UU lama dihapus, namun perusahaan alih daya wajib menjamin pengalihan pelindungan hak (TUPE) bagi pekerja kontrak bila terjadi pergantian vendor.',
  },
];

export function explainDiff(oldText, newText) {
  const ops = diffWords(oldText, newText);
  const added = ops.filter((x) => x.type === 'ins').length;
  const removed = ops.filter((x) => x.type === 'del').length;

  const impacts = IMPACT_RULES.filter((r) => r.test(oldText, newText)).map(({ id, tone, title, explain }) => ({
    id,
    tone,
    title,
    explain,
  }));

  // Deteksi perubahan angka secara generik
  const oldNums = (oldText.match(/\b\d+(?:[.,]\d+)?\s*(tahun|bulan|hari|jam|kali|juta|%)/gi) || []).map((s) => s.toLowerCase());
  const newNums = (newText.match(/\b\d+(?:[.,]\d+)?\s*(tahun|bulan|hari|jam|kali|juta|%)/gi) || []).map((s) => s.toLowerCase());
  const changedNums = newNums.filter((n) => !oldNums.includes(n));
  if (changedNums.length && !impacts.length) {
    impacts.push({
      id: 'angka-berubah',
      tone: 'waspada',
      title: `Perubahan angka/batas waktu: ${changedNums.join(', ')}`,
      explain: 'Periksa apakah perubahan angka durasi, jam, atau nominal ini menguntungkan atau justru menambah beban kewajiban Anda.',
    });
  }

  return { ops, stats: { added, removed }, impacts };
}
