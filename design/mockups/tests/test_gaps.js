// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);

  const gapInfo = () => page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    return Array.from(ed.children).map(c => ({
      kind: c.classList.contains('inline-embed') ? 'EMBED' : 'LINE',
      gap: c.classList.contains('pe-gap'), open: c.classList.contains('pe-open'),
      h: Math.round(c.getBoundingClientRect().height), txt: c.textContent.slice(0,20)
    }));
  });
  console.log('structure + heights:');
  (await gapInfo()).forEach(r=>console.log('  ', JSON.stringify(r)));

  // total vertical space between the first and last embed
  const spread = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    const es = ed.querySelectorAll('.inline-embed');
    if (es.length < 2) return null;
    const a = es[0].getBoundingClientRect(), b = es[1].getBoundingClientRect();
    return { gapBetweenFirstTwoTasks: Math.round(b.top - a.bottom) };
  });
  console.log('visual gap between two consecutive tasks:', JSON.stringify(spread));

  // click the gap -> it should open and accept text
  const gapBox = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    const g = ed.querySelector('.pe-gap');
    if (!g) return null;
    const r = g.getBoundingClientRect();
    return { x: r.x + 30, y: r.y + r.height/2 };
  });
  if (gapBox) {
    await page.mouse.click(gapBox.x, gapBox.y);
    await page.waitForTimeout(200);
    const opened = await page.evaluate(() => !!document.querySelector('.pe-gap.pe-open'));
    console.log('clicking a gap opens it:', opened);
    await page.keyboard.type('HALLO');
    await page.waitForTimeout(250);
    const after = await gapInfo();
    console.log('after typing into the gap:');
    after.forEach(r=>console.log('  ', JSON.stringify(r)));
    console.log('>>> text landed between the tasks:', after.some(r=>r.kind==='LINE' && r.txt==='HALLO' && !r.gap));
  }
  console.log('PAGE ERRORS:', errs.length?errs:'none');
  await page.screenshot({ path: OUT+'gaps.png' });
  await browser.close();
})();
