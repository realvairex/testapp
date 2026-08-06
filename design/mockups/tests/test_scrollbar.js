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
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => {
    const appWindow = document.getElementById('appWindow');
    const contentArea = document.getElementById('contentArea');
    const rect = appWindow.getBoundingClientRect();
    const cs = getComputedStyle(appWindow);
    return {
      appWindowRectWidth: rect.width,
      appWindowClientWidth: appWindow.clientWidth,
      borderLeft: cs.borderLeftWidth,
      borderRight: cs.borderRightWidth,
      contentAreaClientWidth: contentArea.clientWidth,
      contentAreaScrollWidth: contentArea.scrollWidth,
      hasHorizontalOverflow: contentArea.scrollWidth > contentArea.clientWidth,
      colWidths: Array.from(document.querySelectorAll('.column')).map(c => c.getBoundingClientRect().width),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
