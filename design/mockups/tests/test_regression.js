const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(300);

  // 1. checkbox cascade
  await page.click('[data-col-index="0"] .check-btn');
  await page.waitForTimeout(300);
  console.log('1 checkbox toggled:', await page.evaluate(() => !!document.querySelector('.check-btn.done')));

  // 2. open task page
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
  console.log('2 opened panel, cols:', await page.evaluate(() => document.querySelectorAll('.column').length));

  // 3. typing into the editor
  const ed = await page.$('[data-col-index="1"] .page-editor');
  await ed.click({ position: { x: 60, y: 8 } });
  await page.keyboard.type('HALLO');
  await page.waitForTimeout(200);
  console.log('3 typed text present:', await page.evaluate(() => document.querySelector('[data-col-index="1"] .page-editor').textContent.includes('HALLO')));

  // 4. insert task via the "/" menu (the +Aufgabe button was removed).
  // "/" only triggers on an otherwise empty line, so go to the end first.
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/');
  await page.waitForTimeout(300);
  await page.click('[data-slash="task"]');
  await page.waitForTimeout(700);
  console.log('4 embeds after insert:', await page.evaluate(() => document.querySelectorAll('[data-col-index="1"] .inline-embed').length));

  // 5. quick-add
  await page.fill('[data-quick-add="1"]', 'Testaufgabe');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  console.log('5 quick-add worked:', await page.evaluate(() => document.querySelector('[data-col-index="1"] .page-editor').textContent.includes('Testaufgabe')));

  // 6. delete an embed
  const before = await page.evaluate(() => document.querySelectorAll('[data-col-index="1"] .inline-embed').length);
  await page.evaluate(() => { const b = document.querySelector('[data-col-index="1"] .inline-embed .row-delete'); if (b) b.click(); });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => document.querySelectorAll('[data-col-index="1"] .inline-embed').length);
  console.log('6 delete embed:', before, '->', after);

  // 7. escape closes panels
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  console.log('7 cols after Escape:', await page.evaluate(() => document.querySelectorAll('.column').length));

  // 8. today view
  await page.click('.nav-item[data-nav="today"]');
  await page.waitForTimeout(400);
  console.log('8 today view rendered:', await page.evaluate(() => !!document.querySelector('[data-col-key="today"]')));

  console.log('PAGE ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})();
