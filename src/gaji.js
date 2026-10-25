// Peta Gaji Fresh Grad RI vs UMK & Kalkulator Layak Hidup.
// Data UMK/UMP mengacu pada kisaran resmi 2025/2026 kota industri & provinsi utama (dibulatkan ke ribuan terdekat).

export const CITIES = [
  { id: 'bekasi-kab', name: 'Kab. Bekasi (Cikarang)', umk: 5_558_515, kos: 1_100_000, makan: 1_500_000, transport: 450_000 },
  { id: 'karawang', name: 'Kab. Karawang', umk: 5_599_593, kos: 1_000_000, makan: 1_450_000, transport: 400_000 },
  { id: 'bekasi-kota', name: 'Kota Bekasi', umk: 5_690_753, kos: 1_250_000, makan: 1_600_000, transport: 500_000 },
  { id: 'jakarta', name: 'DKI Jakarta', umk: 5_396_761, kos: 1_800_000, makan: 1_900_000, transport: 600_000 },
  { id: 'depok', name: 'Kota Depok', umk: 5_195_720, kos: 1_300_000, makan: 1_550_000, transport: 500_000 },
  { id: 'tangerang', name: 'Kota Tangerang', umk: 5_069_708, kos: 1_350_000, makan: 1_600_000, transport: 500_000 },
  { id: 'bogor-kab', name: 'Kab. Bogor', umk: 4_877_211, kos: 1_050_000, makan: 1_400_000, transport: 450_000 },
  { id: 'surabaya', name: 'Kota Surabaya', umk: 4_961_753, kos: 1_150_000, makan: 1_400_000, transport: 400_000 },
  { id: 'sidoarjo', name: 'Kab. Sidoarjo', umk: 4_870_511, kos: 950_000, makan: 1_300_000, transport: 380_000 },
  { id: 'batam', name: 'Kota Batam', umk: 4_989_600, kos: 1_200_000, makan: 1_600_000, transport: 450_000 },
  { id: 'bandung', name: 'Kota Bandung', umk: 4_482_914, kos: 1_200_000, makan: 1_450_000, transport: 400_000 },
  { id: 'semarang', name: 'Kota Semarang', umk: 3_454_827, kos: 850_000, makan: 1_200_000, transport: 350_000 },
  { id: 'balikpapan', name: 'Kota Balikpapan', umk: 3_701_508, kos: 1_250_000, makan: 1_650_000, transport: 450_000 },
  { id: 'medan', name: 'Kota Medan', umk: 4_014_072, kos: 950_000, makan: 1_350_000, transport: 380_000 },
  { id: 'makassar', name: 'Kota Makassar', umk: 3_880_136, kos: 950_000, makan: 1_350_000, transport: 380_000 },
  { id: 'sleman', name: 'Kab. Sleman (Yogyakarta)', umk: 2_466_514, kos: 750_000, makan: 1_100_000, transport: 300_000 },
];

// Pengali pasar fresh grad S1/D3 terhadap UMK kota setempat (atau floor nasional)
export const ROLES = [
  { id: 'software', name: 'Software / IT / Data', multMin: 1.05, multMed: 1.35, multMax: 1.85, floorMin: 5_000_000 },
  { id: 'elektro', name: 'Teknik Elektro / Otomasi / MEP / PLTS', multMin: 1.02, multMed: 1.25, multMax: 1.65, floorMin: 4_800_000 },
  { id: 'mt', name: 'Management Trainee (MT) / Graduate Program', multMin: 1.15, multMed: 1.45, multMax: 2.0, floorMin: 6_000_000 },
  { id: 'sales-eng', name: 'Sales Engineer / B2B Account', multMin: 1.0, multMed: 1.2, multMax: 1.55, floorMin: 4_500_000 },
  { id: 'admin', name: 'Admin / Operasional / CS', multMin: 1.0, multMed: 1.08, multMax: 1.25, floorMin: 3_500_000 },
];

export function evaluateOffer({ cityId, roleId, offerGross }) {
  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const role = ROLES.find((r) => r.id === roleId) || ROLES[0];
  const gross = Number(offerGross) || 0;

  const marketMin = Math.round(Math.max(city.umk * role.multMin, role.floorMin * (city.umk / 5_000_000)) / 50_000) * 50_000;
  const marketMed = Math.round(Math.max(city.umk * role.multMed, marketMin * 1.2) / 50_000) * 50_000;
  const marketMax = Math.round(Math.max(city.umk * role.multMax, marketMed * 1.25) / 50_000) * 50_000;

  // Potongan BPJS Kesehatan (1%) + JHT (2%) + JP (1%) ≈ 4%
  const net = Math.round(gross * 0.96);
  const livingCost = city.kos + city.makan + city.transport;
  const leftover = net - livingCost;
  const diffUmkPct = Math.round(((gross - city.umk) / city.umk) * 100);

  let verdict;
  if (gross < city.umk) {
    verdict = {
      key: 'bawah-umk',
      label: 'Di bawah UMK (Melanggar ketentuan upah minimum)',
      tone: 'bahaya',
      summary: `Tawaran ini ${Math.abs(diffUmkPct)}% di bawah UMK ${city.name}. Untuk pekerja penuh waktu (non-magang), membayar di bawah UMK melanggar PP Pengupahan.`,
    };
  } else if (gross < marketMin) {
    verdict = {
      key: 'mepet',
      label: 'Pas-pasan / Mepet UMK',
      tone: 'waspada',
      summary: `Sah secara hukum (+${diffUmkPct}% dari UMK), tapi di bawah rata-rata pasar fresh grad ${role.name} di ${city.name}.`,
    };
  } else if (gross <= marketMed * 1.05) {
    verdict = {
      key: 'wajar',
      label: 'Wajar sesuai pasar',
      tone: 'aman',
      summary: `Berada di rentang wajar fresh grad ${role.name} untuk wilayah ${city.name} (+${diffUmkPct}% di atas UMK).`,
    };
  } else {
    verdict = {
      key: 'tinggi',
      label: 'Di atas rata-rata pasar',
      tone: 'aman',
      summary: `Kompetitif (+${diffUmkPct}% di atas UMK). Pastikan beban kerja, jam lembur, dan klaim benefit tertulis jelas di kontrak.`,
    };
  }

  const targetAsk = Math.max(marketMed, Math.round((gross * 1.15) / 100_000) * 100_000);
  const rp = (n) => 'Rp' + n.toLocaleString('id-ID');

  const negoScript =
    gross < city.umk
      ? `Terima kasih atas tawaran untuk posisi ${role.name}. Mengacu pada UMK ${city.name} (${rp(city.umk)}) serta kualifikasi dan portofolio teknis yang saya bawa, apakah komponen gaji pokok dapat disesuaikan ke rentang ${rp(marketMin)} – ${rp(marketMed)}?`
      : `Terima kasih atas tawaran untuk posisi ${role.name}. Berdasarkan riset pasar untuk peran ${role.name} di ${city.name} serta pengalaman proyek teknis yang relevan, saya berharap kompensasi dapat didiskusikan di kisaran ${rp(targetAsk)} gross per bulan. Apakah ada ruang penyesuaian pada gaji pokok atau tunjangan tetap?`;

  return {
    city,
    role,
    gross,
    net,
    livingCost,
    leftover,
    diffUmkPct,
    market: { min: marketMin, median: marketMed, max: marketMax },
    verdict,
    negoScript,
  };
}
