const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click(); await page.waitForTimeout(700);

  // === BUG 1: Abstand zwischen Aufgaben ===
  const spacing = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="1"] .page-editor');
    const kids = Array.from(ed.children);
    const out = [];
    for (let i=0;i<kids.length;i++){
      const c=kids[i], r=c.getBoundingClientRect(), cs=getComputedStyle(c);
      out.push({ i, kind: c.classList.contains('inline-embed')?'EMBED':(c.classList.contains('pe-gap')?'LÜCKE':'ABSATZ'),
                 h:+r.height.toFixed(1), mt:cs.marginTop, mb:cs.marginBottom });
    }
    const embeds = ed.querySelectorAll('.inline-embed');
    let gap = null;
    if (embeds.length>1) gap = +(embeds[1].getBoundingClientRect().top - embeds[0].getBoundingClientRect().bottom).toFixed(1);
    return { rows: out, gapBetweenTasks: gap };
  });
  console.log('BUG1 Abstand zwischen zwei Aufgaben:', spacing.gapBetweenTasks + 'px');
  spacing.rows.slice(0,6).forEach(r=>console.log('   ', JSON.stringify(r)));

  // === BUG 3: Caret-Höhe auf neuer Zeile unter einer Aufgabe ===
  await page.evaluate(() => {
    const ed=document.querySelector('[data-col-index="1"] .page-editor');
    const embed=ed.querySelector('.inline-embed');
    // Cursor in die Lücke direkt nach der ersten Aufgabe
    const gap=embed.nextSibling;
    ed.focus();
    const r=document.createRange(); r.selectNodeContents(gap); r.collapse(true);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
  });
  await page.waitForTimeout(350);
  const caret = await page.evaluate(() => {
    const sel=window.getSelection();
    const line=sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement;
    const host=line.closest('.pe-line');
    const r=sel.getRangeAt(0).getBoundingClientRect();
    const cs=getComputedStyle(host);
    return { caretHöhe:+r.height.toFixed(1), zeilenHöhe:+host.getBoundingClientRect().height.toFixed(1),
             hatGap:host.classList.contains('pe-gap'), hatOpen:host.classList.contains('pe-open'),
             cssHeight:cs.height, lineHeight:cs.lineHeight, fontSize:cs.fontSize };
  });
  console.log('\nBUG3 Cursor in leerer Zeile nach Aufgabe:', JSON.stringify(caret));

  // === BUG 2: Backspace auf leerer Zeile löscht Aufgabe darüber ===
  const before = await page.evaluate(()=>document.querySelectorAll('[data-col-index="1"] .inline-embed').length);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  const after = await page.evaluate(()=>document.querySelectorAll('[data-col-index="1"] .inline-embed').length);
  console.log('\nBUG2 Blöcke vor Backspace:', before, '-> nach Backspace:', after, after<before?'<<< AUFGABE GELÖSCHT':'ok');

  console.log('\nFEHLER:', errs.length?errs:'keine');
  await browser.close();
})();
