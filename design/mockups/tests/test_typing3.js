const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  const blocks = () => page.evaluate(() => {
    // read the model, not the DOM
    const el = document.querySelector('[data-col-index="0"] .page-editor');
    el.blur();
    return null;
  });

  // 1. add task, blur (serialize), re-render, check no stray empty text block accumulates
  for (let i=1;i<=3;i++){
    await page.fill('[data-quick-add="0"]', 'Task'+i);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  }
  await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').blur());
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="groceries"]'); await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);

  const s1 = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    return { children: Array.from(ed.childNodes).map(n=>n.nodeType===3?'TEXT("'+n.textContent.replace(/\n/g,'\\n')+'")':n.nodeName+'.'+n.className),
             // Seit dem Umbau auf das Blockmodell endet der Editor auf einer
             // .pe-line, nicht mehr auf einem nackten Textknoten - deshalb
             // wird hier nach leeren Zeilen-Bloecken gezaehlt.
             trailingCount: (() => { let c=0,n=ed.lastChild;
               while(n&&n.nodeType===1&&n.classList.contains('pe-line')&&!n.textContent.trim()){c++;n=n.previousSibling;}
               return c; })() };
  });
  console.log('after 3 adds + reload:', JSON.stringify(s1, null, 1));
  console.log('>>> exactly ONE trailing blank line (no accumulation):', s1.trailingCount === 1);

  // 2. type at the end, blur, reload -> text must persist
  const ed = await page.$('[data-col-index="0"] .page-editor');
  const eb = await ed.boundingBox();
  await page.mouse.click(eb.x + eb.width/2, eb.y + eb.height - 30);
  await page.keyboard.type('EndText');
  await page.waitForTimeout(200);
  await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').blur());
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="groceries"]'); await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
  const persisted = await page.evaluate(()=>document.querySelector('[data-col-index="0"] .page-editor').textContent.includes('EndText'));
  console.log('>>> text typed at end persists after re-render:', persisted);

  // 3. clicking ON existing text still works normally (not hijacked to end)
  await page.mouse.click(eb.x + 60, eb.y + 8);
  await page.keyboard.type('MID');
  await page.waitForTimeout(200);
  const midPos = await page.evaluate(()=>{ const t=document.querySelector('[data-col-index="0"] .page-editor').textContent; return { idx:t.indexOf('MID'), atEnd:t.trim().endsWith('MID') }; });
  console.log('>>> click on text line inserts there, not at end:', midPos.idx >= 0 && !midPos.atEnd, JSON.stringify(midPos));

  // Schritt 4 (Aufgabe ueber die untere Leiste einfuegen) ist entfallen:
  // der "+ Aufgabe"-Knopf wurde bewusst entfernt, weil das Eingabefeld
  // dieselbe Aufgabe erfuellt. Siehe docs/decisions.md.

  console.log('PAGE ERRORS:', errs.length?errs:'none');
  await browser.close();
})();
