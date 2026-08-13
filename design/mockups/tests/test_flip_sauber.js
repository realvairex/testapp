// Prueft, dass der Inhalt einer Spalte waehrend der Oeffnungs-Bewegung
// NICHT verzerrt wird.
//
// Anlass (2026-08-13): Der Nutzer meldete, das Oeffnen des ersten
// Unterpanels wirke "nicht clean" und "nicht wie dieselbe Animation" wie
// beim zweiten. Es war beides zugleich richtig:
//
//   - Eine NEUE Spalte schiebt herein (translateX) - sauber.
//   - Eine VORHANDENE Spalte wird per FLIP gedehnt (scaleX) und ihr Inhalt
//     gegengestaucht. Beide liefen als Zwei-Punkt-Uebergang auf derselben
//     Kurve - und das hebt sich nur an den ENDEN auf. Der Kehrwert von 1,5
//     ist 0,667, nicht 0,75.
//
// Gemessen wurde ein Produkt von bis zu 1,115: der Inhalt war mitten in
// der Bewegung 12,5% zu breit. Auf einem Standbild unsichtbar, in
// Bewegung deutlich.
//
// Diese Pruefung misst deshalb den VERLAUF, nicht den Endzustand. Eine
// Zusicherung auf Anfang und Ende waere hier gruen gewesen - genau die
// Sorte Pruefung, die einen Zustand statt einer Regel festhaelt.

const { chromium } = require('playwright');
const ZIEL = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
const zeige = (l, v) => console.log('>>> ' + l + ': ' + v);

(async () => {
  const fehler = [];
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(ZIEL);
  await page.waitForTimeout(700);

  const verlauf = await page.evaluate(async () => {
    const proben = []; let laufend = true;
    const t0 = performance.now();
    (function tick(t) {
      if (!laufend) return;
      const c = document.querySelector('.column[data-col-key="list:inbox"]');
      const i = c && c.querySelector('.col-inner');
      if (c && i) {
        const a = new DOMMatrix(getComputedStyle(c).transform).a;
        const b = new DOMMatrix(getComputedStyle(i).transform).a;
        proben.push({ aussen: a, innen: b, produkt: a * b });
      }
      requestAnimationFrame(tick);
    })(t0);
    document.querySelector('.column[data-col-index="0"] .inline-embed .task-title').click();
    await new Promise(r => setTimeout(r, 600));
    laufend = false;
    return proben;
  });

  zeige('die Bewegung wurde ueberhaupt aufgezeichnet', verlauf.length > 20);

  // Wurde wirklich gestaucht? Sonst misst die Pruefung nichts.
  const maxAussen = Math.max(...verlauf.map(p => p.aussen));
  zeige('die vorhandene Spalte wird gestaucht (scaleX > 1)', maxAussen > 1.5);

  const abweichung = Math.max(...verlauf.map(p => Math.abs(p.produkt - 1)));
  zeige('Inhalt bleibt waehrend der ganzen Bewegung unverzerrt (< 1%)', abweichung < 0.01);
  console.log('    groesste Verzerrung:', (abweichung * 100).toFixed(2) + '%');

  // --- Dasselbe beim SCHLIESSEN -----------------------------------------
  //
  // animatePanelsClosing baut ihren Plan getrennt auf. Beim ersten Fix
  // wurde nur das Oeffnen versorgt - der Nutzer meldete danach: "beim
  // Schliessen haben wir dasselbe Problem". Deshalb steht die Zusicherung
  // fuer beide Richtungen hier, nicht nur fuer eine.
  await page.waitForTimeout(700);
  const zu = await page.evaluate(async () => {
    const proben = []; let laufend = true;
    const t0 = performance.now();
    (function tick(t) {
      if (!laufend) return;
      const c = document.querySelector('.column[data-col-key="list:inbox"]');
      const i = c && c.querySelector('.col-inner');
      if (c && i) {
        const a = new DOMMatrix(getComputedStyle(c).transform).a;
        const b = new DOMMatrix(getComputedStyle(i).transform).a;
        proben.push({ aussen: a, produkt: a * b });
      }
      requestAnimationFrame(tick);
    })(t0);
    const x = document.querySelector('.column[data-col-index="1"] .col-close');
    if (x) x.click();
    await new Promise(r => setTimeout(r, 600));
    laufend = false;
    return proben;
  });

  zeige('Schliessen: die Bewegung wurde aufgezeichnet', zu.length > 20);
  zeige('Schliessen: die ueberlebende Spalte wird skaliert',
        Math.max(...zu.map(p => Math.abs(p.aussen - 1))) > 0.2);
  const abwZu = Math.max(...zu.map(p => Math.abs(p.produkt - 1)));
  zeige('Schliessen: Inhalt bleibt unverzerrt (< 1%)', abwZu < 0.01);
  console.log('    groesste Verzerrung beim Schliessen:', (abwZu * 100).toFixed(2) + '%');

  zeige('keine JS-Fehler', fehler.length === 0);
  if (fehler.length) console.log('   ', fehler.slice(0, 3).join(' | '));
  await b.close();
})();
