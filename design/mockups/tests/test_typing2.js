const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  // add a task so the editor ends on a non-editable embed
  await page.fill('[data-quick-add="0"]', 'LetzteAufgabe');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);

  const struct = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    return Array.from(ed.childNodes).map(n => n.nodeType===3 ? 'TEXT("'+n.textContent.replace(/\n/g,'\\n').slice(0,25)+'")' : n.nodeName+'.'+(n.className||''));
  });
  console.log('editor children:', JSON.stringify(struct, null, 1));

  // click in the empty space BELOW the last embed
  const lastEmbed = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    const es = ed.querySelectorAll('.inline-embed');
    const r = es[es.length-1].getBoundingClientRect();
    const er = ed.getBoundingClientRect();
    return { embedBottom: r.bottom, edBottom: er.bottom, edLeft: er.left, edWidth: er.width };
  });
  console.log('last embed bottom:', lastEmbed.embedBottom.toFixed(0), 'editor bottom:', lastEmbed.edBottom.toFixed(0),
              '| empty space below:', (lastEmbed.edBottom - lastEmbed.embedBottom).toFixed(0) + 'px');

  await page.mouse.click(lastEmbed.edLeft + lastEmbed.edWidth/2, lastEmbed.embedBottom + 20);
  await page.waitForTimeout(200);
  const where = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    const sel = window.getSelection();
    if (!sel.rangeCount) return { none: true };
    const a = sel.anchorNode;
    // index of the top-level child containing the caret
    let top = a; while (top && top.parentNode !== ed) top = top.parentNode;
    const idx = top ? Array.from(ed.childNodes).indexOf(top) : -1;
    return { anchorType: a.nodeType===3?'TEXT':a.nodeName, topLevelIndex: idx, totalChildren: ed.childNodes.length,
             caretIsAfterLastEmbed: idx === ed.childNodes.length-1 && (top.nodeType===3) };
  });
  console.log('caret after clicking below last embed:', JSON.stringify(where));

  await page.keyboard.type('ZZZ');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    const kids = Array.from(ed.childNodes).map(n => n.nodeType===3 ? 'TEXT("'+n.textContent.replace(/\n/g,'\\n').slice(0,30)+'")' : n.nodeName+'.'+(n.className||''));
    const t = ed.textContent;
    return { kids, zzzIndex: t.indexOf('ZZZ'), textLen: t.length, atEnd: t.trim().endsWith('ZZZ') };
  });
  console.log('after typing ZZZ:', JSON.stringify(after, null, 1));
  console.log('>>> text landed at the END (as intended):', after.atEnd);
  await browser.close();
})();
