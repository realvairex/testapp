const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800} });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click(); await page.waitForTimeout(700);

  // 1. Auf die Grenze zwischen zwei Aufgaben klicken
  const boundary = await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    const es=ed.querySelectorAll('.inline-embed');
    const r1=es[1].getBoundingClientRect();
    return { x:r1.x+60, y:r1.bottom };   // exakt auf die Kante
  });
  await page.mouse.click(boundary.x, boundary.y);
  await page.waitForTimeout(300);
  const st = await page.evaluate(()=>{
    const sel=window.getSelection();
    if(!sel.rangeCount) return {kein:true};
    let n=sel.anchorNode; if(n.nodeType!==1) n=n.parentElement;
    const host=n.closest('.pe-line');
    return host ? { höhe:+host.getBoundingClientRect().height.toFixed(1),
                    gap:host.classList.contains('pe-gap'), open:host.classList.contains('pe-open') } : {kein:true};
  });
  console.log('1) Klick auf Aufgaben-Grenze -> Cursor in Zeile:', JSON.stringify(st));
  console.log('   Cursorhöhe = Texthöhe (22.3):', st.höhe===22.3 ? 'JA' : 'NEIN');

  // 2. Dort tippen
  await page.keyboard.type('Zwischentext');
  await page.waitForTimeout(300);
  const nach = await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    return Array.from(ed.children).map(n=>n.classList.contains('inline-embed')?'AUFGABE':'ZEILE("'+n.textContent+'")');
  });
  console.log('\n2) nach Tippen:'); nach.forEach(x=>console.log('   ',x));

  // 3. Leere Lücke über der ersten Aufgabe ist unsichtbar (0px), aber klickbar
  const first = await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    const gaps=Array.from(ed.querySelectorAll('.pe-gap:not(.pe-open)'));
    return gaps.length ? +gaps[0].getBoundingClientRect().height.toFixed(1) : null;
  });
  console.log('\n3) Höhe einer geschlossenen Lücke:', first, 'px (soll 0)');
  console.log('\nFEHLER:', errs.length?errs:'keine');
  await b.close();
})();
