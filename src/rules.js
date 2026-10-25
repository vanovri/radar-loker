// Radar Loker — rule engine deteksi red flag lowongan kerja Indonesia.
// Murni client-side, deterministik, tanpa API. Setiap temuan wajib bisa dijelaskan.

const NEGATION = /(tidak|tdk|tanpa|bebas|gratis|free|no|bukan|nol|0)\s*(ada\s+)?(dipungut\s+)?$/;
const COVERED_AFTER = /^\s*(ditanggung|gratis|free|dibayar(kan)?\s+perusahaan|oleh\s+perusahaan)/;

// severity: bahaya (indikasi penipuan/pelanggaran), waspada (merugikan pelamar), catatan (perlu ditanya)
export const RULES = [
  {
    id: 'biaya',
    severity: 'bahaya',
    weight: 45,
    label: 'Minta biaya dari pelamar',
    patterns: [
      /(biaya|uang|bayar)\s+(pendaftaran|administrasi|admin|training|pelatihan|seragam|medical|mcu|tes|test|jaminan|pemberkasan|id\s*card|psikotes|akomodasi\s+interview)/g,
      /transfer\s+(dulu|terlebih\s+dahulu|ke\s+rekening)/g,
      /bayar\s+(di\s*muka|dulu|terlebih\s+dahulu)/g,
      /\bdeposit\b/g,
    ],
    negatable: true,
    why: 'Perusahaan resmi tidak memungut biaya dari pelamar. Ini pola penipuan loker paling umum.',
    tip: 'Jangan transfer apa pun. Cek nama perusahaan di AHU Kemenkumham dan situs resminya.',
  },
  {
    id: 'ijazah',
    severity: 'bahaya',
    weight: 45,
    label: 'Penahanan ijazah / dokumen asli',
    patterns: [
      /(penahanan|menahan|ditahan|tahan|menitipkan|dititipkan|menyerahkan|jaminan)\s+(ijazah|ijasah|bpkb|sertifikat\s+asli)/g,
      /(ijazah|ijasah)\s+asli\s+(ditahan|disimpan|dititipkan|sebagai\s+jaminan|diserahkan)/g,
      /(ijazah|ijasah)\s+(sebagai|untuk)\s+jaminan/g,
    ],
    negatable: true,
    why: 'Pemberi kerja dilarang menahan ijazah/dokumen pribadi pekerja.',
    ref: 'SE Menaker No. M/5/HK.04.00/V/2025',
    tip: 'Tanyakan tertulis. Kalau tetap diminta, laporkan ke Disnaker setempat.',
  },
  {
    id: 'task-scam',
    severity: 'bahaya',
    weight: 45,
    label: 'Pola penipuan "kerja tugas online"',
    patterns: [
      /(like|subscribe|follow|rating|review|klik)\s+(video|produk|toko|hotel|postingan|konten)/g,
      /komisi\s+per\s+(tugas|task|klik|order)/g,
      /(tugas|task)\s+harian\s+(dibayar|komisi|bayaran)/g,
      /(gabung|join|masuk)\s+(grup|group|channel)\s+telegram/g,
      /kerja\s+(cuma|hanya)\s+(dari\s+)?(hp|handphone)/g,
    ],
    why: 'Modus "kerja like & subscribe" berujung diminta deposit untuk tugas berikutnya.',
    tip: 'Lowongan asli tidak membayar per like/rating. Abaikan dan blokir.',
  },
  {
    id: 'data-sensitif',
    severity: 'bahaya',
    weight: 40,
    label: 'Minta data finansial / OTP',
    patterns: [
      /\b(kode\s+)?otp\b/g,
      /\bpin\s+(atm|bank|m-?banking)/g,
      /(foto|kirim|lampirkan)\s+(buku\s+tabungan|kartu\s+atm|kartu\s+kredit)/g,
      /selfie\s+(dengan|sambil|pegang|memegang)\s+ktp/g,
    ],
    why: 'Data ini dipakai untuk pinjol ilegal atau pembobolan rekening atas nama Anda.',
    tip: 'Rekening hanya diserahkan setelah tanda tangan kontrak kerja resmi.',
  },
  {
    id: 'pasti-diterima',
    severity: 'waspada',
    weight: 20,
    label: 'Janji pasti diterima / tanpa seleksi',
    patterns: [
      /(pasti|dijamin|100\s*%)\s+(diterima|lolos|kerja)/g,
      /langsung\s+kerja\s+tanpa\s+(tes|test|interview|wawancara|seleksi)/g,
      /tanpa\s+(tes|test|interview|wawancara)\s+langsung\s+kerja/g,
    ],
    why: 'Rekrutmen resmi selalu ada seleksi. Jaminan diterima sering jadi umpan biaya.',
    tip: 'Tanyakan tahapan seleksi dan siapa pewawancaranya.',
  },
  {
    id: 'komisi-saja',
    severity: 'waspada',
    weight: 20,
    label: 'Tanpa gaji pokok (komisi saja)',
    patterns: [
      /tanpa\s+gaji\s+pokok/g,
      /(full|hanya|murni)\s+komisi/g,
      /komisi\s+(saja|only)/g,
      /gaji\s+(dari|berdasarkan)\s+komisi/g,
    ],
    why: 'Tanpa gaji pokok berarti risiko penjualan sepenuhnya ditanggung Anda.',
    tip: 'Minta rincian gaji pokok tertulis sebelum tanda tangan.',
  },
  {
    id: 'unpaid',
    severity: 'waspada',
    weight: 20,
    label: 'Magang/kerja tidak dibayar',
    patterns: [
      /\bunpaid\b/g,
      /(magang|internship|trainee|training)\s+(tidak|tanpa)\s+(dibayar|digaji|gaji|uang\s+saku)/g,
      /tanpa\s+uang\s+saku/g,
    ],
    why: 'Pemagang berhak atas uang saku. Kerja penuh waktu tanpa bayaran itu eksploitasi.',
    ref: 'Permenaker No. 6 Tahun 2020 (pemagangan dalam negeri)',
    tip: 'Tanyakan uang saku, durasi, dan apakah ada perjanjian pemagangan tertulis.',
  },
  {
    id: 'penalti',
    severity: 'waspada',
    weight: 15,
    label: 'Ikatan dinas / denda resign',
    patterns: [
      /ikatan\s+dinas/g,
      /\b(denda|penalti|pinalti)\b/g,
      /ganti\s+rugi\s+(jika|apabila|bila)\s+(resign|keluar|mengundurkan)/g,
      /\bbond\b/g,
    ],
    why: 'Denda resign bisa membuat Anda terjebak. Tidak selalu ilegal, tapi wajib jelas.',
    tip: 'Minta nominal denda, durasi ikatan, dan pelatihan apa yang diganti — tertulis.',
  },
  {
    id: 'jam-kerja',
    severity: 'waspada',
    weight: 15,
    label: 'Jam kerja berlebihan',
    patterns: [
      /senin\s*(-|–|s\/d|sampai|hingga)\s*minggu/g,
      /7\s+hari\s+(kerja|seminggu|dalam\s+seminggu)/g,
      /tanpa\s+libur/g,
      /lembur\s+(tidak|tanpa)\s+(dibayar|upah)/g,
      /siap\s+lembur\s+tanpa/g,
    ],
    why: 'Waktu kerja maksimal 40 jam/minggu; lembur wajib dibayar.',
    ref: 'UU 13/2003 jo. UU 6/2023 (Cipta Kerja), PP 35/2021',
    tip: 'Tanyakan jadwal pasti dan skema upah lembur.',
  },
  {
    id: 'email-gratis',
    severity: 'waspada',
    weight: 10,
    label: 'Kontak email gratisan / WA saja',
    patterns: [
      /[\w.+-]+@(gmail|yahoo|ymail|hotmail|outlook|live)\.(com|co\.id)/g,
      /(wa|whatsapp)\s+(only|saja|aja)/g,
      /hanya\s+(via|lewat|melalui)\s+(wa|whatsapp)/g,
    ],
    why: 'Perusahaan mapan biasanya pakai domain email sendiri. Penipu sering pakai Gmail/WA.',
    tip: 'Cocokkan kontak dengan situs resmi atau halaman LinkedIn perusahaan.',
  },
  {
    id: 'link-pendek',
    severity: 'waspada',
    weight: 10,
    label: 'Link disingkat',
    patterns: [/\b(bit\.ly|s\.id|tinyurl\.com|cutt\.ly|shorturl\.at|linktr\.ee|rb\.gy)\/\S*/g],
    why: 'Link pendek menyembunyikan tujuan asli; sering dipakai untuk phising formulir.',
    tip: 'Buka lewat situs resmi perusahaan, bukan dari link pendek.',
  },
  {
    id: 'multitasking',
    severity: 'catatan',
    weight: 8,
    label: 'Satu orang dibebani banyak peran',
    patterns: [/multi\s*-?\s*tasking/g, /serba\s+bisa/g, /\bmerangkap\b/g, /bisa\s+(semua|segala)\s+(hal|pekerjaan)/g],
    why: 'Sering artinya satu orang mengerjakan beberapa jabatan dengan satu gaji.',
    tip: 'Tanyakan jobdesk utama dan ukuran tim.',
  },
  {
    id: 'fisik',
    severity: 'catatan',
    weight: 8,
    label: 'Syarat fisik / status tidak relevan',
    patterns: [
      /berpenampilan\s+menarik/g,
      /good\s+looking/g,
      /tinggi\s+badan\s+(min|minimal)/g,
      /berat\s+badan\s+(ideal|proporsional)/g,
      /belum\s+menikah/g,
    ],
    why: 'Syarat yang tidak terkait kemampuan kerja; patut dipertanyakan relevansinya.',
    tip: 'Nilai apakah syarat ini masuk akal untuk posisinya.',
  },
  {
    id: 'budaya',
    severity: 'catatan',
    weight: 5,
    label: 'Frasa klise beban kerja',
    patterns: [/kekeluargaan/g, /loyalitas\s+tinggi/g, /(di\s*bawah|dibawah)\s+tekanan/g, /siap\s+ditempatkan\s+di\s+mana\s+saja/g],
    why: 'Tidak selalu buruk, tapi sering dipakai untuk menormalkan lembur tanpa batas.',
    tip: 'Tanyakan ke karyawan lama (LinkedIn, Glassdoor, JobStreet review).',
  },
];

// UMP provinsi terendah 2025 = Jawa Tengah Rp2.169.349. Di bawah Rp2 juta/bulan pasti di bawah UMP mana pun.
export const MIN_WAGE_FLOOR = 2_000_000;
const TOO_GOOD = 10_000_000;

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function toRupiah(num, unit) {
  let n = num.replace(/\s/g, '');
  const u = (unit || '').toLowerCase();
  if (u === 'juta' || u === 'jt') {
    n = n.replace(',', '.');
    // "4.5 juta" -> 4.5 ; "4.500 juta" is nonsense, ignore
    const v = parseFloat(n);
    return Number.isFinite(v) ? Math.round(v * 1_000_000) : NaN;
  }
  if (u === 'rb' || u === 'ribu' || u === 'k') {
    const v = parseFloat(n.replace(',', '.'));
    return Number.isFinite(v) ? Math.round(v * 1_000) : NaN;
  }
  // Rp 4.500.000 / 4,500,000 / 4500000
  const digits = n.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(/[.,]\d{1,2}$/, '');
  return parseInt(digits, 10);
}

export function extractSalary(t) {
  const amounts = [];
  const re = /(rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?\b/g;
  let m;
  while ((m = re.exec(t))) {
    const [full, rp, num, unit] = m;
    if (!rp && !unit) continue; // angka biasa (usia, kuota, tahun)
    const ctx = t.slice(Math.max(0, m.index - 40), m.index + full.length + 25);
    if (!/(gaji|salary|upah|take\s*home|thp|penghasilan|income|rp)/.test(ctx)) continue;
    if (/(biaya|bayar|deposit|transfer|denda|penalti|pinalti)/.test(t.slice(Math.max(0, m.index - 30), m.index))) continue;
    const v = toRupiah(num, unit);
    const after = t.slice(m.index + full.length, m.index + full.length + 18);
    const period = /^\s*(\/|per\s*)\s*(hari|day)|^\s*harian/.test(after)
      ? 'hari'
      : /^\s*(\/|per\s*)\s*(minggu|week)/.test(after)
        ? 'minggu'
        : 'bulan';
    const floor = period === 'bulan' ? 300_000 : 20_000;
    if (!Number.isFinite(v) || v < floor || v > 200_000_000) continue;
    amounts.push({ value: v, period, text: full.trim() });
  }
  const monthly = amounts.filter((a) => a.period === 'bulan');
  if (!monthly.length) return { found: amounts.length > 0, amounts };
  const values = monthly.map((a) => a.value);
  return { found: true, amounts, min: Math.min(...values), max: Math.max(...values) };
}

function extractMaxAge(t) {
  const m =
    t.match(/(usia|umur)\s*(maks(imal|imum)?|max\.?)\s*(\d{2})/) ||
    t.match(/(usia|umur)\s*(\d{2})\s*(-|–|s\/d|sampai)\s*(\d{2})/);
  if (!m) return null;
  const n = parseInt(m[m.length - 1], 10);
  return n >= 17 && n <= 65 ? n : null;
}

function negated(t, index, len) {
  const before = t.slice(Math.max(0, index - 22), index);
  const after = t.slice(index + len, index + len + 30);
  return NEGATION.test(before) || COVERED_AFTER.test(after);
}

function snippet(t, index, len) {
  const s = Math.max(0, index - 30);
  const e = Math.min(t.length, index + len + 30);
  return (s > 0 ? '…' : '') + t.slice(s, e) + (e < t.length ? '…' : '');
}

export function analyze(raw) {
  const t = normalize(raw);
  const findings = [];

  for (const rule of RULES) {
    const evidence = [];
    const hits = []; // posisi match, untuk membuang cuplikan yang tumpang tindih
    for (const p of rule.patterns) {
      p.lastIndex = 0;
      let m;
      while ((m = p.exec(t))) {
        if (rule.negatable && negated(t, m.index, m[0].length)) continue;
        if (hits.some((h) => Math.abs(h - m.index) < 45)) continue;
        hits.push(m.index);
        evidence.push(snippet(t, m.index, m[0].length));
        if (evidence.length >= 3) break;
      }
    }
    if (evidence.length) {
      const { patterns, negatable, ...meta } = rule;
      findings.push({ ...meta, evidence: [...new Set(evidence)] });
    }
  }

  const salary = extractSalary(t);
  const juniorish = /(tanpa\s+pengalaman|tidak\s+perlu\s+pengalaman|fresh\s*graduate|lulusan\s+baru|lulusan\s+(sma|smk|slta)|pemula)/.test(t);
  if (salary.max && salary.max >= TOO_GOOD && juniorish) {
    findings.push({
      id: 'gaji-tidak-wajar',
      severity: 'bahaya',
      weight: 35,
      label: 'Gaji terlalu tinggi untuk posisi pemula',
      why: 'Gaji ≥ Rp10 juta tanpa syarat pengalaman adalah umpan klasik penipuan.',
      tip: 'Bandingkan dengan posisi serupa di JobStreet/Glints. Waspadai permintaan biaya setelahnya.',
      evidence: salary.amounts.map((a) => a.text),
    });
  }
  if (salary.min && salary.min < MIN_WAGE_FLOOR) {
    findings.push({
      id: 'gaji-rendah',
      severity: 'waspada',
      weight: 20,
      label: 'Gaji di bawah upah minimum',
      why: 'Di bawah Rp2 juta/bulan berarti di bawah UMP provinsi mana pun (UMP terendah 2025: Jawa Tengah Rp2.169.349).',
      ref: 'PP 36/2021 jo. PP 51/2023 tentang Pengupahan',
      tip: 'Cek UMK kota penempatan. Membayar di bawah upah minimum melanggar hukum.',
      evidence: salary.amounts.filter((a) => a.period === 'bulan').map((a) => a.text),
    });
  }
  if (!salary.found && t.length > 80) {
    findings.push({
      id: 'gaji-tidak-ada',
      severity: 'catatan',
      weight: 3,
      label: 'Gaji tidak dicantumkan',
      why: 'Umum di Indonesia, tapi membuat Anda tanpa patokan saat nego.',
      tip: 'Tanyakan kisaran gaji sebelum tahap interview kedua.',
      evidence: [],
    });
  }
  const maxAge = extractMaxAge(t);
  if (maxAge && maxAge <= 25) {
    findings.push({
      id: 'usia-sempit',
      severity: 'catatan',
      weight: 5,
      label: `Batas usia sempit (maks ${maxAge} tahun)`,
      why: 'Legal, tapi menyempitkan peluang dan sering dipakai untuk menekan gaji.',
      tip: 'Kalau usia Anda pas di batas, tetap lamar — banyak yang fleksibel.',
      evidence: [],
    });
  }

  const order = { bahaya: 0, waspada: 1, catatan: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || b.weight - a.weight);

  let score = Math.min(100, findings.reduce((s, f) => s + f.weight, 0));
  const hasDanger = findings.some((f) => f.severity === 'bahaya');
  if (hasDanger) score = Math.max(score, 60);

  const level =
    score >= 70
      ? { key: 'penipuan', label: 'Kemungkinan penipuan' }
      : score >= 40
        ? { key: 'merah', label: 'Banyak red flag' }
        : score >= 15
          ? { key: 'waspada', label: 'Perlu waspada' }
          : { key: 'aman', label: 'Relatif aman' };

  return { score, level, findings, salary, chars: t.length };
}
