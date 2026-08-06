const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  const out = await page.evaluate(() => {
    const svg = document.querySelector('.nav-delete svg');
    const names = ['lid','handle','body'];
    const parts = Array.from(svg.querySelectorAll('path')).map((p,i) => {
      const b = p.getBBox();
      return { part: names[i], x1:+b.x.toFixed(2), x2:+(b.x+b.width).toFixed(2),
               centerX:+(b.x+b.width/2).toFixed(3), offsetFrom6_5:+((b.x+b.width/2)-6.5).toFixed(3) };
    });
    const all = svg.querySelectorAll('path');
    let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    all.forEach(p=>{const b=p.getBBox(); minX=Math.min(minX,b.x); maxX=Math.max(maxX,b.x+b.width); minY=Math.min(minY,b.y); maxY=Math.max(maxY,b.y+b.height);});
    const vb = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    return { parts, overall: { x:[+minX.toFixed(2),+maxX.toFixed(2)], centerX:+((minX+maxX)/2).toFixed(3),
             y:[+minY.toFixed(2),+maxY.toFixed(2)], centerY:+((minY+maxY)/2).toFixed(3),
             vbCenterX:+(vb[0]+vb[2]/2).toFixed(3), vbCenterY:+(vb[1]+vb[3]/2).toFixed(3) } };
  });
  console.log('per-part horizontal centring (offset from 6.5 should be 0):');
  out.parts.forEach(p => console.log('  ', p.part.padEnd(7), 'x', p.x1, '->', p.x2, '| center', p.centerX, '| offset', p.offsetFrom6_5, Math.abs(p.offsetFrom6_5)<0.01?'OK':'<-- OFF'));
  console.log('overall:', JSON.stringify(out.overall));
  await browser.close();
})();
