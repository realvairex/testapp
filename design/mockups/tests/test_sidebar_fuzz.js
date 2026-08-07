const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  const targets = [
    '.nav-item[data-drag-id="inbox"]', '.nav-item[data-drag-id="personal"]',
    '.nav-item[data-drag-id="groceries"]', '.nav-item[data-drag-id="work"]',
    '.group-row[data-drag-id="g1"]', '.group-row[data-drag-id="g2"]',
    '#sidebar .sidebar-spacer', '#sidebar .brand', '[data-nav="today"]',
    '#contentArea', '.theme-segmented',
  ];

  let combo = 0;
  for (const s of targets) {
    for (const d of targets) {
      if (s === d) continue;
      for (const frac of [0.1, 0.9]) {
        combo++;
        const src = await page.$(s), dst = await page.$(d);
        if (!src || !dst) continue;
        let sb, db;
        try { sb = await src.boundingBox(); db = await dst.boundingBox(); } catch (e) { continue; }
        if (!sb || !db) continue;
        try {
          await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
          await page.mouse.down();
          await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 6, { steps: 3 });
          await page.mouse.move(db.x + db.width/2, db.y + db.height*frac, { steps: 6 });
          await page.mouse.up();
        } catch (e) { console.log('MOUSE FAIL', s, '->', d, e.message); }
        // hang check
        try {
          await Promise.race([
            page.evaluate(() => 1),
            new Promise((_, rj) => setTimeout(() => rj(new Error('HANG')), 3000)),
          ]);
        } catch (e) {
          console.log('*** HANG at combo', combo, s, '->', d, 'frac', frac);
          await browser.close(); return;
        }
      }
    }
  }
  console.log('completed', combo, 'sidebar drag combinations, no hang');
  console.log('page errors:', errs.length ? errs.slice(0,10) : 'none');
  console.log('final sidebar:', JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('#sidebar [data-drag-id]')).map(e=>e.getAttribute('data-drag-id')))));
  await browser.close();
})();
