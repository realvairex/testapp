// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800}, deviceScaleFactor:2 });
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // === A) Lange Titel in SCHMALER Spalte (3 Spalten offen) ===
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(300);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click(); await page.waitForTimeout(500);
  await (await page.$('[data-col-index="1"] [data-open-task]')).click(); await page.waitForTimeout(700);
  await page.fill('[data-quick-add="2"]','Ein wirklich sehr langer Aufgabentitel der in einer schmalen Spalte Probleme machen wird');
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  const narrow = await page.evaluate(()=>{
    const col=document.querySelector('[data-col-index="2"]');
    const t=[...col.querySelectorAll('.task-title')].pop();
    const row=t.closest('.task-row');
    return { spaltenbreite:+col.getBoundingClientRect().width.toFixed(0),
             titelUeberlaeuft: t.scrollWidth>t.clientWidth+1,
             zeileUeberlaeuft: row.scrollWidth>row.clientWidth+1,
             zeilenhoehe:+row.getBoundingClientRect().height.toFixed(0),
             umbricht: row.getBoundingClientRect().height>34 };
  });
  console.log('=== A) Langer Titel in schmaler Spalte ===');
  Object.entries(narrow).forEach(([k,v])=>console.log('  '+k.padEnd(20)+v));
  await page.screenshot({path:OUT+'narrow.png',clip:{x:82,y:130,width:1100,height:340}});

  // === B) Tastatur-Reihenfolge ===
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  await page.evaluate(()=>document.body.focus());
  const order=[];
  for (let i=0;i<14;i++){
    await page.keyboard.press('Tab');
    const d = await page.evaluate(()=>{
      const a=document.activeElement; if(!a) return null;
      const r=a.getBoundingClientRect();
      return { tag:a.tagName, cls:(a.className||'').toString().slice(0,26),
               txt:(a.textContent||a.value||'').trim().slice(0,20),
               x:Math.round(r.x), y:Math.round(r.y),
               ring:getComputedStyle(a).outlineWidth };
    });
    order.push(d);
  }
  console.log('\n=== B) Tab-Reihenfolge (erste 14) ===');
  order.forEach((d,i)=>console.log('  '+String(i+1).padStart(2)+'. '+String(d.tag+' .'+d.cls).padEnd(34)+('('+d.x+','+d.y+')').padEnd(12)+'"'+d.txt+'"  Ring '+d.ring));
  await b.close();
})();
