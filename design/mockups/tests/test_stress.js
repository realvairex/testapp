// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800}, deviceScaleFactor:2 });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // Sehr langer Listenname + sehr lange Gruppe + viele Aufgaben
  await page.evaluate(() => {
    const L = window;   // Zugriff ueber die Oberflaeche, nicht ueber interne Variablen
  });
  await page.click('.nav-item[data-drag-id="personal"]'); await page.waitForTimeout(300);
  // Liste umbenennen ueber den Titel
  await page.evaluate(()=>{
    const t=document.querySelector('[data-col-index="0"] .col-title');
    if(t && t.tagName==='INPUT'){ t.value='Sehr langer Listenname der garantiert nicht in die Sidebar passt'; t.dispatchEvent(new Event('input',{bubbles:true})); }
  });
  // Gruppe umbenennen
  await page.evaluate(()=>{
    const g=document.querySelector('.group-title'); if(g){ g.value='Eine ausgesprochen lange Gruppenbezeichnung'; g.dispatchEvent(new Event('input',{bubbles:true})); }
  });
  // 40 Aufgaben ueber die Schnellerfassung
  for (let i=1;i<=40;i++){
    await page.fill('[data-quick-add="0"]', 'Aufgabe Nummer '+i+' mit einem ziemlich langen Titel der umbrechen koennte');
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(800);

  const r = await page.evaluate(()=>{
    const sb=document.getElementById('sidebar');
    const ca=document.getElementById('contentArea');
    const blocks=document.querySelector('[data-col-index="0"] .blocks');
    const wrap=document.querySelector('#appWindow');
    const names=[...document.querySelectorAll('#sidebar .nav-name')].map(n=>({
      text:n.textContent.slice(0,20), ueberlaeuft: n.scrollWidth>n.clientWidth+1 }));
    return {
      sidebarScrollt: sb.scrollHeight>sb.clientHeight,
      sidebarUeberlauf: sb.scrollWidth>sb.clientWidth,
      blocksScrollt: blocks.scrollHeight>blocks.clientHeight,
      fensterUeberlauf: wrap.scrollWidth>wrap.clientWidth,
      seiteUeberlauf: document.body.scrollWidth>window.innerWidth,
      namenAbgeschnitten: names.filter(n=>n.ueberlaeuft).length,
      aufgabenGerendert: document.querySelectorAll('[data-col-index="0"] .inline-embed').length,
    };
  });
  console.log('=== BELASTUNGSTEST: 40 Aufgaben, lange Namen ===');
  Object.entries(r).forEach(([k,v])=>console.log('  '+k.padEnd(22)+v));
  await page.screenshot({path:OUT+'stress.png'});
  console.log('FEHLER:', errs.length?errs.slice(0,3):'keine');
  await b.close();
})();
