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
  await page.waitForTimeout(500);
  await (await page.$('[data-col-index="1"] [data-open-task]')).click();
  await page.waitForTimeout(500);
  await (await page.$('[data-col-index="2"] [data-open-task]')).click();
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => {
    const contentArea = document.getElementById('contentArea');
    return {
      numCols: document.querySelectorAll('.column').length,
      clientWidth: contentArea.clientWidth,
      scrollWidth: contentArea.scrollWidth,
      overflow: contentArea.scrollWidth > contentArea.clientWidth,
      colWidths: Array.from(document.querySelectorAll('.column')).map(c => c.getBoundingClientRect().width),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: OUT+'4cols.png' });
  await browser.close();
})();
