const { chromium } = require('playwright');
const laufende = (page,label) => page.evaluate((label)=>{
  const a = document.getAnimations().map(x=>({
    ziel: x.effect && x.effect.target ? (x.effect.target.className||x.effect.target.tagName) : '?',
    was: x.animationName || x.transitionProperty || '?',
    dauer: x.effect ? Math.round(x.effect.getTiming().duration) : 0
  }));
  return {label, anzahl:a.length, a};
}, label);
(async()=>{
  const b=await chromium.launch();
  const page=await b.newPage({viewport:{width:1240,height:700}});
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(500);

  await page.click('.nav-item[data-list="personal"]'); await page.waitForTimeout(600);
  // A) Klick auf den Eingang
  await page.click('.nav-item[data-list="inbox"]');
  await page.waitForTimeout(30);
  console.log(JSON.stringify(await laufende(page,'A: Klick auf Eingang'),null,1));

  await page.waitForTimeout(700);
  // B) Klick auf das + einer Gruppe
  await page.locator('.group-row').first().hover();
  await page.waitForTimeout(200);
  await page.locator('[data-add-list-to]').first().click();
  await page.waitForTimeout(30);
  console.log(JSON.stringify(await laufende(page,'B: Klick auf +'),null,1));
  await b.close();
})();
