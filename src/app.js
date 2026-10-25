import { analyze, RULES } from './rules.js';
import { mountNav, TOOLS } from './nav.js';

mountNav('loker');

// Render 7-Project Launchpad Grid
const grid = document.getElementById('suite-grid');
if (grid) {
  grid.replaceChildren(
    ...TOOLS.map((t) => {
      const a = document.createElement('a');
      a.className = 'suite-item';
      a.href = t.href;
      const badge = document.createElement('small');
      badge.className = 'badge';
      badge.textContent = `${t.num} · ${t.group}`;
      const b = document.createElement('b');
      b.textContent = t.title;
      const s = document.createElement('span');
      s.textContent = t.desc;
      a.append(badge, b, s);
      return a;
    }),
  );
}

// 4 aturan tambahan dihitung di analyze(): gaji tidak wajar, gaji rendah, gaji tidak ada, usia sempit
document.getElementById('jumlah-pola').textContent = String(RULES.length + 4);

const SAMPLES = {
  scam: `DIBUTUHKAN SEGERA!!! PT Sinar Abadi Group membuka lowongan Admin Gudang.
Tanpa pengalaman, lulusan SMA/SMK boleh. Gaji Rp 9.500.000 + bonus.
Pasti diterima, langsung kerja tanpa tes!
Syarat: berpenampilan menarik, belum menikah, siap bekerja di bawah tekanan.
Ijazah asli ditahan selama masa kontrak 2 tahun, denda Rp 15 juta jika resign.
Biaya seragam dan ID card Rp 450.000 transfer ke rekening HRD sebelum interview.
Daftar: bit.ly/loker-sinar  |  WA only 0812-xxxx-xxxx  |  hrd.sinarabadi@gmail.com`,
  normal: `PT Datascrip membuka posisi Teknisi PLTS (Pembangkit Listrik Tenaga Surya).
Kualifikasi: D3/S1 Teknik Elektro, memahami instalasi panel surya dan inverter, memiliki SIM C, bersedia perjalanan dinas.
Benefit: gaji Rp 6.500.000 - Rp 8.000.000 per bulan, BPJS Kesehatan dan Ketenagakerjaan, tunjangan transport.
Tahapan seleksi: seleksi berkas, psikotes, interview HR, interview user.
Kirim CV ke recruit@datascrip.co.id dengan subjek "Teknisi PLTS - Nama". Rekrutmen ini tidak dipungut biaya apa pun.`,
};

const SEV_LABEL = { bahaya: 'Bahaya', waspada: 'Waspada', catatan: 'Catatan' };

const $ = (id) => document.getElementById(id);
const form = $('cek');
const teks = $('teks');
const hasil = $('hasil');
let last = null;

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const c of children) if (c != null) node.append(c);
  return node;
}

function render(r) {
  last = r;
  hasil.hidden = false;
  $('skor').dataset.level = r.level.key;
  $('angka').textContent = String(r.score);
  $('level').textContent = r.level.label;
  $('meter-label').setAttribute('aria-label', `Skor red flag ${r.score} dari 100`);
  // reflow agar transisi lebar meter jalan saat hasil baru
  $('meter').style.setProperty('--w', '0%');
  requestAnimationFrame(() => $('meter').style.setProperty('--w', `${r.score}%`));

  const n = (s) => r.findings.filter((f) => f.severity === s).length;
  $('ringkas').textContent = r.findings.length
    ? `${n('bahaya')} bahaya · ${n('waspada')} waspada · ${n('catatan')} catatan`
    : 'Tidak ada pola red flag yang dikenali.';

  const list = $('temuan');
  list.replaceChildren(
    ...r.findings.map((f) =>
      el(
        'li',
        { className: `finding sev-${f.severity}` },
        el('h3', {}, el('span', { className: 'badge', textContent: SEV_LABEL[f.severity] }), f.label),
        el('p', { textContent: f.why }),
        f.ref ? el('p', { className: 'ref', textContent: `Dasar: ${f.ref}` }) : null,
        el('p', { textContent: `Yang perlu dilakukan: ${f.tip}` }),
        ...(f.evidence || []).slice(0, 2).map((e) => el('q', { textContent: e })),
      ),
    ),
  );
  $('status').textContent = '';
  hasil.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function shareText(r) {
  const lines = r.findings
    .filter((f) => f.severity !== 'catatan')
    .slice(0, 5)
    .map((f) => `• ${SEV_LABEL[f.severity]}: ${f.label}`);
  return [
    `Lowongan ini dapat skor red flag ${r.score}/100 (${r.level.label}) di Radar Loker.`,
    ...lines,
    '',
    'Cek lowongan kamu juga sebelum melamar:',
  ].join('\n');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!teks.value.trim()) {
    teks.setAttribute('aria-invalid', 'true');
    teks.focus();
    $('teks-hint').textContent = 'Tempel teks lowongan dulu, minimal satu kalimat.';
    return;
  }
  teks.removeAttribute('aria-invalid');
  render(analyze(teks.value));
});

for (const btn of document.querySelectorAll('[data-sample]')) {
  btn.addEventListener('click', () => {
    teks.value = SAMPLES[btn.dataset.sample];
    form.requestSubmit();
  });
}

$('salin').addEventListener('click', async () => {
  if (!last) return;
  try {
    await navigator.clipboard.writeText(`${shareText(last)} ${location.origin}${location.pathname}`);
    $('status').textContent = 'Tersalin.';
  } catch {
    $('status').textContent = 'Gagal menyalin. Salin manual dari halaman.';
  }
});

$('bagikan').addEventListener('click', async () => {
  if (!last) return;
  const data = { title: 'Radar Loker', text: shareText(last), url: location.origin + location.pathname };
  if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
    } catch (err) {
      if (err.name !== 'AbortError') $('status').textContent = 'Gagal membagikan.';
    }
    return;
  }
  const url = `https://x.com/intent/post?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
  window.open(url, '_blank', 'noopener');
});
