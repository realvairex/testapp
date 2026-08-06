const { chromium } = require('playwright');

const sidebarState = p => p.evaluate(() => {
  const out = [];
  document.querySelectorAll('#sidebar .nav-item[data-drag-type="list"], #sidebar .group-row[data-drag-type="group"]').forEach(el => {
    out.push((el.getAttribute('data-drag-type')==='group' ? 'G:' : 'L:') + el.getAttribute('data-drag-id'));
  });
  return out;
});

async function nativeDrag(page, srcSel, dstSel, yOffsetFrac) {
  const src = await page.$(srcSel), dst = await page.$(dstSel);
  if (!src || !dst) return 'MISSING';
  const sb = await src.boundingBox(), db = await dst.boundingBox();
  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 6, { steps: 4 });
  await page.mouse.move(db.x + db.width/2, db.y + db.height*yOffsetFrac, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  return 'OK';
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  console.log('start:', JSON.stringify(await sidebarState(page)));

  // 1. reorder: drag "inbox" list below "personal"
  console.log('drag inbox -> below personal:', await nativeDrag(page, '.nav-item[data-drag-id="inbox"]', '.nav-item[data-drag-id="personal"]', 0.85));
  console.log('  ->', JSON.stringify(await sidebarState(page)));

  // 2. drag a list INTO a group
  console.log('drag inbox -> onto group g2:', await nativeDrag(page, '.nav-item[data-drag-id="inbox"]', '.group-row[data-drag-id="g2"]', 0.5));
  console.log('  ->', JSON.stringify(await sidebarState(page)));

  // 3. reorder groups
  console.log('drag group g2 -> above g1:', await nativeDrag(page, '.group-row[data-drag-id="g2"]', '.group-row[data-drag-id="g1"]', 0.15));
  console.log('  ->', JSON.stringify(await sidebarState(page)));

  // 4. does a plain click on a list still navigate?
  await page.click('.nav-item[data-drag-id="groceries"]');
  await page.waitForTimeout(300);
  console.log('click nav still works:', await page.evaluate(() => !!document.querySelector('.nav-item.active')));

  // 5. leftover state
  console.log('leftovers:', JSON.stringify(await page.evaluate(() => ({
    ghosts: document.querySelectorAll('.drag-ghost').length,
    inds: document.querySelectorAll('.drop-before,.drop-after,.drop-into').length,
  }))));

  await browser.close();
})();
