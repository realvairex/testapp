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
const markers = p => p.evaluate(() => {
  const ed = document.querySelector('[data-col-index="1"] .page-editor');
  return ed ? Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e=>e.getAttribute('data-embed-marker')) : null;
});

async function dragGrip(page, srcIdx, targetY, holdMs) {
  const grips = await page.$$('[data-col-index="1"] .inline-embed [data-embed-grip]');
  const gb = await grips[srcIdx].boundingBox();
  await page.mouse.move(gb.x + gb.width/2, gb.y + gb.height/2);
  await page.mouse.down();
  if (holdMs) await page.waitForTimeout(holdMs);
  await page.mouse.move(gb.x + gb.width/2, gb.y + gb.height/2 - 8, { steps: 4 });
  await page.mouse.move(gb.x + gb.width/2, targetY, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch();

  // TEST 1: move last embed to the very top (drop above the first one)
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T1 ERR:', e.message));
    await setup(page);
    console.log('T1 before:', JSON.stringify(await markers(page)));
    const first = await page.$('[data-col-index="1"] .inline-embed[data-embed-marker]');
    const fb = await first.boundingBox();
    await dragGrip(page, 3, fb.y + 2, 0);
    console.log('T1 after (move #3 to top):', JSON.stringify(await markers(page)));
    await page.close();
  }

  // TEST 2: LONG PRESS then drag - hang detector
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T2 ERR:', e.message));
    await setup(page);
    console.log('T2 before:', JSON.stringify(await markers(page)));
    const first = await page.$('[data-col-index="1"] .inline-embed[data-embed-marker]');
    const fb = await first.boundingBox();
    await dragGrip(page, 2, fb.y + 2, 1500);   // 1.5s long press
    let alive = false;
    try {
      await Promise.race([
        page.evaluate(() => 1).then(() => { alive = true; }),
        new Promise((_, rj) => setTimeout(() => rj(new Error('HANG')), 5000)),
      ]);
    } catch (e) { console.log('T2', e.message); }
    console.log('T2 alive after long-press drag:', alive);
    if (alive) console.log('T2 after:', JSON.stringify(await markers(page)));
    await page.close();
  }

  // TEST 3: drop into empty space far below the last embed
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T3 ERR:', e.message));
    await setup(page);
    console.log('T3 before:', JSON.stringify(await markers(page)));
    const ed = await page.$('[data-col-index="1"] .page-editor');
    const eb = await ed.boundingBox();
    await dragGrip(page, 0, eb.y + eb.height - 20, 0);
    console.log('T3 after (move #0 to bottom):', JSON.stringify(await markers(page)));
    // leftover state check
    console.log('T3 leftovers:', JSON.stringify(await page.evaluate(() => ({
      ghosts: document.querySelectorAll('.drag-ghost').length,
      inds: document.querySelectorAll('.drop-before,.drop-after').length,
      dragging: document.querySelectorAll('.embed-dragging').length,
    }))));
    await page.close();
  }

  // TEST 4: plain click on grip must NOT move anything nor open the task
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T4 ERR:', e.message));
    await setup(page);
    const before = await markers(page);
    const grips = await page.$$('[data-col-index="1"] .inline-embed [data-embed-grip]');
    const gb = await grips[1].boundingBox();
    await page.mouse.click(gb.x + gb.width/2, gb.y + gb.height/2);
    await page.waitForTimeout(500);
    const after = await markers(page);
    const cols = await page.evaluate(() => document.querySelectorAll('.column').length);
    console.log('T4 click-on-grip unchanged:', JSON.stringify(before) === JSON.stringify(after), '| columns still', cols);
    await page.close();
  }

  // TEST 5: clicking the task row itself still opens the panel
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', e => console.log('T5 ERR:', e.message));
    await setup(page);
    await (await page.$('[data-col-index="1"] [data-open-task]')).click();
    await page.waitForTimeout(700);
    console.log('T5 columns after clicking task row:', await page.evaluate(() => document.querySelectorAll('.column').length));
    await page.close();
  }

  await browser.close();
})();
