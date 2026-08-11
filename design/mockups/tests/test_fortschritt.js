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
// sofort auf dem Endwert. Deshalb misst dieses Skript, wie lange der Balken
// UNTERWEGS ist. Anfangs- und Endwert allein hätten den Fehler nicht
// gezeigt - sie stimmten ja immer.
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
        // Mit Zeitstempel: Unter Last zeichnet der Browser deutlich weniger
        // Bilder, und "wie viele Zwischenwerte" waere dann eine Aussage ueber
        // die Auslastung des Rechners statt ueber die Animation. Die Frage
        // ist, ob der Balken ZEIT braucht - nicht, wie oft er gemessen wurde.
        proben.push([Math.round(performance.now() - t0),
                     m === 'none' ? 1 : +new DOMMatrixReadOnly(m).a.toFixed(4)]);
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
  // Wie lange der Balken unterwegs war: von der ersten Aenderung bis zum
  // Erreichen des Ziels. Ein Sprung braucht 0 ms, eine Animation ueber
  // 600 ms braucht ein Vielfaches davon - auch auf einem lahmen Rechner.
  const laufzeit = (spur) => {
    const ziel = spur[spur.length - 1][1];
    const start = spur[0][1];
    const los = spur.find((x) => Math.abs(x[1] - start) > 0.001);
    const an = spur.find((x) => Math.abs(x[1] - ziel) <= 0.0005);
    return los && an ? an[0] - los[0] : 0;
  };

  const hoch = await verlauf(page, '.column[data-col-index="1"] .check-btn');
  const zielH = hoch[hoch.length - 1][1];
  console.log('Verlauf hoch:', hoch[0][1], '->', zielH, '| unterwegs:', laufzeit(hoch), 'ms');
  console.log('>>> der Balken wächst, wenn eine Unteraufgabe abgehakt wird:', zielH > hoch[0][1]);
  console.log('>>> und läuft dabei, statt zu springen:', laufzeit(hoch) > 200);
  console.log('>>> ohne über sein Ziel hinauszuschießen:',
    Math.max.apply(null, hoch.map((x) => x[1])) <= zielH + 0.0005);

  // Zurücknehmen: Der Balken muss genauso zurücklaufen. Vorher abwarten -
  // die Spalte wird beim Abhaken komplett neu aufgebaut (siehe status.md,
  // "Vollstaendiger Neuaufbau"), und ein Klick mitten hinein greift ins Leere.
  await page.waitForTimeout(400);
  const runter = await verlauf(page, '.column[data-col-index="1"] .check-btn.done');
  const zielR = runter[runter.length - 1][1];
  console.log('Verlauf zurück:', runter[0][1], '->', zielR, '| unterwegs:', laufzeit(runter), 'ms');
  console.log('>>> und läuft genauso zurück, wenn der Haken wieder weg ist:',
    zielR < runter[0][1] && laufzeit(runter) > 200);

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
