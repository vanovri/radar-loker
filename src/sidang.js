// Simulator Sidang Skripsi — ekstraksi klaim abstrak, generator pertanyaan dosen penguji, & penilai jawaban.

export const EXAMINERS = {
  bambang: {
    id: 'bambang',
    name: 'Prof. Bambang, Ph.D.',
    role: 'Penguji Metodologi & Validasi Statistik',
    style: 'Galak, alergi klaim tanpa angka dan baseline pembanding.',
  },
  ratna: {
    id: 'ratna',
    name: 'Dr. Ir. Ratna, M.T.',
    role: 'Penguji Aplikasi Industri & Kelayakan',
    style: 'Praktis, mengejar apakah alat/model tahan kondisi dunia nyata di luar lab.',
  },
  hendra: {
    id: 'hendra',
    name: 'Dr. Hendra, S.T., M.Eng.',
    role: 'Penguji Detail Teknis & Batasan Sistem',
    style: 'Teliti, mengejar alasan pemilihan parameter, edge-case, dan kegagalan sistem.',
  },
};

export const PRESET_THESES = {
  emg: {
    title: 'Sistem Akuisisi Sinyal EMG 4 kHz Berbasis STM32F411CEU6 dengan Filter Digital dan Telemetri Python',
    method: 'ADC 12-bit dengan DMA pada STM32F411CEU6 (4 kHz sampling), filter digital IIR (20 Hz high-pass, 500 Hz low-pass, 50 Hz notch), transmisi UART ke antarmuka Python.',
    abstract: `Penelitian ini merancang sistem akuisisi sinyal elektromiografi (EMG) permukaan secara real-time menggunakan mikrokontroler STM32F411CEU6. Akuisisi dilakukan pada frekuensi pencuplikan 4 kHz menggunakan ADC 12-bit dan Direct Memory Access (DMA) untuk meminimalkan beban CPU. Sinyal mentah diproses melalui tiga tahap filter digital: high-pass 20 Hz untuk menghilangkan artefak gerakan, low-pass 500 Hz untuk membatasi pita frekuensi otot, serta notch filter 50 Hz untuk meredam interferensi jala-jala listrik. Data hasil pemfilteran dikirim melalui komunikasi serial UART menuju aplikasi Python untuk visualisasi dan perekaman. Hasil pengujian menunjukkan sistem mampu mengakuisisi sinyal kontraksi otot secara akurat dan stabil dengan latensi rendah.`,
  },
  cnn: {
    title: 'Klasifikasi Penyakit Daun Padi Menggunakan Convolutional Neural Network Berbasis MobileNetV2',
    method: 'Transfer learning MobileNetV2 pada citra daun padi 4 kelas dengan augmentasi data dan optimasi Adam.',
    abstract: `Penyakit tanaman padi sering terlambat dideteksi oleh petani sehingga menurunkan hasil panen. Penelitian ini mengusulkan sistem klasifikasi penyakit daun padi otomatis menggunakan arsitektur MobileNetV2. Dataset yang digunakan terdiri dari citra daun padi yang dibagi menjadi data latih dan data uji. Proses pelatihan menggunakan teknik augmentasi citra dan learning rate 0.001. Hasil pengujian menunjukkan model sangat efektif dan optimal dengan akurasi mencapai 96,5% dalam mengenali penyakit daun padi.`,
  },
  sdm: {
    title: 'Pengaruh Work-Life Balance dan Kompensasi terhadap Turnover Intention Karyawan Generasi Z di Jakarta',
    method: 'Kuantitatif dengan kuesioner skala Likert dan analisis regresi linier berganda menggunakan SPSS.',
    abstract: `Tingginya tingkat pergantian karyawan (turnover intention) pada pekerja Generasi Z menjadi tantangan bagi perusahaan di Jakarta. Penelitian ini bertujuan menganalisis pengaruh work-life balance dan kompensasi terhadap turnover intention secara parsial maupun simultan. Pengambilan data dilakukan melalui penyebaran kuesioner online kepada responden pekerja Generasi Z. Hasil analisis regresi membuktikan bahwa work-life balance berpengaruh negatif signifikan dan kompensasi berpengaruh signifikan terhadap turnover intention.`,
  },
};

export function generateQuestions({ title, method, abstract }, examinerId = 'bambang') {
  const ex = EXAMINERS[examinerId] || EXAMINERS.bambang;
  const full = `${title || ''}. ${method || ''}. ${abstract || ''}`.trim();
  const lower = full.toLowerCase();

  // Deteksi celah pada abstrak
  const vagueWords = (full.match(/\b(sangat\s+akurat|sangat\s+efektif|optimal|stabil|latensi\s+rendah|berhasil\s+dengan\s+baik|efisien|cukup\s+baik)\b/gi) || []).map((w) => w.toLowerCase());
  const metrics = full.match(/\b\d+(?:[.,]\d+)?\s*(%|hz|khz|ms|detik|bit|orang|responden|citra|sampel|data|epoch|db)\b/gi) || [];
  const hasSampleSize = /\b\d+\s*(responden|sampel|citra|gambar|subjek|pasien|unit|dataset)\b/i.test(full);
  const hasBaseline = /\b(dibandingkan|membandingkan|baseline|metode\s+sebelumnya|konvensional|pembanding|vs)\b/i.test(full);
  const hasErrorAnalysis = /\b(error|galat|rmse|mae|snr|false\s+positive|presisi|recall|f1|kegagalan|batasan|limitasi|gangguan)\b/i.test(full);

  // Ambil komponen/metode spesifik dari kalimat user
  const techTokens = (full.match(/\b(STM32\w*|ESP32|DMA|ADC|UART|IIR|FIR|Notch|MobileNet\w*|CNN|ResNet\w*|SVM|Random\s+Forest|SPSS|PLS-SEM|Likert|Regresi|PID|Fuzzy|Kalman)\b/gi) || []);
  const mainTech = techTokens[0] || (method ? method.split(/[,.]/)[0].trim() : 'metode yang Anda pilih');
  const secondTech = techTokens[1] || 'parameter sistem';

  const questions = [];

  // Q1: Alasan pemilihan metode / komponen utama
  questions.push({
    id: 'q1-justifikasi',
    aspect: 'Justifikasi Metode',
    question:
      examinerId === 'bambang'
        ? `Di judul dan metode Anda menyebut "${mainTech}". Atas dasar ilmiah apa Anda memilih pendekatan ini, bukan alternatif lain yang lebih sederhana atau lebih baru? Mana tabel perbandingan objektifnya?`
        : examinerId === 'ratna'
          ? `Anda memakai "${mainTech}". Kalau sistem ini dipasang di lapangan dengan biaya terbatas dan operator awam, apa alasan praktis tetap memakai "${mainTech}" dibanding solusi komersial yang sudah ada?`
          : `Jelaskan trade-off teknis dari pemilihan "${mainTech}" dan "${secondTech}". Pada kondisi ekstrem apa pendekatan ini akan gagal?`,
    hint: 'Sebutkan minimal 1 alternatif pembanding, alasan kuantitatif (biaya, memori, akurasi, atau kecepatan), dan batasan metode Anda.',
  });

  // Q2: Klaim subjektif tanpa angka / validasi metrik
  if (vagueWords.length) {
    questions.push({
      id: 'q2-klaim-kabur',
      aspect: 'Klaim Tanpa Angka',
      question: `Anda menulis di naskah bahwa hasilnya "${vagueWords[0]}". Di ruang sidang tidak ada istilah "${vagueWords[0]}" tanpa angka! Berapa nilai pastinya, diukur dengan instrumen atau metrik apa, dan terhadap standar apa?`,
      hint: 'Ubah kata sifat menjadi angka terukur (mis. SNR dalam dB, latensi dalam ms, RMSE, atau p-value) beserta cara mengukurnya.',
    });
  } else {
    questions.push({
      id: 'q2-validasi',
      aspect: 'Validasi & Kalibrasi',
      question: `Anda mencantumkan angka ${metrics[0] || 'pengujian'}. Bagaimana Anda menjamin angka tersebut valid dan bukan kebetulan atau overfitting/artefak alat ukur? Apa ground-truth pembandingnya?`,
      hint: 'Jelaskan alat/data acuan (ground-truth), pengulangan uji (N kali), dan simpangan baku atau selang kepercayaan.',
    });
  }

  // Q3: Ukuran sampel / skenario uji
  if (!hasSampleSize) {
    questions.push({
      id: 'q3-sampel',
      aspect: 'Ukuran Sampel & Data Uji',
      question: `Di abstrak Anda belum tampak jelas berapa jumlah sampel/subjek/skenario pengujiannya. Berapa total data yang diuji, dan mengapa jumlah itu sudah cukup mewakili populasi atau variasi kondisi nyata?`,
      hint: 'Sebutkan jumlah sampel/percobaan (N), cara pembagian data atau variasi kondisi uji, dan alasan kecukupannya.',
    });
  } else {
    questions.push({
      id: 'q3-generalisasi',
      aspect: 'Generalisasi Data',
      question: `Kalau sistem ini diuji pada subjek, lokasi, atau kondisi baru di luar data yang Anda ambil sekarang, seberapa jauh performanya turun? Apakah sudah diuji silang (cross-validation / blind test)?`,
      hint: 'Jelaskan hasil uji pada data/kondisi yang belum pernah dilihat sistem dan faktor lingkungan yang paling memengaruhi.',
    });
  }

  // Q4: Pembanding / Baseline
  if (!hasBaseline) {
    questions.push({
      id: 'q4-baseline',
      aspect: 'Ketiadaan Baseline',
      question: `Anda mengklaim sistem ini berhasil, tapi tidak membandingkannya dengan penelitian terdahulu atau sistem tanpa ${secondTech}. Tanpa baseline, dari mana penguji tahu kontribusi Anda benar-benar membawa perbaikan?`,
      hint: 'Bandingkan kondisi sebelum vs sesudah (ablation test) atau bandingkan dengan minimal 1 paper/alat acuan.',
    });
  } else {
    questions.push({
      id: 'q4-kontribusi',
      aspect: 'Kebaruan & Kontribusi',
      question: `Apa bedanya skripsi Anda dengan penelitian tahun-tahun sebelumnya yang memakai metode serupa? Bagian mana yang benar-benar Anda rancang atau modifikasi sendiri?`,
      hint: 'Tunjukkan secara jujur batas antara library/modul bawaan dan bagian yang Anda rancang, kalibrasi, atau integrasikan sendiri.',
    });
  }

  // Q5: Analisis Kegagalan / Error
  questions.push({
    id: 'q5-kegagalan',
    aspect: hasErrorAnalysis ? 'Mitigasi Error' : 'Kasus Gagal (Failure Mode)',
    question: `Setiap sistem punya titik gagal. Sebutkan 1 kasus nyata saat pengujian di mana sistem/analisis Anda memberikan hasil paling buruk atau meleset, dan apa penyebab akarnya!`,
    hint: 'Jangan bilang "tidak ada kendala". Sebutkan 1 kasus error nyata (mis. noise 50 Hz, artefak gerak, data outlier, atau latensi buffer) dan solusinya.',
  });

  return {
    examiner: ex,
    diagnostics: {
      vagueCount: vagueWords.length,
      metricsCount: metrics.length,
      hasSampleSize,
      hasBaseline,
      hasErrorAnalysis,
    },
    questions,
  };
}

export function scoreAnswer(answerText) {
  const t = String(answerText || '').trim();
  const words = t ? t.split(/\s+/).length : 0;
  const hasNumber = /\b\d+(?:[.,]\d+)?\s*(%|hz|khz|ms|detik|bit|db|kali|orang|sampel|data|volt|ampere|ohm|p\s*[<=>])?/i.test(t);
  const hasReasoning = /\b(karena|sebab|dibandingkan|sedangkan|trade-?off|kelebihan|kekurangan|alasan|mengacu|berdasarkan|standar)\b/i.test(t);
  const hasLimitation = /\b(batasan|keterbatasan|kendala|kelemahan|gagal|error|galat|namun|tetapi|saran\s+pengembangan)\b/i.test(t);
  const isDefensive = /\b(tidak\s+ada\s+masalah|semua\s+lancar|100%\s+sempurna|pasti\s+benar)\b/i.test(t);

  let points = 30;
  if (words >= 20) points += 20;
  if (words >= 40) points += 10;
  if (hasNumber) points += 20;
  if (hasReasoning) points += 15;
  if (hasLimitation) points += 10;
  if (isDefensive) points -= 20;
  if (words < 8) points = 15;

  points = Math.max(10, Math.min(100, points));

  const notes = [];
  if (!hasNumber) notes.push('Belum menyebut angka/metrik konkret.');
  if (!hasReasoning) notes.push('Tambahkan kata penghubung kausal & pembanding ("karena…", "dibandingkan…").');
  if (isDefensive) notes.push('Hindari klaim "semua sempurna tanpa kendala" — penguji justru curiga.');
  if (points >= 80 && !notes.length) notes.push('Jawaban padat, terukur, dan menjawab alasan teknis.');

  return { score: points, words, hasNumber, hasReasoning, hasLimitation, feedback: notes.join(' ') || 'Cukup baik, pertajam dengan data uji.' };
}
