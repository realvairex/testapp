const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  const dump = async (label) => {
    const d = await page.evaluate(() => {
      const ed = document.querySelector('[data-col-index="0"] .page-editor');
      return {
        text: ed.textContent.trim().slice(0,80),
        lastChildType: ed.lastChild ? (ed.lastChild.nodeType===3 ? 'TEXT("'+ed.lastChild.textContent.replace(/\n/g,'\\n')+'")' : ed.lastChild.nodeName + '.' + (ed.lastChild.className||'')) : 'NONE',
        childCount: ed.childNodes.length,
      };
    });
    console.log(label, JSON.stringify(d));
  };

  await dump('BEFORE add:');

  // type into editor before adding a task -> baseline
  const ed = await page.$('[data-col-index="0"] .page-editor');
  await ed.click({ position: { x: 100, y: 8 } });
  await page.keyboard.type('AAA');
  await page.waitForTimeout(200);
  console.log('baseline typing works:', await page.evaluate(() => document.querySelector('[data-col-index="0"] .page-editor').textContent.includes('AAA')));

  // now add a task via quick-add
  await page.fill('[data-quick-add="0"]', 'NeueAufgabeX');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await dump('AFTER quick-add:');

  // try to click into the editor's empty area below the content and type
  const box = await (await page.$('[data-col-index="0"] .page-editor')).boundingBox();
  await page.mouse.click(box.x + box.width/2, box.y + box.height - 20);
  await page.waitForTimeout(200);
  const focusInfo = await page.evaluate(() => {
    const ed = document.querySelector('[data-col-index="0"] .page-editor');
    const sel = window.getSelection();
    return {
      activeIsEditor: document.activeElement === ed,
      activeEl: document.activeElement ? document.activeElement.className || document.activeElement.tagName : null,
      rangeCount: sel.rangeCount,
      anchorInEditor: sel.rangeCount ? ed.contains(sel.anchorNode) : false,
      anchorNode: sel.rangeCount ? (sel.anchorNode.nodeType===3?'TEXT':sel.anchorNode.nodeName) : null,
    };
  });
  console.log('after clicking empty area:', JSON.stringify(focusInfo));
  await page.keyboard.type('BBB');
  await page.waitForTimeout(300);
  const typed = await page.evaluate(() => document.querySelector('[data-col-index="0"] .page-editor').textContent.includes('BBB'));
  console.log('>>> typing after adding a task WORKS:', typed);

  // also try clicking directly on existing text
  await page.mouse.click(box.x + 60, box.y + 8);
  await page.waitForTimeout(150);
  await page.keyboard.type('CCC');
  await page.waitForTimeout(300);
  console.log('>>> typing on existing text line WORKS:', await page.evaluate(() => document.querySelector('[data-col-index="0"] .page-editor').textContent.includes('CCC')));

  console.log('PAGE ERRORS:', errs.length?errs:'none');
  await browser.close();
})();
