// Navigasi terpadu 7 proyek Radar Loker & Lab.
export const TOOLS = [
  { id: 'loker', num: '01', group: 'Karir', href: './', title: 'Detektor Loker', desc: 'Cek 18 pola penipuan & red flag lowongan kerja' },
  { id: 'eksperimen', num: '02', group: 'Karir', href: 'eksperimen.html', title: '30 Hari AI', desc: '70 lamaran asli dibantu AI: berapa yang tembus?' },
  { id: 'sidang', num: '03', group: 'Lab', href: 'sidang.html', title: 'Simulator Sidang', desc: 'Dosen penguji galak AI + suara & skor kesiapan skripsi' },
  { id: 'gaji', num: '04', group: 'Karir', href: 'gaji.html', title: 'Peta Gaji vs UMK', desc: 'Cek tawaran gaji fresh grad vs UMK 16 kota + simulasi sisa THP' },
  { id: 'roast', num: '05', group: 'Karir', href: 'roast-cv.html', title: 'Roast CV HRD', desc: 'Roasting CV ala HRD Jaksel, HRD Pabrik, & Robot ATS + auto-rewrite' },
  { id: 'datasheet', num: '06', group: 'Lab', href: 'datasheet.html', title: 'Datasheet → Driver', desc: 'Ubah tabel register I2C/SPI jadi driver C STM32 HAL & ESP32 + unit test' },
  { id: 'pasal', num: '07', group: 'Lab', href: 'pasal.html', title: 'Pasal & Kontrak Diff', desc: 'Bandingkan pasal UU/RUU & kontrak PKWT, terjemahkan ke bahasa manusia' },
];

export function mountNav(activeId) {
  const nav = document.querySelector('header.site nav');
  if (!nav) return;
  nav.className = 'suite-nav';
  nav.replaceChildren(
    ...TOOLS.map((t) => {
      const a = document.createElement('a');
      a.href = t.href;
      a.textContent = `${t.num} ${t.title}`;
      if (t.id === activeId) a.setAttribute('aria-current', 'page');
      return a;
    }),
  );
}
