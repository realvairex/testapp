const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);

  const out = await page.evaluate(() => {
    const res = {};
    // --- is the trash drawing centred inside its own viewBox? ---
    const svg = document.querySelector('.nav-delete svg');
    const path = svg.querySelector('path');
    const bb = path.getBBox();           // user units within viewBox 0 0 13 13
    res.trashArtwork = {
      viewBox: svg.getAttribute('viewBox'),
      bboxX: +bb.x.toFixed(2), bboxW: +bb.width.toFixed(2),
      bboxY: +bb.y.toFixed(2), bboxH: +bb.height.toFixed(2),
      artCenterX: +(bb.x + bb.width/2).toFixed(2),
      artCenterY: +(bb.y + bb.height/2).toFixed(2),
      viewBoxCenter: 6.5,
      offsetX: +((bb.x + bb.width/2) - 6.5).toFixed(2),
      offsetY: +((bb.y + bb.height/2) - 6.5).toFixed(2),
    };
    // --- is the svg box centred in the button? ---
    const btn = document.querySelector('.nav-delete');
    const br = btn.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    res.svgInButton = {
      btnCenterX: +(br.x+br.width/2).toFixed(2), svgCenterX: +(sr.x+sr.width/2).toFixed(2),
      btnCenterY: +(br.y+br.height/2).toFixed(2), svgCenterY: +(sr.y+sr.height/2).toFixed(2),
      dx: +((sr.x+sr.width/2)-(br.x+br.width/2)).toFixed(2),
      dy: +((sr.y+sr.height/2)-(br.y+br.height/2)).toFixed(2),
    };
    // --- where does the DIGIT actually sit vs the button centre? ---
    // measure the glyph via a Range around the text node
    function glyphRect(el) {
      const r = document.createRange();
      r.selectNodeContents(el);
      const rect = r.getBoundingClientRect();
      return { x:+rect.x.toFixed(2), w:+rect.width.toFixed(2), center:+(rect.x+rect.width/2).toFixed(2) };
    }
    const cnt = document.querySelector('.nav-item-wrap .nav-count');
    const cr = cnt.getBoundingClientRect();
    res.countBoxVsGlyph = {
      boxX: +cr.x.toFixed(2), boxW: +cr.width.toFixed(2), boxCenter: +(cr.x+cr.width/2).toFixed(2),
      glyph: glyphRect(cnt),
      textAlign: getComputedStyle(cnt).textAlign,
      deleteBtnCenter: +(br.x+br.width/2).toFixed(2),
    };
    const today = document.querySelector('.nav-item[data-nav="today"] .nav-count');
    const tr = today.getBoundingClientRect();
    res.todayCount = { boxCenter:+(tr.x+tr.width/2).toFixed(2), glyph: glyphRect(today) };
    return res;
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
