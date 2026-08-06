const { chromium } = require('playwright');
const struct = p => p.evaluate(() => {
  const ed=document.querySelector('[data-col-index="1"] .page-editor');
  return Array.from(ed.children).map(n =>
    n.classList.contains('inline-embed')?'AUFGABE['+n.querySelector('.task-title')?.textContent+']'
    :n.classList.contains('pe-h')?'H("'+n.textContent+'")':'ZEILE("'+n.textContent+'")');
});
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800} });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click(); await page.waitForTimeout(700);

  console.log('Ausgangslage:'); (await struct(page)).forEach(x=>console.log('   ',x));
  const tasksVor = await page.evaluate(()=>document.querySelectorAll('[data-col-index="1"] .inline-embed').length);

  // In die leere Zeile unter der ERSTEN Aufgabe klicken und Backspace
  const box = await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    const emb=ed.querySelectorAll('.inline-embed')[1];       // zweite Aufgabe
    const gap=emb.nextSibling;                                // leere Zeile darunter
    const r=gap.getBoundingClientRect(); return {x:r.x+40,y:r.y+r.height/2};
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(300);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);

  console.log('\nnach Backspace auf der leeren Zeile:');
  (await struct(page)).forEach(x=>console.log('   ',x));
  const tasksNach = await page.evaluate(()=>document.querySelectorAll('[data-col-index="1"] .inline-embed').length);
  console.log('\nAufgaben vorher/nachher:', tasksVor, '->', tasksNach, tasksNach===tasksVor?'OK - keine Aufgabe geloescht':'FEHLER');
  console.log('FEHLER:', errs.length?errs:'keine');
  await b.close();
})();
