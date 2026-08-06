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
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
  await (await page.$('[data-col-index="1"] [data-open-task]')).click();
  await page.waitForTimeout(700);
  await (await page.$('[data-close-col="2"]')).click();
  await page.waitForTimeout(700);

  // reopen a different task from column 1 (Unterkunft aussuchen) - should still push/animate fine
  const rows = await page.$$('[data-col-index="1"] [data-open-task]');
  await rows[1].click(); // second task row = "Unterkunft aussuchen"
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => ({
    numCols: document.querySelectorAll('.column').length,
    titles: Array.from(document.querySelectorAll('.column .col-title')).map(t => t.value || t.textContent),
  }));
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: OUT+'reopen.png' });
  await browser.close();
})();
