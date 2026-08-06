const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  // A: stale drop indicator — drag over a valid target, then over empty sidebar space, don't drop
  const src = await page.$('.nav-item[data-drag-id="inbox"]');
  const dst = await page.$('.nav-item[data-drag-id="personal"]');
  const spacer = await page.$('#sidebar .sidebar-spacer');
  const sb = await src.boundingBox(), db = await dst.boundingBox(), spb = await spacer.boundingBox();

  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 6, { steps: 4 });
  await page.mouse.move(db.x + db.width/2, db.y + db.height*0.85, { steps: 10 });
  await page.waitForTimeout(120);
  const whileOverValid = await page.evaluate(() => document.querySelectorAll('.drop-before,.drop-after,.drop-into').length);
  // now move over empty space in the sidebar (not a valid drop target)
  await page.mouse.move(spb.x + spb.width/2, spb.y + spb.height/2, { steps: 10 });
  await page.waitForTimeout(120);
  const whileOverEmpty = await page.evaluate(() => ({
    count: document.querySelectorAll('.drop-before,.drop-after,.drop-into').length,
    on: Array.from(document.querySelectorAll('.drop-before,.drop-after,.drop-into')).map(e=>e.getAttribute('data-drag-id')),
  }));
  await page.mouse.up();
  await page.waitForTimeout(300);
  console.log('A) indicator while over VALID target:', whileOverValid);
  console.log('A) indicator while over EMPTY space :', JSON.stringify(whileOverEmpty), '<- should be 0');

  // B: touch support check — is native HTML5 DnD driven by touch events at all?
  const touchWorks = await page.evaluate(() => {
    // native HTML5 drag is mouse-only; touch never synthesises dragstart
    return typeof window.ontouchstart !== 'undefined';
  });
  console.log('B) touch events available in this build:', touchWorks, '(native HTML5 DnD never fires from touch regardless)');

  await browser.close();
})();
