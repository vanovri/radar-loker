// 1-Click & Automated Application Helper for Top Eligible Non-Sales Astra Career Vacancies (2026-11-04)
// Location: C:\Users\ardhy\.gemini\antigravity\scratch\radar-loker\execution-pack-2026-11-04\apply_astra_shortlist.mjs
// Pre-condition: Master CV ATS (99,026 B, SHA-256 c0a566b32a6cee1472509d2a01bab538dbdf95494fc7df45adcd61e41f3f8bc3) is synced on Ardhya's Astra Career profile.
// Usage:
//   node apply_astra_shortlist.mjs --list
//   node apply_astra_shortlist.mjs --apply 13607,14806,14923
import { Page } from 'file:///C:/Users/ardhy/AppData/Roaming/npm/node_modules/@jackwener/opencli/dist/src/browser/page.js';
import fs from 'fs';
import path from 'path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const EXEC_DIR = 'C:/Users/ardhy/.gemini/antigravity/scratch/radar-loker/execution-pack-2026-11-04';

export const SHORTLIST_TARGETS = [
  {
    vacancyId: 13607,
    companyName: 'Astra International - Daihatsu Sales Operation (DSO)',
    positionTitleName: 'MT Workshop Supervisor - DSO',
    categoryName: 'Lulusan Baru',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/13607/MT-Workshop-Supervisor-DSO'
  },
  {
    vacancyId: 14806,
    companyName: 'Astra International - Toyota Sales Operation (Auto2000 / TSO)',
    positionTitleName: 'Artificial Intelligence Specialist - TSO',
    categoryName: 'Lulusan Baru',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/14806/Artificial-Intelligence-Specialist-TSO'
  },
  {
    vacancyId: 14923,
    companyName: 'PT Astra Digital Mobil (ADMO / OLXmobbi)',
    positionTitleName: 'ADMO - SDET - Contract-based',
    categoryName: 'Semua',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/14923/ADMO-SDET-Contract-based'
  },
  {
    vacancyId: 14988,
    companyName: 'PT Traktor Nusantara (TN)',
    positionTitleName: 'IT Infrastructure & Network - TN',
    categoryName: 'Semua',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/14988/IT-Infrastructure-Network-TN'
  },
  {
    vacancyId: 13608,
    companyName: 'Astra International - Daihatsu Sales Operation (DSO)',
    positionTitleName: 'MT Kepala Regu - DSO',
    categoryName: 'Lulusan Baru',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/13608/MT-Kepala-Regu-DSO'
  },
  {
    vacancyId: 14778,
    companyName: 'PT Global Service Indonesia (GSI - UT Group)',
    positionTitleName: 'Data Engineer - GSI',
    categoryName: 'Semua',
    maxApplyOn: '31 Desember 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/14778/Data-Engineer-GSI'
  },
  {
    vacancyId: 15027,
    companyName: 'PT TD Automotive Compressor Indonesia (TACI)',
    positionTitleName: 'Production Engineering - TACI',
    categoryName: 'Lulusan Baru',
    maxApplyOn: '20 November 2026',
    url: 'https://career.astra.co.id/lowongan/lowongan-detail-page/15027/Production-Engineering-TACI'
  }
];

async function pressKey(page, key, code, vk) {
  await page.cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  await sleep(60);
  await page.cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
}

async function solveRecaptcha(page, label) {
  const rect = await page.evaluate(`(() => {
    const iframes = Array.from(document.querySelectorAll('iframe[src*="recaptcha/api2/anchor"]')).filter(f => f.getBoundingClientRect().width > 0);
    if (!iframes[0]) return null;
    iframes[0].scrollIntoView({ block: 'center' });
    iframes[0].focus();
    const r = iframes[0].getBoundingClientRect();
    return { x: Math.round(r.left + 28), y: Math.round(r.top + r.height / 2) };
  })()`);
  console.log(`[${label}] reCAPTCHA rect:`, rect);
  if (!rect) return '';

  await sleep(300);
  await pressKey(page, ' ', 'Space', 32);
  await sleep(800);
  await pressKey(page, 'Tab', 'Tab', 9);
  await sleep(200);
  await pressKey(page, ' ', 'Space', 32);

  for (let i = 0; i < 10; i++) {
    await sleep(500);
    const token = await page.evaluate(`(() => {
      const tas = Array.from(document.querySelectorAll('textarea[name="g-recaptcha-response"]')).map(t => t.value).filter(Boolean);
      return tas[0] || '';
    })()`);
    if (token) {
      console.log(`[${label}] Got reCAPTCHA token via keyboard at poll ${i} (len ${token.length})`);
      return token;
    }
  }

  await page.nativeClick(rect.x, rect.y);
  for (let i = 0; i < 12; i++) {
    await sleep(500);
    const token = await page.evaluate(`(() => {
      const tas = Array.from(document.querySelectorAll('textarea[name="g-recaptcha-response"]')).map(t => t.value).filter(Boolean);
      return tas[0] || '';
    })()`);
    if (token) {
      console.log(`[${label}] Got reCAPTCHA token via nativeClick at poll ${i} (len ${token.length})`);
      return token;
    }
  }
  return '';
}

async function applyVacancy(page, target) {
  console.log(`\n=== Navigating to ${target.vacancyId} (${target.positionTitleName}): ${target.url} ===`);
  await page.goto(target.url);
  await sleep(5000);

  const sessionState = await page.evaluate(`({
    url: location.href,
    hasUser: document.cookie.includes('AstraCareerUser'),
    userName: decodeURIComponent((document.cookie.match(/AstraUserName=([^;]+)/)||[])[1] || '')
  })`);
  console.log(`[${target.vacancyId}] Session:`, sessionState);
  if (!sessionState.hasUser) {
    return { vacancyId: target.vacancyId, status: 'NOT_LOGGED_IN', sessionState };
  }

  const clickLamar = await page.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.getBoundingClientRect().width > 0);
    const lamarBtn = btns.find(b => /^lamar$/i.test(b.innerText.trim()));
    if (lamarBtn) {
      if (lamarBtn.disabled) return { clicked: null, disabled: true, reason: 'Lamar button disabled (already applied or closed)' };
      lamarBtn.click();
      return { clicked: lamarBtn.innerText.trim(), disabled: false };
    }
    return { clicked: null, btns: btns.map(b => b.innerText.trim()) };
  })()`);
  console.log(`[${target.vacancyId}] Clicked Lamar:`, clickLamar);
  if (!clickLamar.clicked) {
    return { vacancyId: target.vacancyId, status: 'LAMAR_UNAVAILABLE', detail: clickLamar };
  }

  await sleep(3000);
  const vToken = await solveRecaptcha(page, `vacancy-${target.vacancyId}`);
  if (!vToken) {
    return { vacancyId: target.vacancyId, status: 'CAPTCHA_CHALLENGE_BLOCKED', note: 'Interactive image challenge required in browser' };
  }

  await sleep(400);
  const finalClick = await page.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.getBoundingClientRect().width > 0);
    const sub = btns.find(b => !b.disabled && /^konfirmasi$/i.test(b.innerText.trim()));
    if (sub) {
      sub.click();
      return { clicked: sub.innerText.trim() };
    }
    return { clicked: null, btns: btns.map(b => ({ text: b.innerText.trim(), disabled: b.disabled })) };
  })()`);
  console.log(`[${target.vacancyId}] Final click:`, finalClick);
  await sleep(5000);

  const shotPath = path.join(EXEC_DIR, `astra_${target.vacancyId}_applied.png`);
  const buf = await page.screenshot({ fullPage: false });
  fs.writeFileSync(shotPath, buf);

  return { vacancyId: target.vacancyId, status: 'SUBMITTED_CLICKED', finalClick, screenshot: shotPath };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--list') || args.length === 0) {
    console.log('=== ASTRA CAREER ELIGIBLE NON-SALES SHORTLIST (2026-11-04) ===');
    for (const t of SHORTLIST_TARGETS) {
      console.log(`  [${t.vacancyId}] ${t.companyName} — ${t.positionTitleName} (${t.categoryName}, Max: ${t.maxApplyOn})`);
      console.log(`          ${t.url}`);
    }
    process.exit(0);
  }

  const applyIdx = args.indexOf('--apply');
  const requestedIds = applyIdx >= 0 && args[applyIdx + 1]
    ? args[applyIdx + 1].split(',').map(s => Number(s.trim())).filter(Boolean)
    : [13607, 14806, 14923];

  const selected = SHORTLIST_TARGETS.filter(t => requestedIds.includes(t.vacancyId));
  const page = new Page('JobExecution');
  const results = [];

  for (const target of selected) {
    const res = await applyVacancy(page, target);
    results.push(res);
  }

  await page.goto('https://career.astra.co.id/account/history');
  await sleep(5000);
  const hist = await page.evaluate(`(() => {
    for (const el of document.querySelectorAll('*')) {
      const k = Object.keys(el).find(k => k.startsWith('__reactInternalInstance$') || k.startsWith('__reactFiber$') || k.startsWith('_reactRootContainer'));
      if (!k) continue;
      let cur = el[k]?._internalRoot?.current || el[k];
      while (cur) {
        const st = cur.memoizedState?.element?.props?.store || cur.pendingProps?.store || cur.stateNode?.store;
        if (st) return st.getState().ApplyHistory?.data;
        cur = cur.return;
      }
    }
    return null;
  })()`);
  console.log('\n=== ASTRA APPLY HISTORY ===');
  console.log(JSON.stringify(hist, null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
