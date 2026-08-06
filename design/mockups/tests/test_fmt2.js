// Screenshots landen in design/mockups/tests/out/ (nicht im Git, siehe .gitignore).
const OUT = require('path').join(__dirname, 'out') + require('path').sep;
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
const struct = p => p.evaluate(() => {
  const ed = document.querySelector('[data-col-index="0"] .page-editor');
  return Array.from(ed.children).map(n =>
    n.classList.contains('inline-embed') ? 'EMBED['+n.getAttribute('data-embed-marker')+']'
    : n.classList.contains('pe-divider') ? 'TRENNER'
    : n.classList.contains('pe-h') ? 'ÜBERSCHRIFT("'+n.textContent+'")'
    : 'ABSATZ("'+n.textContent+'")');
});
const reload = async p => { await p.click('.nav-item[data-list="groceries"]'); await p.waitForTimeout(250);
                            await p.click('.nav-item[data-list="personal"]'); await p.waitForTimeout(400); };
(async () => {
  const browser = await chromium.launch();
  const errs=[];
  const page = await browser.newPage({ viewport:{width:1200,height:800} });
  page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);

  // Überschrift + Trenner anlegen, dann Neuaufbau -> müssen erhalten bleiben
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor'); ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Enter'); await page.keyboard.type('# ');
  await page.waitForTimeout(300); await page.keyboard.type('Abschnitt A');
  await page.keyboard.press('Enter'); await page.keyboard.type('---');
  await page.waitForTimeout(500);
  console.log('vor Neuaufbau:'); (await struct(page)).forEach(x=>console.log('   ',x));
  await reload(page);
  console.log('nach Neuaufbau (müssen erhalten sein):'); (await struct(page)).forEach(x=>console.log('   ',x));

  // "/" -> Aufgabe
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor'); ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Enter'); await page.keyboard.type('/');
  await page.waitForTimeout(300);
  await page.click('[data-slash="task"]');
  await page.waitForTimeout(700);
  console.log('\n"/" -> Aufgabe: Spalten offen =', await page.evaluate(()=>document.querySelectorAll('.column').length));
  console.log('  Titel der neuen Spalte:', await page.evaluate(()=>{const t=document.querySelector('[data-col-index="1"] .col-title'); return t&&t.value;}));

  // Menü schließt bei Klick daneben
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor'); ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Enter'); await page.keyboard.type('/');
  await page.waitForTimeout(300);
  const open1 = await page.evaluate(()=>!!document.querySelector('.slash-menu'));
  await page.mouse.click(1100, 700);
  await page.waitForTimeout(300);
  const open2 = await page.evaluate(()=>!!document.querySelector('.slash-menu'));
  console.log('\nMenü offen nach "/":', open1, '| nach Klick daneben:', open2);

  console.log('\nFEHLER:', errs.length?errs:'keine');
  await page.screenshot({ path:OUT+'fmt.png' });
  await browser.close();
})();
