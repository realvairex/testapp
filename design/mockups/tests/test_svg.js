const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const btn = document.querySelector('.nav-item-wrap .nav-delete');
    const svg = btn.querySelector('svg');
    const cb = getComputedStyle(btn), cs = getComputedStyle(svg);
    return {
      btn: { w: cb.width, h: cb.height, display: cb.display, pad: cb.padding, box: cb.boxSizing },
      svgAttrs: { width: svg.getAttribute('width'), height: svg.getAttribute('height'), viewBox: svg.getAttribute('viewBox') },
      svgComputed: { w: cs.width, h: cs.height, flexShrink: cs.flexShrink, flexBasis: cs.flexBasis, minWidth: cs.minWidth },
      svgRect: (r => ({w:+r.width.toFixed(2), h:+r.height.toFixed(2)}))(svg.getBoundingClientRect()),
    };
  });
  console.log(JSON.stringify(info, null, 2));

  // count vs delete alignment across all sidebar row types
  const align = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.nav-item-wrap').forEach((w,i) => {
      const c = w.querySelector('.nav-count'), d = w.querySelector('.nav-delete');
      if (!c||!d) return;
      const cr=c.getBoundingClientRect(), dr=d.getBoundingClientRect();
      out.push({ row:'list'+i, countCenter:+(cr.x+cr.width/2).toFixed(1), delCenter:+(dr.x+dr.width/2).toFixed(1), dx:+((dr.x+dr.width/2)-(cr.x+cr.width/2)).toFixed(1) });
    });
    document.querySelectorAll('.group-row').forEach((w,i) => {
      const c = w.querySelector('.nav-count'), d = w.querySelector('.nav-delete');
      if (!c||!d) return;
      const cr=c.getBoundingClientRect(), dr=d.getBoundingClientRect();
      out.push({ row:'group'+i, countCenter:+(cr.x+cr.width/2).toFixed(1), delCenter:+(dr.x+dr.width/2).toFixed(1), dx:+((dr.x+dr.width/2)-(cr.x+cr.width/2)).toFixed(1) });
    });
    return out;
  });
  console.log('COUNT vs DELETE center offset (dx should be 0):');
  align.forEach(a => console.log('  ', JSON.stringify(a)));
  await browser.close();
})();
