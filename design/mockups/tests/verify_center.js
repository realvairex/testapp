const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  const out = await page.evaluate(() => {
    function glyphCenter(el) { const r=document.createRange(); r.selectNodeContents(el); const b=r.getBoundingClientRect(); return +(b.x+b.width/2).toFixed(2); }
    function ctr(el){ const r=el.getBoundingClientRect(); return {x:+(r.x+r.width/2).toFixed(2), y:+(r.y+r.height/2).toFixed(2)}; }
    const res = { rows: [] };

    // trash artwork centring inside its rendered svg viewport
    const svg = document.querySelector('.nav-delete svg');
    const bb = svg.querySelector('path').getBBox();
    const vb = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    res.artwork = {
      viewBox: svg.getAttribute('viewBox'),
      artCenterY: +(bb.y+bb.height/2).toFixed(3),
      viewBoxCenterY: +(vb[1]+vb[3]/2).toFixed(3),
      offsetY: +((bb.y+bb.height/2)-(vb[1]+vb[3]/2)).toFixed(3),
      artCenterX: +(bb.x+bb.width/2).toFixed(3),
      viewBoxCenterX: +(vb[0]+vb[2]/2).toFixed(3),
      offsetX: +((bb.x+bb.width/2)-(vb[0]+vb[2]/2)).toFixed(3),
    };

    // today reference
    const t = document.querySelector('.nav-item[data-nav="today"] .nav-count');
    res.todayGlyphCenter = glyphCenter(t);

    document.querySelectorAll('.nav-item-wrap').forEach((w,i)=>{
      const c=w.querySelector('.nav-count'), d=w.querySelector('.nav-delete');
      // Der Eingang ist ein Ort und hat keinen Loeschknopf (spec.md 2.0) -
      // seine Zeile hat hier also nichts zu vermessen.
      if (!c || !d) return;
      res.rows.push({ row:'list'+i, glyph:glyphCenter(c), btn:ctr(d).x, svg:ctr(d.querySelector('svg')).x });
    });
    document.querySelectorAll('.group-row').forEach((w,i)=>{
      const c=w.querySelector('.nav-count'), d=w.querySelector('.nav-delete');
      // Der Eingang ist ein Ort und hat keinen Loeschknopf (spec.md 2.0) -
      // seine Zeile hat hier also nichts zu vermessen.
      if (!c || !d) return;
      res.rows.push({ row:'group'+i, glyph:glyphCenter(c), btn:ctr(d).x, svg:ctr(d.querySelector('svg')).x });
    });
    return res;
  });
  console.log('trash artwork centring in viewBox:', JSON.stringify(out.artwork));
  console.log('TODAY glyph center (reference):', out.todayGlyphCenter);
  console.log('per row -> glyph / button / svg centers:');
  out.rows.forEach(r => console.log('  ', r.row.padEnd(8), 'glyph', r.glyph, '| btn', r.btn, '| svg', r.svg,
    (Math.abs(r.glyph-r.btn) < 0.6 && Math.abs(r.svg-r.btn) < 0.6) ? 'OK' : '<-- MISALIGNED'));
  await browser.close();
})();
