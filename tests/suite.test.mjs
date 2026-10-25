import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditCV } from '../src/roast.js';
import { evaluateOffer } from '../src/gaji.js';
import { generateQuestions, scoreAnswer, PRESET_THESES } from '../src/sidang.js';
import { SENSOR_PRESETS, parseSpecText, generateDriver } from '../src/datasheet.js';
import { explainDiff, PASAL_PRESETS } from '../src/pasal.js';

test('Roast CV: CV klise penuh kata pasif dapat skor lebih rendah dari CV terukur', () => {
  const weak = auditCV(`
    Budi Santoso | 08123456789 | budi@gmail.com
    NIK: 3275011203010002 | Status Perkawinan: Belum Menikah
    Saya pekerja keras, cepat belajar, mampu bekerja di bawah tekanan.
    Pengalaman:
    - Bertanggung jawab atas jaringan kantor dan membantu troubleshooting.
    - Terlibat dalam kegiatan perawatan komputer.
    Harapan gaji mengikuti UMP.
  `, 'jaksel');

  const strong = auditCV(`
    Ardhya Novri Ramadhan | +62 812 9155 2970 | ardhyasan@gmail.com | linkedin.com/in/dhya | ardhyanovri.my.id
    Electrical Engineering graduate skilled in C, STM32, Python, React, FastAPI, Git.
    Work Experience:
    - Developed and deployed 100% of company production website with 3 core modules.
    - Completed 8-week technical rotation across 2 airport electrical divisions (5 weeks UPS, 3 weeks protection).
    - Engineered a 4 kHz STM32F411CEU6 EMG acquisition system featuring 12-bit DMA ADC and 3 digital filters (20 Hz, 500 Hz, 50 Hz).
    - Guided undergraduate students across 2 semesters in basic electronics practicums.
  `, 'ats');

  assert.ok(strong.score > weak.score + 20, `strong=${strong.score} weak=${weak.score}`);
  assert.ok(weak.leaks.length >= 2);
  assert.ok(weak.rewrites.length >= 1);
});

test('Peta Gaji: deteksi bawah UMK vs wajar sesuai pasar', () => {
  const under = evaluateOffer({ cityId: 'bekasi-kab', roleId: 'elektro', offerGross: 4_000_000 });
  assert.equal(under.verdict.key, 'bawah-umk');
  assert.ok(under.diffUmkPct < 0);

  const fair = evaluateOffer({ cityId: 'jakarta', roleId: 'software', offerGross: 7_200_000 });
  assert.equal(fair.verdict.key, 'wajar');
  assert.ok(fair.leftover > 0);
});

test('Simulator Sidang: ekstraksi 5 pertanyaan dan penilaian jawaban', () => {
  const q = generateQuestions(PRESET_THESES.emg, 'bambang');
  assert.equal(q.questions.length, 5);
  assert.ok(q.diagnostics.vagueCount >= 1);

  const badAns = scoreAnswer('Semua berjalan lancar dan tidak ada masalah sama sekali.');
  const goodAns = scoreAnswer('Kami memilih STM32F411 karena memiliki DMA dan FPU dengan harga Rp45 ribu dibandingkan DSP khusus, dengan SNR 18 dB pada 30 sampel uji, namun masih memiliki keterbatasan artefak kabel.');
  assert.ok(goodAns.score > badAns.score + 30, `good=${goodAns.score} bad=${badAns.score}`);
});

test('Datasheet → Driver: generate C header, source, dan test valid', () => {
  const drv = generateDriver(SENSOR_PRESETS.ina219, 'stm32');
  assert.ok(drv.header.includes('#define INA219_REG_CONFIG'));
  assert.ok(drv.header.includes('INA219_GET_BUS_VOLTAGE_BD'));
  assert.ok(drv.source.includes('ina219_read_reg'));
  assert.ok(drv.test.includes('int main(void)'));

  const custom = parseSpecText('NAME=TMP102 BUS=I2C ADDR=0x48 WIDTH=16\nTEMP 0x00 R 0x0000 ADC:4:12 # Temperature register');
  assert.equal(custom.name, 'TMP102');
  assert.equal(custom.registers[0].fields[0].bit, 4);
});

test('Pasal Diff Explainer: deteksi kompensasi PKWT dan klausul jebakan kontrak', () => {
  const uu = explainDiff(PASAL_PRESETS.pkwt_uu.oldText, PASAL_PRESETS.pkwt_uu.newText);
  assert.ok(uu.impacts.some((i) => i.id === 'tambah-kompensasi'));
  assert.ok(uu.impacts.some((i) => i.id === 'durasi-kontrak'));

  const trap = explainDiff(PASAL_PRESETS.kontrak_jebakan.oldText, PASAL_PRESETS.kontrak_jebakan.newText);
  assert.ok(trap.impacts.some((i) => i.id === 'tahan-ijazah'));
  assert.ok(trap.impacts.some((i) => i.id === 'denda-resign'));
  assert.ok(trap.impacts.some((i) => i.id === 'hapus-lembur'));
});
