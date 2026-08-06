// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const fileUrl = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
  await page.goto(fileUrl);
  await page.waitForTimeout(200);

  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  // open "Urlaub planen" (col index 0 -> opens col 1)
  const urlaub = await page.$('[data-col-index="0"] [data-open-task]');
  await urlaub.click();
  await page.waitForTimeout(600);
  console.log('cols after 1st open:', await page.$$eval('.column', els => els.length));
  console.log('sidebar-collapsed:', await page.evaluate(() => document.getElementById('appWindow').classList.contains('sidebar-collapsed')));

  // open "Flüge vergleichen" inside col index 1 -> opens col 2 (3 total, triggers collapse)
  const fluege = await page.$('[data-col-index="1"] [data-open-task]');
  if (!fluege) { console.log('NO 2nd openable found'); await browser.close(); return; }

  const framesPromise = page.evaluate(() => {
    return new Promise((resolve) => {
      const samples = [];
      const start = performance.now();
      function tick() {
        const appWindow = document.getElementById('appWindow');
        const rect = document.getElementById('contentArea').getBoundingClientRect();
        samples.push({ t: +(performance.now() - start).toFixed(1), collapsed: appWindow.classList.contains('sidebar-collapsed'), width: Math.round(rect.width) });
        if (performance.now() - start < 650) requestAnimationFrame(tick);
        else resolve(samples);
      }
      requestAnimationFrame(tick);
    });
  });
  await fluege.click();
  const samples = await framesPromise;
  let maxGap = 0;
  for (let i = 1; i < samples.length; i++) maxGap = Math.max(maxGap, samples[i].t - samples[i-1].t);
  console.log('OPEN 3rd col: frames=', samples.length, 'maxGap(ms)=', maxGap.toFixed(1));
  console.log('OPEN widths:', samples.map(s=>s.width).join(','));
  console.log('cols now:', await page.$$eval('.column', els => els.length));
  await page.screenshot({ path: OUT+'after3.png' });

  // close col index 2 back to 2 columns
  const closeBtn = await page.$('[data-close-col="2"]');
  if (!closeBtn) { console.log('no close btn for col 2'); await browser.close(); return; }
  const framesPromise2 = page.evaluate(() => {
    return new Promise((resolve) => {
      const samples = [];
      const start = performance.now();
      function tick() {
        const appWindow = document.getElementById('appWindow');
        const rect = document.getElementById('contentArea').getBoundingClientRect();
        samples.push({ t: +(performance.now() - start).toFixed(1), collapsed: appWindow.classList.contains('sidebar-collapsed'), width: Math.round(rect.width) });
        if (performance.now() - start < 650) requestAnimationFrame(tick);
        else resolve(samples);
      }
      requestAnimationFrame(tick);
    });
  });
  await closeBtn.click();
  const samples2 = await framesPromise2;
  let maxGap2 = 0;
  for (let i = 1; i < samples2.length; i++) maxGap2 = Math.max(maxGap2, samples2[i].t - samples2[i-1].t);
  console.log('CLOSE: frames=', samples2.length, 'maxGap(ms)=', maxGap2.toFixed(1));
  console.log('CLOSE widths:', samples2.map(s=>s.width).join(','));
  console.log('cols now:', await page.$$eval('.column', els => els.length));
  await page.screenshot({ path: OUT+'afterclose.png' });

  await browser.close();
})();
