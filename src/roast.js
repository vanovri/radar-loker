// Roast CV ala HRD — Mesin audit CV deterministik + 3 persona roasting + saran perbaikan XYZ.

const WEAK_STARTS = [
  { re: /\bbertanggung\s+jawab\s+(atas|untuk|dalam)\b/gi, fix: 'Ganti dengan kata kerja aktif: "Mengelola…", "Membangun…", atau "Menurunkan…"' },
  { re: /\bmembantu\s+(dalam|untuk|tim)?\b/gi, fix: 'Sebutkan kontribusi spesifik yang Anda kerjakan sendiri, bukan sekadar "membantu".' },
  { re: /\bterlibat\s+dalam\b/gi, fix: 'Jelaskan peran spesifik Anda di proyek tersebut dan hasilnya.' },
  { re: /\bmelakukan\s+pekerjaan\b/gi, fix: 'Terlalu kabur. Sebutkan tindakan teknis dan output terukurnya.' },
  { re: /\bikut\s+serta\b/gi, fix: 'Ganti dengan aksi konkret: "Merancang", "Menguji", "Mengotomasi".' },
];

const CLICHES = [
  'pekerja keras',
  'mampu bekerja di bawah tekanan',
  'mampu bekerja dalam tim maupun individu',
  'cepat belajar',
  'fast learner',
  'hard worker',
  'detail oriented',
  'bermotivasi tinggi',
  'komunikatif',
  'jujur dan disiplin',
];

const STRONG_VERBS = /\b(membangun|merancang|mengembangkan|menurunkan|meningkatkan|mengotomasi|memimpin|mengelola|menganalisis|mengintegrasikan|menyusun|menginspeksi|engineered|developed|built|reduced|increased|automated|led|designed|implemented|deployed)\b/gi;

const PRIVACY_LEAKS = [
  { id: 'nik', re: /\b\d{16}\b/, label: 'Nomor KTP/NIK 16 digit tertulis di CV' },
  { id: 'ump', re: /mengikuti\s+ump|sesuai\s+umk|gaji\s+ump/i, label: 'Mencantumkan harapan gaji UMP/UMK di CV' },
  { id: 'agama-status', re: /\b(agama\s*:|status\s*perkawinan\s*:|belum\s+menikah|golongan\s+darah)\b/i, label: 'Data pribadi tidak relevan (agama/status kawin/gol. darah)' },
];

export function auditCV(raw, persona = 'jaksel') {
  const text = String(raw || '').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // Deteksi metrik kuantitatif (%, Rp, angka + unit dampak)
  const metricMatches = text.match(/\b(\d+(?:[.,]\d+)?\s*(%|persen|x|kali|jam|hari|minggu|bulan|orang|klien|modul|fitur|sensor|hz|khz|ms|detik|juta|rb)|rp\.?\s*\d+)/gi) || [];
  const strongVerbMatches = text.match(STRONG_VERBS) || [];

  const weakFound = [];
  for (const w of WEAK_STARTS) {
    const m = text.match(w.re);
    if (m) weakFound.push({ phrase: m[0], count: m.length, fix: w.fix });
  }

  const lower = text.toLowerCase();
  const clichesFound = CLICHES.filter((c) => lower.includes(c));
  const leaks = PRIVACY_LEAKS.filter((p) => p.re.test(text));

  const hasEmail = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+62|08)\d[\d\s-]{7,13}/.test(text);
  const hasPortfolio = /(github\.com|linkedin\.com|[\w-]+\.(my\.id|dev|id|com|io|me))/i.test(text);
  const hasSkills = /\b(skill|keahlian|keterampilan|tools|teknologi|python|javascript|c\+\+|stm32|autocad|excel|sql|react|plc)\b/i.test(text);

  // Skor dasar 50, tambah dari kekuatan, kurangi dari kelemahan
  let score = 50;
  score += Math.min(25, metricMatches.length * 5);
  score += Math.min(15, strongVerbMatches.length * 3);
  if (hasEmail && hasPhone) score += 5;
  if (hasPortfolio) score += 5;
  if (hasSkills) score += 5;
  if (words >= 180 && words <= 700) score += 5;

  score -= weakFound.length * 7;
  score -= clichesFound.length * 5;
  score -= leaks.length * 8;
  if (words < 80) score -= 25;
  if (words > 900) score -= 10;
  if (!hasEmail || !hasPhone) score -= 10;

  score = Math.max(5, Math.min(98, Math.round(score)));

  const roasts = buildRoast(persona, {
    score,
    words,
    metrics: metricMatches.length,
    strongVerbs: strongVerbMatches.length,
    weakFound,
    clichesFound,
    leaks,
    hasPortfolio,
    hasEmail,
    hasPhone,
  });

  const rewrites = suggestRewrites(lines);

  return {
    score,
    persona,
    stats: {
      words,
      metrics: metricMatches.length,
      strongVerbs: strongVerbMatches.length,
      cliches: clichesFound.length,
      weakPhrases: weakFound.length,
    },
    checks: { hasEmail, hasPhone, hasPortfolio, hasSkills },
    clichesFound,
    weakFound,
    leaks,
    roasts,
    rewrites,
  };
}

function buildRoast(persona, s) {
  const out = [];
  if (persona === 'jaksel') {
    if (s.metrics === 0) {
      out.push('Jujurly CV lo belum giving impact. Nol angka, nol metrik — how am I supposed to know seberapa besar kontribusi lo? Tambahin angka kek, berapa % improvement atau berapa user.');
    } else if (s.metrics < 3) {
      out.push(`Baru ada ${s.metrics} angka terukur. Masih kurang data-driven bestie, tambahin metrik di tiap pengalaman biar nggak kelihatan cuma hadir doang.`);
    } else {
      out.push(`Okay, ${s.metrics} metrik terukur. Ini baru green flag, kelihatan jelas deliverable dan impact-nya.`);
    }
    if (s.clichesFound.length) {
      out.push(`Stop nulis "${s.clichesFound.slice(0, 3).join('", "')}" di tahun segini. Itu template sejuta umat, literally semua fresh grad nulis gitu tanpa bukti.`);
    }
    if (s.weakFound.length) {
      out.push(`Kalimat kayak "${s.weakFound[0].phrase}" itu passive vibes banget. Ganti pakai action verb yang assertive dong.`);
    }
    if (!s.hasPortfolio) {
      out.push('Mana link LinkedIn atau portofolio lo? Di era digital kalau nggak ada footprint online, susah buat kita vibe-check kerjaan asli lo.');
    }
    if (s.leaks.length) {
      out.push(`Red flag buat lo sendiri: ${s.leaks.map((l) => l.label).join('; ')}. Hapus sekarang sebelum di-lowball atau disalahgunakan.`);
    }
  } else if (persona === 'pabrik') {
    if (s.metrics === 0) {
      out.push('Ini CV atau karangan bebas? Nggak ada angka sama sekali! Kalau pernah magang atau proyek, tulis berapa unit, berapa volt/kHz, berapa persen efisiensi, atau berapa minggu selesai.');
    } else {
      out.push(`Ada ${s.metrics} data angka. Bagus, orang lapangan suka yang jelas ukurannya.`);
    }
    if (s.clichesFound.length) {
      out.push(`Nggak usah nulis "${s.clichesFound.slice(0, 2).join('", "')}". Di pabrik semua juga ngaku pekerja keras sampai disuruh shift malam baru ketahuan.`);
    }
    if (s.weakFound.length) {
      out.push(`Banyak kata "${s.weakFound[0].phrase}". Jadi yang ngerjain beneran siapa? Tulis langsung alat apa yang lo pegang dan masalah apa yang lo beresin.`);
    }
    if (s.words < 120) {
      out.push(`Pendek amat (${s.words} kata). Tulis lengkap alat, standar, software, atau mesin yang pernah lo operasikan.`);
    }
    if (s.leaks.length) {
      out.push(`Catatan penting: ${s.leaks.map((l) => l.label).join('; ')}. Nggak perlu dicantumin di CV.`);
    }
  } else {
    // Robot ATS
    out.push(`[PARSE_SUMMARY] Kata: ${s.words} | Metrik kuantitatif: ${s.metrics} | Action verbs: ${s.strongVerbs} | Skor kecocokan struktur: ${s.score}/100.`);
    if (!s.hasEmail || !s.hasPhone) {
      out.push('[CRITICAL_MISSING_CONTACT] Email atau nomor telepon tidak terdeteksi oleh regex ekstraktor kandidat.');
    }
    if (s.metrics < 3) {
      out.push('[LOW_QUANTIFICATION] Kurang dari 3 angka pencapaian. Algoritma perankingan memprioritaskan kandidat dengan bukti numerik.');
    }
    if (s.clichesFound.length) {
      out.push(`[BUZZWORD_PENALTY] Frasa generik tanpa bobot informasi: ${s.clichesFound.join(', ')}.`);
    }
    if (s.leaks.length) {
      out.push(`[PII_WARNING] Data sensitif/merugikan terdeteksi: ${s.leaks.map((l) => l.label).join(', ')}.`);
    }
  }
  return out;
}

const REWRITE_PATTERNS = [
  {
    re: /bertanggung\s+jawab\s+(atas|untuk|dalam)\s+(.+)/i,
    make: (m) => `Mengelola ${m[2].replace(/\.$/, '')} secara terukur sehingga menurunkan waktu kendala sebesar [X]% dalam [Y] bulan.`,
  },
  {
    re: /membantu\s+(tim\s+)?(dalam\s+)?(.+)/i,
    make: (m) => `Membangun dan menguji ${m[3].replace(/\.$/, '')} bersama tim [N] orang, menyelesaikan [X] modul tepat waktu.`,
  },
  {
    re: /terlibat\s+dalam\s+(.+)/i,
    make: (m) => `Merancang komponen utama pada ${m[1].replace(/\.$/, '')} dengan hasil peningkatan akurasi/kecepatan sebesar [X]%.`,
  },
  {
    re: /melakukan\s+(.+)/i,
    make: (m) => `Mengeksekusi ${m[1].replace(/\.$/, '')} sesuai SOP teknis untuk [N] unit/pengguna tanpa insiden gagal.`,
  },
];

function suggestRewrites(lines) {
  const results = [];
  for (const line of lines) {
    for (const p of REWRITE_PATTERNS) {
      const m = line.match(p.re);
      if (m) {
        results.push({ before: line, after: p.make(m) });
        break;
      }
    }
    if (results.length >= 4) break;
  }
  if (!results.length && lines.length) {
    results.push({
      before: 'Contoh: Bertanggung jawab atas pemeliharaan jaringan dan membantu troubleshooting komputer.',
      after: 'Mengelola pemeliharaan jaringan untuk 80+ workstation dan menyelesaikan rata-rata 15 tiket troubleshooting/minggu dengan tingkat penyelesaian 95%.',
    });
  }
  return results;
}
