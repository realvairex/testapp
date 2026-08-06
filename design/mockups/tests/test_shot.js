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
  await page.waitForTimeout(300);
  const urlaub = await page.$('[data-col-index="0"] [data-open-task]');
  await urlaub.click();
  await page.waitForTimeout(150);
  await page.screenshot({ path: OUT+'midopen1.png' });
  await browser.close();
})();
