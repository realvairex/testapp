const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  const out = await page.evaluate(() => {
    const sb = document.getElementById('sidebar').getBoundingClientRect();
    const info = {};
    const today = document.querySelector('.nav-item[data-nav="today"] .nav-count');
    const tr = today.getBoundingClientRect();
    info.TODAY = { rightFromSidebarRight: +(sb.right - tr.right).toFixed(1), w: +tr.width.toFixed(1), center: +(tr.x+tr.width/2).toFixed(1) };
    const lc = document.querySelector('.nav-item-wrap .nav-count').getBoundingClientRect();
    info.LIST_count = { rightFromSidebarRight: +(sb.right - lc.right).toFixed(1), w: +lc.width.toFixed(1), center: +(lc.x+lc.width/2).toFixed(1) };
    const ld = document.querySelector('.nav-item-wrap .nav-delete').getBoundingClientRect();
    info.LIST_delete = { rightFromSidebarRight: +(sb.right - ld.right).toFixed(1), w: +ld.width.toFixed(1), center: +(ld.x+ld.width/2).toFixed(1) };
    const gc = document.querySelector('.group-row .nav-count').getBoundingClientRect();
    info.GROUP_count = { rightFromSidebarRight: +(sb.right - gc.right).toFixed(1), w: +gc.width.toFixed(1), center: +(gc.x+gc.width/2).toFixed(1) };
    const gd = document.querySelector('.group-row .nav-delete').getBoundingClientRect();
    info.GROUP_delete = { rightFromSidebarRight: +(sb.right - gd.right).toFixed(1), w: +gd.width.toFixed(1), center: +(gd.x+gd.width/2).toFixed(1) };
    return info;
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
