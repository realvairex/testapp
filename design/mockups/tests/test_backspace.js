const { chromium } = require('playwright');
const struct = p => p.evaluate(() => {
  const ed=document.querySelector('[data-col-index="0"] .page-editor');
  return Array.from(ed.children).map(n =>
    n.classList.contains('inline-embed')?'EMBED':n.classList.contains('pe-divider')?'TRENNER'
    :n.classList.contains('pe-h')?'H("'+n.textContent+'")':'P("'+n.textContent+'")');
});
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800} });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);

  const toEnd = () => page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor');
    ed.focus(); const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });

  // 1. Backspace mitten im Text loescht ein Zeichen
  await toEnd();
  const t0 = await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').firstChild.textContent);
  await page.keyboard.press('Backspace'); await page.waitForTimeout(200);
  const t1 = await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').firstChild.textContent);
  console.log('1) Zeichen loeschen:', t0.length, '->', t1.length, t1.length===t0.length-1?'OK':'FEHLER');

  // 2. Zwei normale Absaetze zusammenfuehren
  await toEnd();
  await page.keyboard.press('Enter'); await page.keyboard.type('ZweiteZeile');
  await page.waitForTimeout(200);
  const vor = (await struct(page)).slice(0,3);
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor');
    const l=ed.children[1]; const r=document.createRange(); r.selectNodeContents(l); r.collapse(true);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Backspace'); await page.waitForTimeout(250);
  const nach = (await struct(page)).slice(0,3);
  console.log('2) Absaetze zusammenfuehren:');
  console.log('   vor: ', JSON.stringify(vor));
  console.log('   nach:', JSON.stringify(nach));
  console.log('   ', nach[0].includes('ZweiteZeile')?'OK - verschmolzen':'FEHLER');

  // 3. Auswahl loeschen bleibt normal
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor');
    const t=ed.firstChild.firstChild; const r=document.createRange(); r.setStart(t,0); r.setEnd(t,5);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  const l0 = await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').firstChild.textContent.length);
  await page.keyboard.press('Backspace'); await page.waitForTimeout(200);
  const l1 = await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').firstChild.textContent.length);
  console.log('3) Auswahl loeschen:', l0, '->', l1, l1===l0-5?'OK':'FEHLER');

  // 4. Backspace vor einem Trenner darf ihn nicht loeschen
  await toEnd();
  await page.keyboard.press('Enter'); await page.keyboard.type('---');
  await page.waitForTimeout(500);
  const dv = await page.evaluate(()=>document.querySelectorAll('[data-col-index="0"] .pe-divider').length);
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor');
    const d=ed.querySelector('.pe-divider'); const after=d.nextSibling;
    ed.focus(); const r=document.createRange(); r.selectNodeContents(after); r.collapse(true);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Backspace'); await page.waitForTimeout(250);
  const dv2 = await page.evaluate(()=>document.querySelectorAll('[data-col-index="0"] .pe-divider').length);
  console.log('4) Trenner geschuetzt:', dv, '->', dv2, dv2===dv?'OK':'FEHLER');

  console.log('\nFEHLER:', errs.length?errs:'keine');
  await b.close();
})();
