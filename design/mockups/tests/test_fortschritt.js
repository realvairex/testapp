// Fortschrittsbalken an einer Aufgabenzeile (docs/spec.md §2.2, §3).
//
// Er zeigt dieselbe Sache wie der Balken im Aufräum-Modus - "es ist mehr
// geworden" -, also muss er sich auch gleich anfühlen: über `transform`
// bewegt (nie über `width`), Kurve `ease-lauf`, kein Überschwingen.
//
// Der Anlass ist ein Fehler, der lange unbemerkt blieb: Im Stylesheet stand
// ein `transition` auf `width` - gelaufen ist es nie. renderColumns() baut
// die Zeile bei jeder Änderung neu auf, und ein frisch eingesetztes Element
// hat keinen Vorzustand, von dem aus ein Übergang laufen könnte; es stand
// sofort auf dem Endwert. Deshalb prüft dieses Skript ZWISCHENWERTE.
// Anfangs- und Endwert allein hätten den Fehler nicht gezeigt.
const { chromium } = require('playwright');

const AUSWAHL = '.column[data-col-index="0"] .mini-progress > span';

// Zeichnet den Verlauf im Browser auf, während geklickt wird - von außen
// gemessen sieht "läuft" und "springt" gleich aus, wenn man Pech mit dem
// Messtakt hat.
const verlauf = (page, klickAuf) =>
  page.evaluate(([sel, ziel]) => new Promise((fertig) => {
    const proben = [];
    const t0 = performance.now();
    document.querySelector(ziel).click();
    (function tick() {
      const s = document.querySelector(sel);
      if (s) {
        const m = getComputedStyle(s).transform;
        // Über DOMMatrix, nicht über einen regulären Ausdruck: Bei kleinen
        // Werten schreibt der Browser `matrix(7.3e-05, ...)`, und ein
        // Ausdruck, der das `e-05` abschneidet, meldet Ausreißer, die es
        // nicht gibt (siehe docs/decisions.md, 2026-08-11).
        proben.push(m === 'none' ? 1 : +new DOMMatrixReadOnly(m).a.toFixed(4));
      }
      if (performance.now() - t0 < 1300) requestAnimationFrame(tick);
      else fertig(proben);
    })();
  }), [AUSWAHL, klickAuf]);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 760 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  await page.locator('.nav-item[data-list="personal"]').click();
  await page.waitForTimeout(400);

  console.log('>>> eine Aufgabe mit Unteraufgaben trägt einen Balken:',
    (await page.locator('.column[data-col-index="0"] .mini-progress').count()) >= 1);

  // Er darf nicht über die Breite bewegt werden: Layout-Eigenschaften zu
  // animieren erzwingt in jedem Bild ein neues Layout (spec.md §3).
  const bewegtSich = await page.locator(AUSWAHL).evaluate((e) => {
    const s = getComputedStyle(e);
    return { eigenschaft: s.transitionProperty, breite: s.width, dauer: s.transitionDuration };
  });
  console.log('Übergang:', JSON.stringify(bewegtSich));
  console.log('>>> er bewegt sich über transform, nicht über width:',
    bewegtSich.eigenschaft === 'transform');

  // Eine Unteraufgabe abhaken und den Balken der Elternzeile beobachten.
  await page.locator('.column[data-col-index="0"] .task-title').first().click();
  await page.waitForTimeout(700);
  const hoch = await verlauf(page, '.column[data-col-index="1"] .check-btn');
  const zielH = hoch[hoch.length - 1];
  const zwischenH = hoch.filter((v) => v > hoch[0] + 0.001 && v < zielH - 0.001);
  console.log('Verlauf hoch:', hoch[0], '->', zielH, '| Zwischenwerte:', zwischenH.length);
  console.log('>>> der Balken wächst, wenn eine Unteraufgabe abgehakt wird:', zielH > hoch[0]);
  console.log('>>> und läuft dabei, statt zu springen:', zwischenH.length >= 8);
  console.log('>>> ohne über sein Ziel hinauszuschießen:',
    Math.max.apply(null, hoch) <= zielH + 0.0005);

  // Zurücknehmen: Der Balken muss genauso zurücklaufen.
  const runter = await verlauf(page, '.column[data-col-index="1"] .check-btn');
  const zielR = runter[runter.length - 1];
  const zwischenR = runter.filter((v) => v < runter[0] - 0.001 && v > zielR + 0.001);
  console.log('Verlauf zurück:', runter[0], '->', zielR, '| Zwischenwerte:', zwischenR.length);
  console.log('>>> und läuft genauso zurück, wenn der Haken wieder weg ist:',
    zielR < runter[0] && zwischenR.length >= 8);

  // Dieselbe Bewegung wie im Aufräum-Modus - es ist dieselbe Aussage.
  const gleich = await page.evaluate(() => {
    const zeile = getComputedStyle(document.querySelector('.mini-progress > span'));
    const wurzel = getComputedStyle(document.documentElement);
    return {
      kurve: zeile.transitionTimingFunction,
      erwartet: 'cubic-bezier(' + wurzel.getPropertyValue('--ease-lauf').trim()
        .replace('cubic-bezier(', '').replace(')', '') + ')',
      dauer: zeile.transitionDuration
    };
  });
  console.log('>>> er benutzt dieselbe Kurve wie der Balken im Aufräum-Modus:',
    gleich.kurve.replace(/\s/g, '') === gleich.erwartet.replace(/\s/g, ''));
  console.log('>>> und dieselbe Dauer (0,6 s):', gleich.dauer === '0.6s');

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
