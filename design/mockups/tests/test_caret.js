const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click(); await page.waitForTimeout(700);

  const lineInfo = (label) => page.evaluate((lbl) => {
    const sel=window.getSelection();
    if(!sel.rangeCount) return {lbl, none:true};
    let n=sel.anchorNode; if(n.nodeType!==1) n=n.parentElement;
    const host=n.closest('.pe-line, .inline-embed');
    if(!host) return {lbl, host:'?'};
    const r=host.getBoundingClientRect();
    return { lbl, höhe:+r.height.toFixed(1), gap:host.classList.contains('pe-gap'),
             open:host.classList.contains('pe-open'), text:JSON.stringify(host.textContent) };
  }, label);

  // Weg A: in die dünne Lücke unter einer Aufgabe KLICKEN
  const gapBox = await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    const g=ed.querySelector('.pe-gap');
    const r=g.getBoundingClientRect();
    return {x:r.x+40, y:r.y+r.height/2};
  });
  await page.mouse.click(gapBox.x, gapBox.y);
  await page.waitForTimeout(300);
  console.log('A) nach Klick in die Lücke:', JSON.stringify(await lineInfo('klick')));

  // Weg B: dort ENTER druecken -> neue Zeile
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  console.log('B) nach Enter (neue Zeile):', JSON.stringify(await lineInfo('enter')));
  await page.keyboard.type('X');
  await page.waitForTimeout(250);
  console.log('C) nach Tippen von "X":  ', JSON.stringify(await lineInfo('tippen')));
  await browser.close();
})();
