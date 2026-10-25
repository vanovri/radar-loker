import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, extractSalary, normalize } from '../src/rules.js';

const ids = (r) => r.findings.map((f) => f.id);

test('lowongan penipuan klasik: biaya + ijazah', () => {
  const r = analyze(`DIBUTUHKAN SEGERA staff admin PT Maju Jaya. Tanpa pengalaman, gaji Rp 12.000.000.
  Ijazah asli ditahan selama kontrak. Biaya seragam Rp 350.000 transfer ke rekening HRD.
  Hubungi WA only 0812xxxx atau hrd.majujaya@gmail.com`);
  assert.ok(r.score >= 70, `score ${r.score}`);
  assert.equal(r.level.key, 'penipuan');
  for (const id of ['biaya', 'ijazah', 'gaji-tidak-wajar', 'email-gratis']) assert.ok(ids(r).includes(id), id);
});

test('lowongan normal tidak kena red flag besar', () => {
  const r = analyze(`PT Datascrip membuka posisi Teknisi PLTS. Kualifikasi: S1/D3 Teknik Elektro,
  memahami instalasi panel surya, bersedia perjalanan dinas. Gaji Rp 6.500.000 - Rp 8.000.000 per bulan,
  BPJS Kesehatan dan Ketenagakerjaan. Kirim CV ke recruit@datascrip.co.id`);
  assert.ok(r.score < 15, `score ${r.score} ${ids(r)}`);
  assert.equal(r.level.key, 'aman');
});

test('negasi: "tanpa biaya" dan "biaya ditanggung perusahaan" tidak dihitung', () => {
  const r = analyze('Rekrutmen resmi tanpa biaya pendaftaran. Biaya training ditanggung perusahaan. Gaji Rp 5 juta.');
  assert.ok(!ids(r).includes('biaya'), ids(r).join());
});

test('negasi: "tidak menahan ijazah" tidak dihitung', () => {
  const r = analyze('Perusahaan tidak menahan ijazah karyawan. Gaji Rp 5.500.000.');
  assert.ok(!ids(r).includes('ijazah'), ids(r).join());
});

test('gaji di bawah upah minimum terdeteksi', () => {
  const r = analyze('Dicari admin toko, gaji Rp 1.500.000 per bulan, kerja Senin - Minggu.');
  assert.ok(ids(r).includes('gaji-rendah'));
  assert.ok(ids(r).includes('jam-kerja'));
});

test('kerja tugas online', () => {
  const r = analyze('Kerja santai cuma dari HP! Like video dan rating produk, komisi per tugas Rp 50rb. Join grup telegram.');
  assert.ok(ids(r).includes('task-scam'));
  assert.ok(r.score >= 60);
});

test('parser gaji: berbagai format', () => {
  assert.equal(extractSalary(normalize('Gaji Rp 4.500.000')).max, 4_500_000);
  assert.equal(extractSalary(normalize('gaji 4,5 juta')).max, 4_500_000);
  assert.equal(extractSalary(normalize('salary 7jt - 9jt')).max, 9_000_000);
  assert.equal(extractSalary(normalize('Usia maks 25 tahun, kuota 30 orang')).found, false);
  const daily = extractSalary(normalize('upah Rp 150.000/hari'));
  assert.equal(daily.max, undefined);
  assert.equal(daily.amounts[0].period, 'hari');
});

test('angka biaya tidak dianggap gaji', () => {
  const s = extractSalary(normalize('Gaji kompetitif. Biaya seragam Rp 350.000.'));
  assert.equal(s.max, undefined);
});

test('usia sempit jadi catatan, bukan bahaya', () => {
  const r = analyze('Operator produksi pria usia 18 - 22 tahun, lulusan SMK. Gaji UMK Bekasi Rp 5.600.000.');
  const f = r.findings.find((x) => x.id === 'usia-sempit');
  assert.ok(f);
  assert.equal(f.severity, 'catatan');
});

test('teks kosong aman dan tidak crash', () => {
  const r = analyze('');
  assert.equal(r.score, 0);
  assert.deepEqual(r.findings, []);
});
