import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { analyze, extractSalary, normalize, RULES, MIN_WAGE_FLOOR } from '../src/rules.js';
import { auditCV } from '../src/roast.js';
import { evaluateOffer, CITIES, ROLES } from '../src/gaji.js';
import { generateQuestions, scoreAnswer, PRESET_THESES, EXAMINERS } from '../src/sidang.js';
import { SENSOR_PRESETS, parseSpecText, specToText, generateDriver } from '../src/datasheet.js';
import { PASAL_PRESETS, diffWords, explainDiff } from '../src/pasal.js';
import { TOOLS, mountNav } from '../src/nav.js';

const execFileAsync = promisify(execFile);
const REPO_ROOT = resolve(import.meta.dirname, '..');

describe('rules.js — full rule matrix, salary periods, and scoring invariants', () => {
  test('all 14 rule groups trigger on canonical Indonesian red-flag phrases', () => {
    const cases = [
      ['biaya', 'Pelamar wajib membayar biaya seragam sebesar Rp 350.000 sebelum mulai.'],
      ['ijazah', 'Wajib menyerahkan ijazah asli ditahan oleh HRD selama masa kontrak.'],
      ['task-scam', 'Kerja mudah komisi per tugas harian, cukup gabung grup telegram kami.'],
      ['data-sensitif', 'Kirim foto kartu atm dan selfie memegang ktp untuk aktivasi payroll.'],
      ['pasti-diterima', 'Langsung kerja tanpa tes dan dijamin diterima hari ini juga.'],
      ['komisi-saja', 'Penghasilan murni komisi tanpa gaji pokok namun bonus besar.'],
      ['unpaid', 'Program internship tanpa uang saku selama 6 bulan penuh waktu.'],
      ['penalti', 'Terdapat ikatan dinas 2 tahun dan denda apabila mengundurkan diri.'],
      ['jam-kerja', 'Jadwal kerja Senin sampai Minggu tanpa libur dan lembur tidak dibayar.'],
      ['email-gratis', 'Kirim lamaran ke hrd.rekrutmen99@gmail.com atau wa saja.'],
      ['link-pendek', 'Isi formulir pendaftaran melalui https://bit.ly/loker-cepat-2026 sekarang.'],
      ['multitasking', 'Dicari kandidat serba bisa yang siap merangkap admin dan gudang.'],
      ['fisik', 'Syarat utama berpenampilan menarik, tinggi badan minimal 165 cm, belum menikah.'],
      ['budaya', 'Suasana kekeluargaan, loyalitas tinggi, dan siap ditempatkan di mana saja.'],
    ];

    assert.equal(RULES.length, 14);
    for (const [expectedId, sample] of cases) {
      const res = analyze(sample);
      assert.ok(
        res.findings.some((f) => f.id === expectedId),
        `Expected rule "${expectedId}" to match sample: ${sample}`,
      );
    }
  });

  test('salary parser distinguishes daily/weekly rates from monthly salary and flags too-good junior bait', () => {
    const daily = extractSalary(normalize('Upah Rp 150.000 / hari dibayar mingguan'));
    assert.equal(daily.found, true);
    assert.equal(daily.amounts[0].period, 'hari');
    assert.equal(daily.min, undefined);

    const weekly = extractSalary(normalize('Penghasilan Rp 800rb per minggu untuk kurir'));
    assert.equal(weekly.found, true);
    assert.equal(weekly.amounts[0].period, 'minggu');
    assert.equal(weekly.min, undefined);

    const bait = analyze('Lowongan admin online fresh graduate tanpa pengalaman, gaji Rp 15 juta per bulan!');
    assert.ok(bait.findings.some((f) => f.id === 'gaji-tidak-wajar'));
    assert.equal(bait.level.key, 'merah');
    assert.equal(bait.score, 60);
    assert.equal(MIN_WAGE_FLOOR, 2_000_000);
  });

  test('missing salary note triggers only on sufficiently long postings (> 80 chars)', () => {
    const shortAd = analyze('Dicari staf elektrikal S1 pengalaman PLC.');
    assert.ok(!shortAd.findings.some((f) => f.id === 'gaji-tidak-ada'));

    const longAdNoSalary = analyze(
      'PT Maju Teknik membuka lowongan Electrical Maintenance Engineer untuk pabrik Cikarang dengan kualifikasi S1 Teknik Elektro dan memahami PLC.',
    );
    assert.ok(longAdNoSalary.findings.some((f) => f.id === 'gaji-tidak-ada'));
  });
});

describe('gaji.js — all 4 verdicts, fallback defaults, and living-cost math', () => {
  test('covers bawah-umk, mepet, wajar, and tinggi verdicts with accurate net THP math', () => {
    assert.equal(CITIES.length, 16);
    assert.equal(ROLES.length, 5);

    const bawah = evaluateOffer({ cityId: 'jakarta', roleId: 'elektro', offerGross: 4_500_000 });
    assert.equal(bawah.verdict.key, 'bawah-umk');
    assert.equal(bawah.net, Math.round(4_500_000 * 0.96));
    assert.equal(bawah.leftover, bawah.net - (bawah.city.kos + bawah.city.makan + bawah.city.transport));
    assert.match(bawah.negoScript, /UMK DKI Jakarta/);

    // Software in Bekasi Kab: UMK = 5,558,515; marketMin = round(5,558,515 * 1.05 / 50k)*50k = 5,850,000
    const mepet = evaluateOffer({ cityId: 'bekasi-kab', roleId: 'software', offerGross: 5_600_000 });
    assert.equal(mepet.verdict.key, 'mepet');

    const wajar = evaluateOffer({ cityId: 'semarang', roleId: 'elektro', offerGross: 4_400_000 });
    assert.equal(wajar.verdict.key, 'wajar');

    const tinggi = evaluateOffer({ cityId: 'sleman', roleId: 'mt', offerGross: 9_000_000 });
    assert.equal(tinggi.verdict.key, 'tinggi');

    // Unknown IDs fall back gracefully to CITIES[0] and ROLES[0]
    const fallback = evaluateOffer({ cityId: 'unknown-city', roleId: 'unknown-role', offerGross: 0 });
    assert.equal(fallback.city.id, CITIES[0].id);
    assert.equal(fallback.role.id, ROLES[0].id);
    assert.equal(fallback.gross, 0);
  });
});

describe('roast.js — personas, privacy leak detectors, and XYZ rewrite limits', () => {
  test('all 3 personas (jaksel, pabrik, ats) detect PII leaks and cap rewrites at 4 items', () => {
    const leakyCv = `
      Budi Santoso
      NIK: 3374010101000001 | Agama: Islam | Status Perkawinan: Belum Menikah
      Harapan gaji mengikuti UMP setempat.
      Pekerja keras, fast learner, jujur dan disiplin.
      - Bertanggung jawab atas perawatan panel listrik.
      - Membantu tim dalam pengujian sensor suhu.
      - Terlibat dalam instalasi jaringan kantor.
      - Melakukan kalibrasi alat ukur harian.
      - Melakukan rekapitulasi laporan mingguan.
    `;

    for (const persona of ['jaksel', 'pabrik', 'ats']) {
      const res = auditCV(leakyCv, persona);
      assert.equal(res.persona, persona);
      assert.equal(res.leaks.length, 3);
      assert.equal(res.rewrites.length, 4);
      assert.equal(res.checks.hasEmail, false);
      assert.equal(res.checks.hasPhone, false);
      assert.ok(res.roasts.length >= 3);
    }

    // Clean CV without weak starters gets 1 educational fallback rewrite example
    const cleanCv = `
      Ardhya Novri | ardhyasan@gmail.com | 081234567890 | github.com/vanovri
      Skills: Python, STM32, PLC
      Merancang akuisisi sinyal 4 kHz pada 12 modul sensor dan menurunkan galat 35% dalam 8 minggu.
    `;
    const cleanAudit = auditCV(cleanCv, 'ats');
    assert.equal(cleanAudit.leaks.length, 0);
    assert.equal(cleanAudit.rewrites.length, 1);
    assert.match(cleanAudit.rewrites[0].before, /^Contoh:/);
  });
});

describe('sidang.js — examiner personas, diagnostic branches, and answer scoring', () => {
  test('generates distinct Q1 prompts per examiner and switches Q2/Q3/Q4 on strong quantitative abstracts', () => {
    const qBambang = generateQuestions(PRESET_THESES.cnn, 'bambang');
    const qRatna = generateQuestions(PRESET_THESES.cnn, 'ratna');
    const qHendra = generateQuestions(PRESET_THESES.cnn, 'hendra');

    assert.equal(Object.keys(EXAMINERS).length, 3);
    assert.notEqual(qBambang.questions[0].question, qRatna.questions[0].question);
    assert.notEqual(qRatna.questions[0].question, qHendra.questions[0].question);

    // Quantitative abstract with sample size, baseline, no vague words, and error analysis
    const rigorous = generateQuestions({
      title: 'Evaluasi Filter IIR STM32F411 pada Akuisisi Sinyal',
      method: 'STM32F411 ADC 12-bit dan UART',
      abstract:
        'Pengujian dilakukan pada 30 subjek dan 120 sampel sinyal dibandingkan metode konvensional baseline dengan metrik RMSE 1.8% dan analisis galat SNR 24 dB.',
    });
    assert.equal(rigorous.diagnostics.vagueCount, 0);
    assert.equal(rigorous.diagnostics.hasSampleSize, true);
    assert.equal(rigorous.diagnostics.hasBaseline, true);
    assert.equal(rigorous.diagnostics.hasErrorAnalysis, true);
    assert.deepEqual(
      rigorous.questions.map((q) => q.id),
      ['q1-justifikasi', 'q2-validasi', 'q3-generalisasi', 'q4-kontribusi', 'q5-kegagalan'],
    );
    assert.equal(rigorous.questions[4].aspect, 'Mitigasi Error');
  });

  test('scoreAnswer penalizes short/defensive answers and rewards causal + limitation + numeric answers', () => {
    const tooShort = scoreAnswer('Sudah bagus pak.');
    assert.equal(tooShort.score, 15);

    const defensive = scoreAnswer(
      'Sistem yang saya bangun 100% sempurna dan semua lancar tidak ada masalah sama sekali pada saat pengujian di laboratorium.',
    );
    assert.ok(defensive.score <= 35);
    assert.match(defensive.feedback, /curiga/);

    const solid = scoreAnswer(
      'Kami memilih frekuensi sampling 4 kHz pada ADC 12-bit karena mengacu teorema Nyquist untuk pita EMG 20 sampai 500 Hz dibandingkan 1 kHz yang mengalami aliasing, namun terdapat keterbatasan artefak gerak ketika kabel elektroda bergeser sehingga galat naik 4.2%.',
    );
    assert.ok(solid.score >= 95);
    assert.equal(solid.hasNumber, true);
    assert.equal(solid.hasReasoning, true);
    assert.equal(solid.hasLimitation, true);
  });
});

describe('datasheet.js, pasal.js, nav.js & scripts/scan.mjs — roundtrips and CLI integration', () => {
  test('datasheet specToText -> parseSpecText roundtrip and ESP32/MPU6050/BMP280 codegen', () => {
    for (const key of ['ina219', 'mpu6050', 'bmp280']) {
      const preset = SENSOR_PRESETS[key];
      const text = specToText(preset);
      const parsed = parseSpecText(text);
      assert.equal(parsed.name, preset.name);
      assert.equal(parsed.regWidth, preset.regWidth);
      assert.equal(parsed.registers.length, preset.registers.length);

      const espDrv = generateDriver(preset, 'esp32');
      assert.match(espDrv.source, /i2c_master_write_read_device/);
      if (preset.idReg) {
        assert.match(espDrv.source, new RegExp(`${preset.name}_ERR_ID`));
      }
    }
  });

  test('pasal diff covers outsourcing preset, wajib->dapat rule, and generic numeric-shift fallback', () => {
    const outDiff = explainDiff(PASAL_PRESETS.outsourcing.oldText, PASAL_PRESETS.outsourcing.newText);
    assert.ok(outDiff.impacts.some((i) => i.id === 'batas-outsourcing'));

    const wajibToDapat = explainDiff(
      'Perusahaan wajib memberikan tunjangan transportasi bulanan.',
      'Perusahaan dapat memberikan tunjangan transportasi bulanan.',
    );
    assert.ok(wajibToDapat.impacts.some((i) => i.id === 'wajib-ke-dapat'));

    const numericOnly = explainDiff(
      'Masa percobaan berlaku selama 2 bulan sejak tanggal masuk.',
      'Masa percobaan berlaku selama 3 bulan sejak tanggal masuk.',
    );
    assert.equal(numericOnly.impacts.length, 1);
    assert.equal(numericOnly.impacts[0].id, 'angka-berubah');

    // Case-insensitive token equality preserves target token casing
    const sameOps = diffWords('Pasal Satu.', 'pasal satu.');
    assert.ok(sameOps.every((op) => op.type === 'same'));
  });

  test('nav.js TOOLS map to real HTML pages on disk and mountNav populates DOM stub', async () => {
    assert.equal(TOOLS.length, 7);
    for (const tool of TOOLS) {
      const relFile = tool.href === './' ? 'index.html' : tool.href;
      await access(join(REPO_ROOT, relFile));
    }

    // Minimal DOM stub test for mountNav()
    const appended = [];
    const fakeNav = {
      className: '',
      replaceChildren: (...els) => appended.push(...els),
    };
    const prevDoc = globalThis.document;
    globalThis.document = {
      querySelector: (sel) => (sel === 'header.site nav' ? fakeNav : null),
      createElement: (tag) => ({
        tag,
        href: '',
        textContent: '',
        attrs: {},
        setAttribute(k, v) {
          this.attrs[k] = v;
        },
      }),
    };
    try {
      mountNav('datasheet');
      assert.equal(fakeNav.className, 'suite-nav');
      assert.equal(appended.length, 7);
      const active = appended.filter((a) => a.attrs['aria-current'] === 'page');
      assert.equal(active.length, 1);
      assert.equal(active[0].href, 'datasheet.html');
    } finally {
      globalThis.document = prevDoc;
    }
  });

  test('scripts/scan.mjs --json scans a temporary directory of .txt job postings end-to-end', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'radar-loker-scan-'));
    try {
      await writeFile(
        join(tmp, 'scam.txt'),
        'Wajib bayar biaya admin Rp 250.000 dan menahan ijazah asli selama kontrak.',
        'utf8',
      );
      await writeFile(
        join(tmp, 'clean.txt'),
        'PT Nusantara membuka lowongan Electrical Engineer S1 Teknik Elektro gaji Rp 6.500.000 per bulan melalui karir@nusantara.co.id.',
        'utf8',
      );
      const { stdout } = await execFileAsync(process.execPath, [join(REPO_ROOT, 'scripts', 'scan.mjs'), tmp, '--json']);
      const parsed = JSON.parse(stdout);
      assert.equal(parsed.length, 2);
      const scam = parsed.find((x) => x.file === 'scam.txt');
      const clean = parsed.find((x) => x.file === 'clean.txt');
      assert.ok(scam.score >= 70);
      assert.ok(scam.flags.includes('biaya'));
      assert.ok(scam.flags.includes('ijazah'));
      assert.ok(clean.score < 15);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
