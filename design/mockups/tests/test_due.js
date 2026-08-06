// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // 1. Heute-Seite: überfällige oben, dann heute
  await page.click('.nav-item[data-nav="today"]');
  await page.waitForTimeout(400);
  const today = await page.evaluate(() => {
    const col = document.querySelector('[data-col-key="today"]');
    return Array.from(col.querySelectorAll('.group-heading, .task-row')).map(e =>
      e.classList.contains('group-heading') ? 'ÜBERSCHRIFT: '+e.textContent.trim()
      : '   Aufgabe: '+e.querySelector('.task-title').textContent+' ['+(e.querySelector('.due-pill')?.textContent||'kein Datum')+']');
  });
  console.log('=== HEUTE-SEITE ===');
  today.forEach(t=>console.log(' ',t));
  console.log('Sidebar-Zähler Heute:', await page.evaluate(()=>document.querySelector('[data-nav="today"] .nav-count').textContent));

  // 2. Datum setzen an einer Aufgabe ohne Datum
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
  const openable = await page.$$('[data-col-index="1"] [data-open-task]');
  await openable[1].click();   // "Unterkunft aussuchen" - kein Datum
  await page.waitForTimeout(700);
  console.log('\n=== DATUM SETZEN ===');
  console.log('Steuerung sichtbar:', await page.evaluate(()=>document.querySelector('[data-col-index="2"] .due-add')?.textContent.trim()));
  await page.click('[data-col-index="2"] [data-due-menu]');
  await page.waitForTimeout(300);
  console.log('Menü-Optionen:', await page.evaluate(()=>Array.from(document.querySelectorAll('.due-menu .due-opt')).map(o=>o.textContent.trim())));
  await page.click('.due-menu [data-due-value="2026-08-05"]');   // Heute
  await page.waitForTimeout(500);
  console.log('nach "Heute":', await page.evaluate(()=>document.querySelector('[data-col-index="2"] .due-pill')?.textContent.trim()));

  // 3. taucht sie jetzt in Heute auf?
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  await page.click('.nav-item[data-nav="today"]');
  await page.waitForTimeout(400);
  console.log('in Heute enthalten:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('[data-col-key="today"] .task-title')).some(t=>t.textContent.includes('Unterkunft'))));

  // 4. Datum wieder entfernen
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(500);
  const o2 = await page.$$('[data-col-index="1"] [data-open-task]');
  await o2[1].click();
  await page.waitForTimeout(600);
  await page.click('[data-col-index="2"] [data-due-menu]');
  await page.waitForTimeout(250);
  await page.click('.due-menu .due-clear');
  await page.waitForTimeout(500);
  console.log('nach Entfernen wieder Einladung:', await page.evaluate(()=>!!document.querySelector('[data-col-index="2"] .due-add')));

  // 5. erledigte überfällige Aufgabe darf NICHT mehr als überfällig gelten
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  await page.click('.nav-item[data-nav="today"]');
  await page.waitForTimeout(400);
  const before5 = await page.evaluate(()=>document.querySelector('[data-nav="today"] .nav-count').textContent);
  await page.evaluate(()=>{
    const rows=Array.from(document.querySelectorAll('[data-col-key="today"] .task-row'));
    const r=rows.find(x=>x.querySelector('.task-title').textContent.includes('Rauchmelder'));
    r.querySelector('.check-btn').click();
  });
  await page.waitForTimeout(500);
  const after5 = await page.evaluate(()=>document.querySelector('[data-nav="today"] .nav-count').textContent);
  const stillListed = await page.evaluate(()=>Array.from(document.querySelectorAll('[data-col-key="today"] .task-title')).some(t=>t.textContent.includes('Rauchmelder')));
  console.log('\n=== ERLEDIGT + ÜBERFÄLLIG ===');
  console.log('Zähler vorher/nachher:', before5, '->', after5);
  console.log('noch als überfällig gelistet:', stillListed, '(erwartet: false)');

  console.log('\nPAGE ERRORS:', errs.length?errs:'none');
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT+'due.png' });
  await browser.close();
})();
