const { chromium } = require('playwright');
const O=process.cwd()+'/design/mockups/tests/out/';
(async()=>{
  const b=await chromium.launch();
  for (const m of ['dark','light']) {
    const page=await b.newPage({viewport:{width:1240,height:700},deviceScaleFactor:3});
    await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    if(m==='light'){await page.click('[data-set-theme="light"]');await page.waitForTimeout(400);}
    const bb=await page.locator('.brand').boundingBox();
    await page.screenshot({path:O+`logo-v2-${m}.png`, clip:{x:bb.x-8,y:bb.y-8,width:280,height:bb.height+16}});
    if(m==='dark'){
      const masse=await page.locator('.brand-logo').evaluate(e=>{const r=e.getBoundingClientRect();
        return {breite:+r.width.toFixed(1),hoehe:+r.height.toFixed(1)};});
      console.log('v2 im Sidebar-Kopf:', JSON.stringify(masse));
    }
    await page.close();
  }
  await b.close();
})();
