// Prueft, dass die Kopfzeile der Eingang-Spalte ihre Hoehe NICHT aendert,
// wenn die letzte offene Aufgabe abgehakt wird - also der "Aufraeumen"-
// Knopf erscheint oder verschwindet.
//
// Anlass (2026-08-13): Der Nutzer meldete, beim Ab- und Anhaken rutsche
// "alles unter dem Titel ein bisschen nach unten". Im Linux-Container war
// der Sprung 0px - der Titel (22px * 1.2 = 26,4px) gewann gegen den Knopf
// (26px) mit 0,4px Vorsprung. Die Knopfhoehe haengt aber an der Schrift
// des Systems: Wo er auch nur ein halbes Pixel hoeher rendert, bestimmt ER
// die Hoehe der Zeile.
//
// Deshalb prueft dieses Skript NICHT den heutigen Zustand, sondern die
// REGEL - und zwar bei mehreren Schriftgroessen, die den Vorsprung
// absichtlich umkehren. Eine Pruefung, die nur "22px springt nicht" sagt,
// waere genau die Sorte Zusicherung, die einen Zustand statt einer Regel
// festschreibt (docs/lernkurve.md, Muster 10).

const { chromium } = require('playwright');
const ZIEL = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
const zeige = (l, v) => console.log('>>> ' + l + ': ' + v);

(async () => {
  const fehler = [];
  const b = await chromium.launch();

  for (const fs of ['22px', '21px', '20px', '18px']) {
    const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', e => fehler.push(String(e)));
    // Genau ein offener Eintrag im Eingang - der Fall des Nutzers.
    await page.addInitScript(() => {
      localStorage.setItem('unfold.daten', JSON.stringify({
        schema: 1, erzeugtVon: 'test_kopf_stabil', gespeichertAm: new Date().toISOString(),
        naechsteId: 900, gruppen: [],
        listen: [{ id: 'inbox', name: 'Eingang', color: 'var(--list-inbox)',
          tasks: [{ id: 't901', title: 'test', done: false, due: null, subtasks: [], blocks: [] }],
          blocks: [{ type: 'task', id: 't901' }], groupId: null }],
        ansicht: { eingeklappteGruppen: {}, darstellung: 'dark' }
      }));
    });
    await page.goto(ZIEL);
    await page.waitForTimeout(600);
    if (fs !== '22px') { await page.addStyleTag({ content: `:root{--fs-xl:${fs}}` }); await page.waitForTimeout(120); }

    const lesen = () => page.evaluate(() => {
      const q = s => document.querySelector(s);
      const y = e => e ? +e.getBoundingClientRect().y.toFixed(1) : null;
      const k = q('.tidy-start');
      return {
        kopfHoehe: +q('.col-header-top').getBoundingClientRect().height.toFixed(1),
        metaY: y(q('.col-meta')),
        zeileY: y(q('.inline-embed')),
        knopfSichtbar: !!k && getComputedStyle(k).visibility === 'visible'
      };
    });

    const offen = await lesen();
    await page.locator('.check-btn').first().click();
    await page.waitForTimeout(650);
    const zu = await lesen();

    zeige(fs + ' - Knopf verschwindet sichtbar', offen.knopfSichtbar === true && zu.knopfSichtbar === false);
    zeige(fs + ' - Kopfzeile bleibt gleich hoch', offen.kopfHoehe === zu.kopfHoehe);
    zeige(fs + ' - Meta-Zeile bleibt stehen', offen.metaY === zu.metaY);
    zeige(fs + ' - Aufgabenzeile bleibt stehen', offen.zeileY === zu.zeileY);
    if (offen.zeileY !== zu.zeileY) console.log('    Versatz:', (zu.zeileY - offen.zeileY).toFixed(1), 'px');
    await page.close();
  }

  zeige('keine JS-Fehler', fehler.length === 0);
  if (fehler.length) console.log('   ', fehler.slice(0, 3).join(' | '));
  await b.close();
})();
