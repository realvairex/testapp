const { chromium } = require('playwright');
const O=process.cwd()+'/design/mockups/tests/out/';
// v1: viewBox 214.8x152.49 - der Wimpel fuellt die volle Hoehe.
// v2: viewBox 214.8x199.66 - der Wimpel beginnt erst bei y=48, nimmt also
//     nur ~76% der Hoehe ein. Bei gleicher Kopfhoehe schrumpft er dadurch.
(async()=>{
  const b=await chromium.launch();
  const page=await b.newPage({viewport:{width:1240,height:700},deviceScaleFactor:3});
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  for (const h of [21,24,27.6]) {
    await page.addStyleTag({content:`.brand-logo{height:${h}px !important}`});
    await page.waitForTimeout(120);
    const bb=await page.locator('.brand').boundingBox();
    const w=await page.locator('.brand-logo').evaluate(e=>+e.getBoundingClientRect().width.toFixed(1));
    console.log(`Hoehe ${h}px -> Breite ${w}px, Wimpel ~${(h*0.76).toFixed(1)}px hoch`);
    await page.screenshot({path:O+`logo-h${String(h).replace('.','_')}.png`, clip:{x:bb.x-8,y:bb.y-10,width:250,height:bb.height+20}});
  }
  await b.close();
})();
