const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  const fileUrl = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
  await page.goto(fileUrl);
  await page.waitForTimeout(200);

  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  // Open "Urlaub planen" -> col 1 has 3 task embeds
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);

  const before = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    return {
      markers: Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e => e.getAttribute('data-embed-marker')),
      ownerBlocks: null,
    };
  });
  console.log('BEFORE markers:', JSON.stringify(before.markers));

  const embeds = await page.$$('[data-col-index="1"] .inline-embed[data-embed-marker]');
  console.log('num embeds:', embeds.length);

  // drag embed[2] onto embed[0] (move last to first)
  const src = embeds[2], dst = embeds[0];
  const sb = await src.boundingBox(), db = await dst.boundingBox();

  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 10, { steps: 3 });
  await page.mouse.move(db.x + db.width/2, db.y + 3, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(700);

  const after = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    return ed ? Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e => e.getAttribute('data-embed-marker')) : null;
  });
  console.log('AFTER markers:', JSON.stringify(after));

  const dragState = await page.evaluate(() => {
    // drag is module-scoped in an IIFE, can't read it. Check drag-ghost leftovers instead.
    return {
      ghosts: document.querySelectorAll('.drag-ghost').length,
      indicators: document.querySelectorAll('.drop-before, .drop-after').length,
    };
  });
  console.log('leftover state:', JSON.stringify(dragState));

  await browser.close();
})();
