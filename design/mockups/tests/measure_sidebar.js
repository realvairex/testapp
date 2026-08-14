// Misst, wie die Sidebar beim Einklappen wandert - Bild fuer Bild.
//
// Offener Punkt (2026-08-13): Der Nutzer meldete "die Sidebar springt
// raus statt raus zu pushen". Gemessen wandert sie in 24 Zwischen-
// schritten ueber 400ms, springt also nicht - legt aber 78% des Weges in
// den ersten 133ms zurueck, weil --ease stark vorn lastig ist. Ob das
// gemeint ist, war beim Sitzungsende noch nicht geklaert (siehe
// docs/status.md, offene Faeden).
//
// Dieses Skript ist der Ausgangspunkt fuer die naechste Runde: Es zeigt
// die Position der Sidebar UND die Breite ihres Platzhalters, damit sich
// unterscheiden laesst, ob die Sidebar selbst springt oder der Inhalt
// daneben ihr nicht folgt. Genau diese Unterscheidung fehlte, um die
// Meldung einordnen zu koennen.
//
// Es faellt kein Urteil (Messskript) und heisst deshalb measure_.
const { chromium } = require('playwright');

(async()=>{
  const b = await chromium.launch();
  const page = await b.newPage({viewport:{width:1280,height:800}});
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(700);
  // Aufgabe MIT Unteraufgaben oeffnen
  await page.evaluate(()=>{
    const t = [...document.querySelectorAll('.task-title')].find(e=>/Fahrrad/.test(e.textContent));
    t && t.click();
  });
  await page.waitForTimeout(800);
  console.log('Spalten jetzt:', await page.evaluate(()=>document.querySelectorAll('.column').length));

  // Zweites Panel: Unteraufgabe oeffnen -> Sidebar klappt ein
  const verlauf = await page.evaluate(async ()=>{
    const proben = [];
    let laufend = true;
    const sb = document.querySelector('.sidebar');
    const tr = document.querySelector('.sidebar-track');
    const t0 = performance.now();
    (function tick(t){
      if(!laufend) return;
      proben.push({
        t:+(t-t0).toFixed(0),
        sbX:+sb.getBoundingClientRect().left.toFixed(1),
        trW:+tr.getBoundingClientRect().width.toFixed(1)
      });
      requestAnimationFrame(tick);
    })(t0);
    const c = document.querySelector('.column[data-col-index="1"]');
    const u = c && c.querySelector('.inline-embed .task-title');
    if (u) u.click();
    await new Promise(r=>setTimeout(r,700));
    laufend=false;
    return proben;
  });
  console.log('\nZeit | Sidebar-x | Track-Breite');
  verlauf.filter((_,i)=>i%3===0).forEach(p=>console.log(String(p.t).padStart(4)+'ms | '+String(p.sbX).padStart(9)+' | '+p.trW));
  const xs = verlauf.map(p=>p.sbX), ws = verlauf.map(p=>p.trW);
  console.log('\n>>> Sidebar wandert von', xs[0], 'nach', xs[xs.length-1], '- Zwischenwerte:', new Set(xs).size);
  console.log('>>> Track-Breite von', ws[0], 'nach', ws[ws.length-1], '- Zwischenwerte:', new Set(ws).size);
  await b.close();
})();
