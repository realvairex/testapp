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
  await page.waitForTimeout(600);

  const fluege = await page.$('[data-col-index="1"] [data-open-task]');
  await fluege.click();

  // capture mid-animation screenshots at several timepoints
  await page.waitForTimeout(80);
  await page.screenshot({ path: OUT+'mid1.png' });
  await page.waitForTimeout(80);
  await page.screenshot({ path: OUT+'mid2.png' });
  await page.waitForTimeout(80);
  await page.screenshot({ path: OUT+'mid3.png' });

  // dump computed heights of columns during animation
  const heights = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.column')).map(c => {
      const r = c.getBoundingClientRect();
      return { key: c.getAttribute('data-col-key'), top: r.top, height: r.height, transform: getComputedStyle(c).transform };
    });
  });
  console.log(JSON.stringify(heights, null, 2));

  await browser.close();
})();
