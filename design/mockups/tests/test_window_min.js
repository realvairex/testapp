// Verhalten bei schmalem Fenster.
//
// Die Regel (docs/decisions.md, 2026-08-07): Das App-Fenster schrumpft nur
// bis zu seiner nutzbaren Mindestbreite — Sidebar (248px) plus eine Spalte
// in Mindestbreite (240px). Darunter scrollt die SEITE waagerecht, und der
// Innenabstand von 24px bleibt dabei auf beiden Seiten erhalten.
//
// Vorher schrumpfte das Fenster unbegrenzt weiter, sein Innenleben scrollte
// stattdessen, und der Inhalt stiess ohne jeden Abstand an die Fensterkante.
// Genau das hatte der Nutzer gemeldet.
const { chromium } = require('playwright');

const WIN_MIN = 490;   // --win-min
const PAGE_PAD = 24;   // --page-pad

(async () => {
  const b = await chromium.launch();
  const messungen = [];

  for (const breite of [1240, 700, 560, 420, 340]) {
    const page = await b.newPage({ viewport: { width: breite, height: 760 } });
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(350);
    // Jeden Rand dort messen, wo er sichtbar ist: den linken ganz links,
    // den rechten ganz rechts. Ganz nach rechts gescrollt liegt der linke
    // Rand naturgemaess ausserhalb des Sichtfelds - ihn dort zu messen
    // waere ein Fehler der Pruefung, nicht ein Befund am Erzeugnis.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);
    const links = await page.evaluate(() =>
      +document.querySelector('.app-window').getBoundingClientRect().left.toFixed(0));

    await page.evaluate(() => window.scrollTo(document.documentElement.scrollWidth, 0));
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const w = document.querySelector('.app-window').getBoundingClientRect();
      const d = document.documentElement;
      return {
        fenster: +w.width.toFixed(0),
        rechts: +(d.clientWidth - w.right).toFixed(0),
        seiteScrollt: d.scrollWidth > d.clientWidth,
      };
    });
    m.links = links;
    m.viewport = breite;
    messungen.push(m);
    console.log('  Viewport', String(breite).padStart(4), JSON.stringify(m));
    await page.close();
  }

  const eng = messungen.filter((m) => m.viewport <= 420);
  const weit = messungen.filter((m) => m.viewport >= 700);

  console.log('>>> Fenster schrumpft nie unter seine Mindestbreite:',
    messungen.every((m) => m.fenster >= WIN_MIN));
  console.log('>>> Abstand rechts bleibt auch ganz nach rechts gescrollt erhalten:',
    messungen.every((m) => m.rechts >= PAGE_PAD));
  console.log('>>> Abstand links ebenso:',
    messungen.every((m) => m.links >= PAGE_PAD));
  console.log('>>> bei zu schmalem Fenster scrollt die Seite:',
    eng.every((m) => m.seiteScrollt));
  console.log('>>> solange es passt, scrollt die Seite NICHT:',
    weit.every((m) => !m.seiteScrollt));

  await b.close();
})();
