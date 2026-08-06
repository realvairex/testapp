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

  // Open first list, drill into a task with subtasks to get to 2 columns, then 3.
  const listBtn = await page.$('.nav-item[data-list]');
  await listBtn.click();
  await page.waitForTimeout(500);

  // Find a task row with children to open as a panel (data-open-task)
  const openable = await page.$('[data-open-task]');
  if (!openable) { console.log('NO OPENABLE TASK FOUND'); await browser.close(); return; }
  await openable.click();
  await page.waitForTimeout(600);

  const cw1 = await page.evaluate(() => document.getElementById('appWindow').classList.contains('sidebar-collapsed'));
  console.log('after opening 1 panel (2 cols total), sidebar-collapsed =', cw1);

  // find another open-task inside the newly opened panel (col-index 1)
  const openable2 = await page.$('[data-col-index="1"] [data-open-task]');
  if (!openable2) { console.log('NO SECOND OPENABLE TASK FOUND - trying insert'); }
  else {
    // Start frame sampling across the sidebar-collapse transition
    const framesPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const samples = [];
        const start = performance.now();
        function tick() {
          const appWindow = document.getElementById('appWindow');
          const rect = document.getElementById('contentArea').getBoundingClientRect();
          samples.push({ t: performance.now() - start, collapsed: appWindow.classList.contains('sidebar-collapsed'), width: rect.width });
          if (performance.now() - start < 700) requestAnimationFrame(tick);
          else resolve(samples);
        }
        requestAnimationFrame(tick);
      });
    });
    await openable2.click();
    const samples = await framesPromise;
    console.log('total frames sampled:', samples.length);
    // detect gaps > 40ms (dropped frames) and detect any long "stuck" width period
    let maxGap = 0;
    for (let i = 1; i < samples.length; i++) {
      const gap = samples[i].t - samples[i-1].t;
      if (gap > maxGap) maxGap = gap;
    }
    console.log('max frame gap (ms):', maxGap.toFixed(1));
    // print width over time compactly
    const widths = samples.map(s => Math.round(s.width));
    console.log('content-area width samples:', widths.join(','));
    const cw2 = await page.evaluate(() => document.getElementById('appWindow').classList.contains('sidebar-collapsed'));
    console.log('after opening 2nd panel (3 cols total), sidebar-collapsed =', cw2);
  }

  await page.screenshot({ path: OUT+'after3.png' });

  // Now close back down to 2 columns and sample again
  const closeBtn = await page.$('[data-close-col="2"]');
  if (closeBtn) {
    const framesPromise2 = page.evaluate(() => {
      return new Promise((resolve) => {
        const samples = [];
        const start = performance.now();
        function tick() {
          const appWindow = document.getElementById('appWindow');
          const rect = document.getElementById('contentArea').getBoundingClientRect();
          samples.push({ t: performance.now() - start, collapsed: appWindow.classList.contains('sidebar-collapsed'), width: rect.width });
          if (performance.now() - start < 700) requestAnimationFrame(tick);
          else resolve(samples);
        }
        requestAnimationFrame(tick);
      });
    });
    await closeBtn.click();
    const samples2 = await framesPromise2;
    let maxGap2 = 0;
    for (let i = 1; i < samples2.length; i++) {
      const gap = samples2[i].t - samples2[i-1].t;
      if (gap > maxGap2) maxGap2 = gap;
    }
    console.log('CLOSE: max frame gap (ms):', maxGap2.toFixed(1));
    const widths2 = samples2.map(s => Math.round(s.width));
    console.log('CLOSE: content-area width samples:', widths2.join(','));
  } else {
    console.log('NO CLOSE BUTTON FOR COL 2 FOUND');
  }

  await page.screenshot({ path: OUT+'afterclose.png' });
  await browser.close();
})();
