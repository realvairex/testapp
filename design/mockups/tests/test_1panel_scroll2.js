const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const fileUrl = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
  await page.goto(fileUrl);
  await page.waitForTimeout(200);

  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(300);

  const urlaub = await page.$('[data-col-index="0"] [data-open-task]');

  const framesPromise = page.evaluate(() => {
    return new Promise((resolve) => {
      const samples = [];
      const start = performance.now();
      function tick() {
        const ca = document.getElementById('contentArea');
        samples.push({
          t: +(performance.now() - start).toFixed(1),
          overflowX: getComputedStyle(ca).overflowX,
          animLock: ca.classList.contains('anim-lock'),
          clientHeight: ca.clientHeight,
        });
        if (performance.now() - start < 500) requestAnimationFrame(tick);
        else resolve(samples);
      }
      requestAnimationFrame(tick);
    });
  });
  await urlaub.click();
  const samples = await framesPromise;
  samples.forEach(s => console.log(JSON.stringify(s)));
  await browser.close();
})();
