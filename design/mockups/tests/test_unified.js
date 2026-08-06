const { chromium } = require('playwright');

const sb = p => p.evaluate(() => Array.from(document.querySelectorAll('#sidebar [data-drag-id]'))
  .map(e => (e.getAttribute('data-drag-type')==='group'?'G:':'L:') + e.getAttribute('data-drag-id')));
const emb = p => p.evaluate(() => {
  const ed = document.querySelector('[data-col-index="1"] .page-editor');
  return ed ? Array.from(ed.querySelectorAll('[data-embed-marker]')).map(e=>e.getAttribute('data-embed-marker')) : null;
});

async function pdrag(page, srcSel, dstSel, frac, hold) {
  const s = await page.$(srcSel), d = await page.$(dstSel);
  if (!s || !d) return 'MISSING ' + srcSel + ' / ' + dstSel;
  const a = await s.boundingBox(), b = await d.boundingBox();
  await page.mouse.move(a.x + a.width/2, a.y + a.height/2);
  await page.mouse.down();
  if (hold) await page.waitForTimeout(hold);
  await page.mouse.move(a.x + a.width/2, a.y + a.height/2 - 8, { steps: 4 });
  await page.mouse.move(b.x + b.width/2, b.y + b.height*frac, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(450);
  return 'OK';
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  console.log('=== SIDEBAR ===');
  console.log('start:', JSON.stringify(await sb(page)));
  await pdrag(page, '.nav-item[data-drag-id="inbox"]', '.nav-item[data-drag-id="personal"]', 0.85);
  console.log('inbox below personal:', JSON.stringify(await sb(page)));
  await pdrag(page, '.nav-item[data-drag-id="inbox"]', '.group-row[data-drag-id="g2"]', 0.5);
  console.log('inbox into g2      :', JSON.stringify(await sb(page)));
  await pdrag(page, '.group-row[data-drag-id="g2"]', '.group-row[data-drag-id="g1"]', 0.15);
  console.log('g2 above g1        :', JSON.stringify(await sb(page)));
  console.log('LONG PRESS drag    :', await pdrag(page, '.nav-item[data-drag-id="personal"]', '.nav-item[data-drag-id="work"]', 0.85, 1500));
  console.log('after long press   :', JSON.stringify(await sb(page)));

  // click still navigates
  await page.click('.nav-item[data-drag-id="groceries"]');
  await page.waitForTimeout(400);
  console.log('click navigates    :', await page.evaluate(() => {
    const a = document.querySelector('#sidebar .nav-item.active'); return a && a.getAttribute('data-list');
  }));

  // drag must NOT navigate
  const activeBefore = await page.evaluate(() => { const a=document.querySelector('#sidebar .nav-item.active'); return a&&a.getAttribute('data-list'); });
  await pdrag(page, '.nav-item[data-drag-id="work"]', '.nav-item[data-drag-id="inbox"]', 0.15);
  const activeAfter = await page.evaluate(() => { const a=document.querySelector('#sidebar .nav-item.active'); return a&&a.getAttribute('data-list'); });
  console.log('drag does not navigate:', activeBefore === activeAfter, `(${activeBefore})`);

  // group rename input still usable
  await page.fill('.group-title[data-group-title-for="g1"]', 'Umbenannt');
  await page.waitForTimeout(200);
  console.log('group rename works :', await page.evaluate(() => document.querySelector('.group-title[data-group-title-for="g1"]').value));

  // chevron collapse still works
  await page.click('[data-toggle-group="g1"]');
  await page.waitForTimeout(300);
  console.log('chevron collapses  :', await page.evaluate(() => !!document.querySelector('.group-chevron.collapsed')));
  await page.click('[data-toggle-group="g1"]');
  await page.waitForTimeout(300);

  console.log('=== EMBEDS ===');
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
  console.log('start:', JSON.stringify(await emb(page)));
  const grips = await page.$$('[data-col-index="1"] .inline-embed [data-embed-grip]');
  const first = await page.$('[data-col-index="1"] .inline-embed');
  const fb = await first.boundingBox();
  const g3 = await grips[3].boundingBox();
  await page.mouse.move(g3.x+g3.width/2, g3.y+g3.height/2);
  await page.mouse.down();
  await page.mouse.move(g3.x+g3.width/2, g3.y+g3.height/2-8, { steps: 4 });
  await page.mouse.move(g3.x+g3.width/2, fb.y+2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  console.log('embed #3 -> top:', JSON.stringify(await emb(page)));

  // task row click still opens
  await (await page.$('[data-col-index="1"] [data-open-task]')).click();
  await page.waitForTimeout(700);
  console.log('task row opens panel, cols:', await page.evaluate(()=>document.querySelectorAll('.column').length));

  console.log('leftovers:', JSON.stringify(await page.evaluate(() => ({
    ghosts: document.querySelectorAll('.drag-ghost').length,
    inds: document.querySelectorAll('.drop-before,.drop-after,.drop-into').length,
    sorting: document.querySelectorAll('.is-sorting').length,
  }))));
  console.log('PAGE ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})();
