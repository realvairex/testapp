const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  const tail = () => page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    let c = 0, n = ed.lastChild;
    while (n && !(n.classList && n.classList.contains('inline-embed')) && n.textContent === '') { c++; n = n.previousSibling; }
    return { trailingBlankLines: c, lastIsEditable: !!(ed.lastChild && !(ed.lastChild.classList && ed.lastChild.classList.contains('inline-embed'))),
             total: ed.childNodes.length };
  });
  const reload = async () => { await page.click('.nav-item[data-list="groceries"]'); await page.waitForTimeout(200);
                               await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(350); };

  console.log('initial:', JSON.stringify(await tail()));
  for (let i=1;i<=3;i++){
    await page.fill('[data-quick-add="0"]', 'T'+i);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
  }
  console.log('after 3 quick-adds:', JSON.stringify(await tail()));
  for (let r=0;r<4;r++) await reload();
  console.log('after 4 reload cycles:', JSON.stringify(await tail()));
  await page.evaluate(()=>{ const ed=document.querySelector('[data-col-index="0"] .page-editor'); ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(false);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.keyboard.press('Enter'); await page.keyboard.type('/');
  await page.waitForTimeout(300);
  await page.click('[data-slash="task"]'); await page.waitForTimeout(700);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  console.log('after toolbar insert:', JSON.stringify(await tail()));
  await reload(); await reload();
  const fin = await tail();
  console.log('after 2 more reloads:', JSON.stringify(fin));
  console.log('>>> exactly one trailing blank line, never accumulating:', fin.trailingBlankLines === 1);
  console.log('>>> editor always ends on an editable paragraph:', fin.lastIsEditable);
  console.log('PAGE ERRORS:', errs.length?errs:'none');
  await browser.close();
})();
