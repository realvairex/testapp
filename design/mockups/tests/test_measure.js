const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  const r = el => el ? (({x,y,width,height}) => ({x:Math.round(x*10)/10,y:Math.round(y*10)/10,w:Math.round(width*10)/10,h:Math.round(height*10)/10}))(el.getBoundingClientRect()) : null;

  // --- delete button position: hover row vs hover button ---
  const listWrap = await page.$('.nav-item-wrap');
  const navItem = await page.$('.nav-item-wrap .nav-item');
  await navItem.hover();
  await page.waitForTimeout(250);
  const posHoverTitle = await page.evaluate(() => {
    const b = document.querySelector('.nav-item-wrap .nav-delete').getBoundingClientRect();
    const c = document.querySelector('.nav-item-wrap .nav-count').getBoundingClientRect();
    return { del: {x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1)},
             count: {x:+c.x.toFixed(1), y:+c.y.toFixed(1), w:+c.width.toFixed(1)} };
  });
  const delBtn = await page.$('.nav-item-wrap .nav-delete');
  await delBtn.hover();
  await page.waitForTimeout(250);
  const posHoverBtn = await page.evaluate(() => {
    const b = document.querySelector('.nav-item-wrap .nav-delete').getBoundingClientRect();
    const c = document.querySelector('.nav-item-wrap .nav-count').getBoundingClientRect();
    return { del: {x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1)},
             count: {x:+c.x.toFixed(1), y:+c.y.toFixed(1), w:+c.width.toFixed(1)} };
  });
  console.log('LIST hover title :', JSON.stringify(posHoverTitle));
  console.log('LIST hover button:', JSON.stringify(posHoverBtn));

  // --- group row ---
  const groupRow = await page.$('.group-row');
  await groupRow.hover();
  await page.waitForTimeout(250);
  const gTitle = await page.evaluate(() => {
    const b = document.querySelector('.group-row .nav-delete').getBoundingClientRect();
    const c = document.querySelector('.group-row .nav-count').getBoundingClientRect();
    return { del:{x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}, count:{x:+c.x.toFixed(1),w:+c.width.toFixed(1)} };
  });
  const gDel = await page.$('.group-row .nav-delete');
  await gDel.hover();
  await page.waitForTimeout(250);
  const gBtn = await page.evaluate(() => {
    const b = document.querySelector('.group-row .nav-delete').getBoundingClientRect();
    const c = document.querySelector('.group-row .nav-count').getBoundingClientRect();
    return { del:{x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}, count:{x:+c.x.toFixed(1),w:+c.width.toFixed(1)} };
  });
  console.log('GROUP hover title :', JSON.stringify(gTitle));
  console.log('GROUP hover button:', JSON.stringify(gBtn));

  // --- sizes of all icon buttons for comparison ---
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  await (await page.$('[data-col-index="0"] [data-open-task]')).click();
  await page.waitForTimeout(600);
  const sizes = await page.evaluate(() => {
    const g = s => { const e = document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const sv=e.querySelector('svg'); const sr=sv&&sv.getBoundingClientRect(); return { box:+r.width.toFixed(1)+'x'+ +r.height.toFixed(1), svg: sr? (+sr.width.toFixed(1)+'x'+ +sr.height.toFixed(1)):'-' }; };
    return {
      'nav-delete (sidebar)': g('.nav-delete'),
      'row-delete (task)':    g('.row-delete'),
      'col-close (panel X)':  g('.col-close'),
      'group-chevron':        g('.group-chevron'),
      'check-btn':            g('.check-btn'),
      'icon-action-btn':      g('.icon-action-btn'),
      'icon-action primary':  g('.icon-action-btn.primary'),
      'nav-icon (svg only)':  g('.nav-item .nav-icon') ,
      'embed-grip':           g('[data-embed-grip]'),
    };
  });
  console.log('SIZES:'); Object.entries(sizes).forEach(([k,v]) => console.log('  ', k.padEnd(24), JSON.stringify(v)));
  await browser.close();
})();
