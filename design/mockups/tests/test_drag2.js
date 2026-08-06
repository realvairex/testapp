const { chromium } = require('playwright');

async function setup(page) {
  const fileUrl = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
  await page.goto(fileUrl);
  await page.waitForTimeout(200);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch();

  // === TEST 1: drop an embed onto plain TEXT (not another embed) ===
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T1 PAGE ERROR:', e.message));
    await setup(page);
    const embeds = await page.$$('[data-col-index="1"] .inline-embed[data-embed-marker]');
    const src = embeds[2];
    const sb = await src.boundingBox();
    // target: the plain text line at the top of the editor
    const textBox = await page.evaluate(() => {
      const ed = document.querySelector('[data-col-index="1"] .page-editor');
      const r = ed.getBoundingClientRect();
      return { x: r.x + 40, y: r.y + 6 };
    });
    await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
    await page.mouse.down();
    await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 10, { steps: 3 });
    await page.mouse.move(textBox.x, textBox.y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    // blur editor to force serialize
    await page.evaluate(() => { const ed=document.querySelector('[data-col-index="1"] .page-editor'); if(ed) ed.blur(); });
    await page.waitForTimeout(300);
    const res = await page.evaluate(() => {
      const ed = document.querySelector('[data-col-index="1"] .page-editor');
      return {
        markers: ed ? Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e=>e.getAttribute('data-embed-marker')) : null,
        html: ed ? ed.innerHTML.slice(0, 400) : null,
      };
    });
    console.log('T1 drop-on-text markers:', JSON.stringify(res.markers));
    console.log('T1 html snippet:', res.html);
    await page.close();
  }

  // === TEST 2: long press then drag (hang detector) ===
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T2 PAGE ERROR:', e.message));
    await setup(page);
    const embeds = await page.$$('[data-col-index="1"] .inline-embed[data-embed-marker]');
    const src = embeds[2], dst = embeds[0];
    const sb = await src.boundingBox(), db = await dst.boundingBox();

    await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2);
    await page.mouse.down();
    console.log('T2 holding for 1200ms...');
    await page.waitForTimeout(1200);   // LONG PRESS
    await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2 - 8, { steps: 4 });
    await page.mouse.move(db.x + db.width/2, db.y + 3, { steps: 12 });
    await page.mouse.up();

    // hang detector: can the page still run JS?
    let alive = false;
    try {
      await Promise.race([
        page.evaluate(() => new Promise(r => setTimeout(() => r(true), 100))).then(() => { alive = true; }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('HANG: page did not respond in 5s')), 5000)),
      ]);
    } catch (err) { console.log('T2', err.message); }
    console.log('T2 page alive after long-press drag:', alive);
    if (alive) {
      const res = await page.evaluate(() => {
        const ed = document.querySelector('[data-col-index="1"] .page-editor');
        return ed ? Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e=>e.getAttribute('data-embed-marker')) : null;
      });
      console.log('T2 markers:', JSON.stringify(res));
    }
    await page.close();
  }

  await browser.close();
})();
