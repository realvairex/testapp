const { chromium } = require('playwright');
const struct = p => p.evaluate(() => {
  const ed = document.querySelector('[data-col-index="0"] .page-editor');
  return Array.from(ed.children).map(n =>
    n.classList.contains('inline-embed') ? 'EMBED['+n.getAttribute('data-embed-marker')+']'
    : n.classList.contains('pe-divider') ? 'TRENNER'
    : n.classList.contains('pe-h') ? 'ÜBERSCHRIFT("'+n.textContent+'")'
    : 'ABSATZ("'+n.textContent+'")');
});
async function caretToEndOfFirstLine(page){
  await page.evaluate(()=>{
    const ed=document.querySelector('[data-col-index="0"] .page-editor');
    ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
  });
}
(async () => {
  const browser = await chromium.launch();
  const errs=[];

  // --- 1. "/"-Menü ---
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('slash: '+e.message));
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
    await caretToEndOfFirstLine(page);
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');
    await page.waitForTimeout(350);
    const menu = await page.evaluate(()=>{
      const m=document.querySelector('.slash-menu');
      return m ? Array.from(m.querySelectorAll('.slash-opt')).map(o=>o.textContent.trim()) : null;
    });
    console.log('1) "/"-Menü Optionen:', JSON.stringify(menu));
    // Überschrift wählen
    await page.click('[data-slash="heading"]');
    await page.waitForTimeout(300);
    await page.keyboard.type('Meine Überschrift');
    await page.waitForTimeout(250);
    console.log('   nach Auswahl "Überschrift":');
    (await struct(page)).slice(0,4).forEach(x=>console.log('     ',x));
    await page.close();
  }

  // --- 2. Markdown-Kürzel ---
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('md: '+e.message));
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);

    await caretToEndOfFirstLine(page);
    await page.keyboard.press('Enter'); await page.keyboard.type('# ');
    await page.waitForTimeout(300); await page.keyboard.type('Via Kürzel');
    await page.waitForTimeout(250);
    console.log('\n2) nach "# ":');
    (await struct(page)).slice(0,3).forEach(x=>console.log('     ',x));

    await page.keyboard.press('Enter'); await page.keyboard.type('---');
    await page.waitForTimeout(500);
    console.log('   nach "---":');
    (await struct(page)).slice(0,5).forEach(x=>console.log('     ',x));
    await page.close();
  }

  // --- 3. Auswahl-Leiste ---
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('sel: '+e.message));
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
    console.log('\n3) Auswahl-Leiste');
    console.log('   vor Auswahl vorhanden:', await page.evaluate(()=>!!document.querySelector('.sel-bar')));
    await page.evaluate(()=>{
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      const t=ed.firstChild.firstChild;
      const r=document.createRange(); r.setStart(t,0); r.setEnd(t,5);
      const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
      document.dispatchEvent(new Event('selectionchange'));
    });
    await page.waitForTimeout(350);
    console.log('   nach Auswahl vorhanden:', await page.evaluate(()=>!!document.querySelector('.sel-bar')));
    console.log('   Schaltflächen:', await page.evaluate(()=>Array.from(document.querySelectorAll('.sel-bar .sel-btn')).map(b=>b.textContent)));
    await page.click('.sel-bar [data-fmt="bold"]');
    await page.waitForTimeout(300);
    console.log('   fett angewandt:', await page.evaluate(()=>!!document.querySelector('[data-col-index="0"] .page-editor b, [data-col-index="0"] .page-editor strong')));
    await page.close();
  }

  // --- 4. "+ Aufgabe" ist weg, "+ Bild" bleibt ---
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
    console.log('\n4) Untere Leiste:', await page.evaluate(()=>Array.from(document.querySelectorAll('[data-col-index="0"] .editor-toolbar .insert-btn')).map(b=>b.textContent.trim())));
    await page.close();
  }
  console.log('\nFEHLER:', errs.length?errs:'keine');
  await browser.close();
})();
