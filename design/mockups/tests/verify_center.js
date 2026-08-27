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

    // Eine Zeile kann mehrere Aktionsknoepfe tragen: Die Gruppenzeile hat seit
    // dem "+"-Knopf zwei. Auf der Achse des Zaehlers sitzt deshalb der LETZTE
    // Knopf, nicht der erste - der Papierkorb rueckt bei der Gruppe bewusst
    // eine Stelle nach links (docs/status.md, Abschnitt 1).
    function sammle(wrap, name) {
      const c = wrap.querySelector('.nav-count');
      const btns = [...wrap.querySelectorAll('.nav-delete')];
      // Der Eingang ist ein Ort und hat keinen Loeschknopf (spec.md 2.0) -
      // seine Zeile hat hier also nichts zu vermessen.
      if (!c || !btns.length) return;
      res.rows.push({
        row: name,
        glyph: glyphCenter(c),
        btns: btns.map(d => ({ btn: ctr(d).x, svg: ctr(d.querySelector('svg')).x })),
      });
    }
    document.querySelectorAll('.nav-item-wrap').forEach((w,i)=> sammle(w, 'list'+i));
    document.querySelectorAll('.group-row').forEach((w,i)=> sammle(w, 'group'+i));

    return res;
  });
  console.log('trash artwork centring in viewBox:', JSON.stringify(out.artwork));
  console.log('TODAY glyph center (reference):', out.todayGlyphCenter);
  console.log('per row -> glyph / buttons (last one carries the axis):');
  let schief = 0;
  out.rows.forEach(r => {
    const letzter = r.btns[r.btns.length-1];
    // Der letzte Knopf traegt die Achse des Zaehlers ...
    const aufAchse = Math.abs(r.glyph - letzter.btn) < 0.6;
    // ... und jedes SVG sitzt mittig in SEINEM Knopf, nicht auf der Achse.
    const svgMittig = r.btns.every(b => Math.abs(b.svg - b.btn) < 0.6);
    if (!aufAchse || !svgMittig) schief++;
    console.log('  ', r.row.padEnd(8), 'glyph', r.glyph,
      '| btns', r.btns.map(b => b.btn + (Math.abs(b.svg-b.btn) < 0.6 ? '' : '(svg ' + b.svg + '!)')).join(' '),
      aufAchse && svgMittig ? 'OK' : '<-- MISALIGNED');
  });
  console.log(schief === 0 ? 'ALLE ZEILEN OK' : schief + ' ZEILE(N) SCHIEF');
  await browser.close();
})();
