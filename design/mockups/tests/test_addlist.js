const { chromium } = require('playwright');
const sb = p => p.evaluate(() => Array.from(document.querySelectorAll('#sidebar [data-drag-id]'))
  .map(e => (e.getAttribute('data-drag-type')==='group'?'GRUPPE:':'  liste:') + e.getAttribute('data-drag-id')));
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800} });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  console.log('vorher:'); (await sb(page)).forEach(x=>console.log('  ',x));

  // 1. Liste in Gruppe g2 (ARBEIT) anlegen
  await (await page.$('.group-row[data-drag-id="g2"]')).hover();
  await page.waitForTimeout(250);
  await page.click('[data-add-list-to="g2"]');
  await page.waitForTimeout(500);
  console.log('\nnach "+" auf ARBEIT:'); (await sb(page)).forEach(x=>console.log('  ',x));
  const inGroup = await page.evaluate(()=>{
    const rows=Array.from(document.querySelectorAll('#sidebar [data-drag-id]'));
    const gi=rows.findIndex(r=>r.getAttribute('data-drag-id')==='g2');
    // alle Listen nach g2 bis zur naechsten Gruppe
    const after=[]; for(let i=gi+1;i<rows.length;i++){ if(rows[i].getAttribute('data-drag-type')==='group') break; after.push(rows[i].getAttribute('data-drag-id')); }
    return after;
  });
  console.log('  Listen in ARBEIT:', JSON.stringify(inGroup));
  console.log('  neue Liste ist aktiv:', await page.evaluate(()=>{const a=document.querySelector('#sidebar .nav-item.active'); return a&&a.getAttribute('data-list');}));

  // 2. Bei eingeklappter Gruppe -> muss aufklappen
  await page.click('[data-toggle-group="g1"]'); await page.waitForTimeout(300);
  const collapsed1 = await page.evaluate(()=>!!document.querySelector('[data-toggle-group="g1"].collapsed'));
  await (await page.$('.group-row[data-drag-id="g1"]')).hover(); await page.waitForTimeout(200);
  await page.click('[data-add-list-to="g1"]'); await page.waitForTimeout(500);
  const collapsed2 = await page.evaluate(()=>!!document.querySelector('[data-toggle-group="g1"].collapsed'));
  console.log('\n2) Gruppe war eingeklappt:', collapsed1, '-> nach Hinzufügen eingeklappt:', collapsed2, collapsed2===false?'OK (aufgeklappt)':'FEHLER');

  // 3. Löschen der Gruppe geht weiterhin
  const gBefore = await page.evaluate(()=>document.querySelectorAll('.group-row').length);
  await (await page.$('.group-row[data-drag-id="g1"]')).hover(); await page.waitForTimeout(200);
  await page.click('[data-delete-group="g1"]'); await page.waitForTimeout(600);
  const gAfter = await page.evaluate(()=>document.querySelectorAll('.group-row').length);
  console.log('3) Gruppen vorher/nachher:', gBefore, '->', gAfter, gAfter===gBefore-1?'OK':'FEHLER');

  console.log('\nFEHLER:', errs.length?errs:'keine');
  await b.close();
})();
