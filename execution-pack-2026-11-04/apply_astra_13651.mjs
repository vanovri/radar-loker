// 1-Click Helper for PT Astra Otoparts Tbk — Engineering - AOP (Vacancy ID: 13651)
// URL: https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP
// Pre-condition: Master CV ATS (99,026 B) is already synced on Ardhya's Astra Career profile.
import { Page } from 'file:///C:/Users/ardhy/AppData/Roaming/npm/node_modules/@jackwener/opencli/dist/src/browser/page.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const page = new Page('JobExecution');
  const url = 'https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP';
  console.log('Navigating to Astra Otoparts Engineering - AOP (13651):', url);
  await page.goto(url);
  await sleep(4500);
  const state = await page.evaluate(`({
    url: location.href,
    loggedInUser: decodeURIComponent((document.cookie.match(/AstraUserName=([^;]+)/)||[])[1] || ''),
    hasUserCookie: document.cookie.includes('AstraCareerUser')
  })`);
  console.log('Session state:', state);
  console.log('If not logged in, sign in at https://career.astra.co.id/signin, solve reCAPTCHA v2, and click Lamar on Vacancy 13651.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
