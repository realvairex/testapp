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

  // Stamp a marker on a node inside column 0 (the survivor) and column 1 (also survivor)
  await page.evaluate(() => {
    document.querySelector('[data-col-index="0"] .col-title').setAttribute('data-marker', 'SURVIVOR-0');
    document.querySelector('[data-col-index="1"] .col-title').setAttribute('data-marker', 'SURVIVOR-1');
  });

  const closeBtn = await page.$('[data-close-col="2"]');
  await closeBtn.click();
  await page.waitForTimeout(700);

  const result = await page.evaluate(() => {
    const c0 = document.querySelector('[data-col-index="0"] .col-title');
    const c1 = document.querySelector('[data-col-index="1"] .col-title');
    const c2 = document.querySelector('[data-col-index="2"]');
    return {
      col0MarkerPreserved: c0 && c0.getAttribute('data-marker') === 'SURVIVOR-0',
      col1MarkerPreserved: c1 && c1.getAttribute('data-marker') === 'SURVIVOR-1',
      col2StillExists: !!c2,
      numCols: document.querySelectorAll('.column').length,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
