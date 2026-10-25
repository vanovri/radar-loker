// Scan banyak lowongan sekaligus → ringkasan red flag (bahan konten "X lowongan gw scan").
// Pakai: node scripts/scan.mjs <folder berisi .txt, satu lowongan per file> [--json]
import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { analyze } from '../src/rules.js';

const dir = process.argv[2];
if (!dir) {
  console.error('Pakai: node scripts/scan.mjs <folder-lowongan> [--json]');
  process.exit(1);
}

const files = (await readdir(dir)).filter((f) => f.endsWith('.txt'));
const results = [];
for (const f of files) {
  const r = analyze(await readFile(join(dir, f), 'utf8'));
  results.push({ file: basename(f), score: r.score, level: r.level.label, flags: r.findings.map((x) => x.id) });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

const freq = {};
for (const r of results) for (const id of r.flags) freq[id] = (freq[id] || 0) + 1;
const levels = {};
for (const r of results) levels[r.level] = (levels[r.level] || 0) + 1;

console.log(`Lowongan discan: ${results.length}`);
console.table(levels);
console.log('Red flag paling sering:');
console.table(
  Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => ({ flag: id, lowongan: n, persen: `${Math.round((n / results.length) * 100)}%` })),
);
console.log('Skor tertinggi:');
console.table(results.sort((a, b) => b.score - a.score).slice(0, 10));
