const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  // open a panel so embeds exist too
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(300);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);

  const sels = [
    '.nav-item[data-drag-id="inbox"]', '.nav-item[data-drag-id="personal"]',
    '.nav-item[data-drag-id="groceries"]', '.nav-item[data-drag-id="work"]',
    '.group-row[data-drag-id="g1"]', '.group-row[data-drag-id="g2"]',
    '.group-title[data-group-title-for="g1"]', '[data-toggle-group="g1"]',
    '#sidebar .sidebar-spacer', '#sidebar .brand', '[data-nav="today"]', '.theme-segmented',
    '#contentArea', '.page-editor', '.inline-embed', '.inline-embed [data-embed-grip]',
    '.check-btn', '.task-row', '.quick-add input', '.col-title',
  ];

  let n = 0, hangs = 0;
  for (const s of sels) {
    for (const d of sels) {
      if (s === d) continue;
      for (const frac of [0.1, 0.9]) {
        n++;
        const S = await page.$(s), D = await page.$(d);
        if (!S || !D) continue;
        let a, b;
        try { a = await S.boundingBox(); b = await D.boundingBox(); } catch (e) { continue; }
        if (!a || !b) continue;
        try {
          await page.mouse.move(a.x + a.width/2, a.y + a.height/2);
          await page.mouse.down();
          await page.mouse.move(a.x + a.width/2, a.y + a.height/2 - 7, { steps: 3 });
          await page.mouse.move(b.x + b.width/2, b.y + b.height*frac, { steps: 6 });
          await page.mouse.up();
        } catch (e) {}
        try {
          await Promise.race([
            page.evaluate(() => 1),
            new Promise((_, rj) => setTimeout(() => rj(new Error('HANG')), 3000)),
          ]);
        } catch (e) {
          hangs++; console.log('*** HANG:', s, '->', d, frac);
          await browser.close(); return;
        }
      }
    }
  }
  console.log('ran', n, 'drag combinations across sidebar + editor, hangs:', hangs);

  // app still fully functional afterwards?
  const alive = await page.evaluate(() => ({
    cols: document.querySelectorAll('.column').length,
    navItems: document.querySelectorAll('#sidebar .nav-item[data-drag-id]').length,
    stuckGhost: document.querySelectorAll('.drag-ghost').length,
    stuckInd: document.querySelectorAll('.drop-before,.drop-after,.drop-into').length,
    stuckSort: document.querySelectorAll('.is-sorting').length,
  }));
  console.log('state after fuzz:', JSON.stringify(alive));
  await page.click('.nav-item[data-nav="today"]');
  await page.waitForTimeout(400);
  console.log('still navigable:', await page.evaluate(() => !!document.querySelector('[data-col-key="today"]')));
  console.log('PAGE ERRORS:', errs.length ? errs.slice(0,8) : 'none');
  await browser.close();
})();
