// Aufräum-Modus aus docs/spec.md §2.8, entschieden und gebaut am 2026-08-11.
//
// Der Modus kann NICHTS, was das Einsortieren per Ziehen nicht auch könnte -
// sein einziger Vorteil ist, dass man ihn gern öffnet. Deshalb prüft dieses
// Skript zwei Dinge gleichrangig:
//
//   1. dass die Entscheidungen richtig ankommen (Liste, Datum, erledigt,
//      gelöscht, später) und "Zurück" jede von ihnen zurücknimmt,
//   2. dass die BELOHNUNGSSCHICHT da ist - jede Entscheidung mit ihrer
//      eigenen Bewegung, federnder Balken, rollender Zähler, aufblitzende
//      Zielzeile. Ohne sie bleibt ein Formular mit sieben Runden übrig,
//      und das ist genau der Zustand, den niemand freiwillig öffnet.
//
// Die Bewegungen sind hier also KEIN Kosmetikthema, das man beim roten Punkt
// wegdrückt. Fällt eine aus, ist der Modus kaputt.
const { chromium } = require('playwright');

const zaehler = (page, id) =>
  page.locator('.nav-item[data-list="' + id + '"] .nav-count').innerText().then(Number);

const titel = (page) => page.locator('.tidy-card-title').innerText();
const meta = (page) => page.locator('.tidy-meta').innerText();

// Breite des Fortschrittsbalkens: er läuft über transform: scaleX, nicht
// über width - deshalb wird die Matrix ausgelesen, nicht der Kasten.
const balken = (page) =>
  page.evaluate(() => {
    const s = getComputedStyle(document.querySelector('.tidy-bar > span')).transform;
    if (!s || s === 'none') return 1;
    return +Number(s.match(/matrix\(([-\d.]+)/)[1]).toFixed(3);
  });

// Fasst die Karte MITTEN im Flug ab: die Bewegung dauert 260 ms, danach
// baut sich die Seite neu auf und die Klasse ist weg.
async function flugKlasse(page, klicken) {
  await klicken();
  await page.waitForTimeout(60);
  return page.evaluate(() => {
    const k = document.querySelector('.tidy-card');
    return k ? k.className : '';
  });
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 780 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // --- Einstieg ---------------------------------------------------------
  console.log('>>> der Einstieg steht im Kopf des Eingangs:',
    (await page.locator('.col-header .tidy-start').count()) === 1);

  const offenVorher = await zaehler(page, 'inbox');
  // Zeilen der obersten Ebene im Eingang, offen und abgehakt getrennt. Der
  // Zähler in der Sidebar taugt dafür nicht: Er summiert Unteraufgaben mit.
  const zeilen = await page.evaluate(() => {
    const r = document.querySelectorAll('.column[data-col-index="0"] .page-editor > .inline-embed > .task-row');
    return { alle: r.length, erledigt: Array.from(r).filter((x) => x.classList.contains('done')).length };
  });
  await page.locator('.tidy-start').click();
  await page.waitForTimeout(400);

  // Kein Overlay (concept.md, Design-Richtung). Und die Sidebar MUSS stehen
  // bleiben: Sie ist das Ziel der Wegflug-Bewegung.
  console.log('>>> die Spalte übernimmt, kein Overlay:',
    (await page.locator('.column[data-col-index="0"] .tidy').count()) === 1 &&
    (await page.locator('.tidy').evaluate((e) => getComputedStyle(e).position)) === 'static');
  console.log('>>> die Sidebar bleibt sichtbar:',
    await page.locator('#sidebar .nav-item[data-list="personal"]').isVisible());

  // Erledigtes ist kein Triage-Material - im Datenbestand liegt eine
  // abgehakte Aufgabe im Eingang, die nicht in die Warteschlange gehört.
  const gesamt = +(await meta(page)).match(/von (\d+)/)[1];
  console.log('Warteschlange:', gesamt, '| Zeilen im Eingang:', zeilen.alle,
    'davon erledigt:', zeilen.erledigt);
  console.log('>>> nur Offenes kommt in die Warteschlange:',
    zeilen.erledigt > 0 && gesamt === zeilen.alle - zeilen.erledigt);
  console.log('>>> der Balken startet bei null:', (await balken(page)) === 0);

  // --- In eine Liste: fliegt nach links, Zielzeile blitzt auf ------------
  const ersteAufgabe = await titel(page);
  const personalVorher = await zaehler(page, 'personal');

  const kl1 = await flugKlasse(page, () => page.locator('[data-tidy-liste="personal"]').click());
  console.log('>>> Einsortieren lässt die Karte nach LINKS zur Sidebar fliegen:',
    /tidy-karte-weg/.test(kl1) && /nach-links/.test(kl1));
  await page.waitForTimeout(400);

  console.log('>>> die Aufgabe liegt jetzt in der Zielliste:',
    (await zaehler(page, 'personal')) === personalVorher + 1);
  console.log('>>> und nicht mehr im Eingang:',
    (await zaehler(page, 'inbox')) === offenVorher - 1);
  console.log('>>> die Zielzeile in der Sidebar blitzt auf:',
    (await page.locator('.nav-item[data-list="personal"].tidy-ziel').count()) === 1);
  console.log('>>> der Balken ist gewachsen:', (await balken(page)) > 0);
  console.log('>>> der Zähler rollt statt umzuspringen:',
    (await page.locator('.tidy-meta.rollt .tidy-zahl').count()) === 1);
  console.log('>>> die nächste Aufgabe steht da:', (await titel(page)) !== ersteAufgabe);

  // --- WANN? rückt NICHT weiter -----------------------------------------
  // Ein Datum allein lässt die Aufgabe im Eingang liegen. Würde der Modus
  // hier weiterrücken, wäre der Durchgang umsonst gewesen.
  const beiDatum = await titel(page);
  const metaVorDatum = await meta(page);
  await page.locator('[data-tidy-datum]').first().click();
  await page.waitForTimeout(300);
  console.log('>>> ein Datum rückt nicht weiter:',
    (await titel(page)) === beiDatum && (await meta(page)) === metaVorDatum);
  console.log('>>> der gewählte Wert ist markiert und quittiert:',
    (await page.locator('.tidy-btn.gewaehlt').count()) === 1 &&
    (await page.locator('.tidy-btn.gerade-gewaehlt').count()) === 1);

  // Nochmal derselbe Knopf nimmt das Datum wieder weg.
  await page.locator('[data-tidy-datum]').first().click();
  await page.waitForTimeout(250);
  console.log('>>> derselbe Knopf nimmt das Datum wieder weg:',
    (await page.locator('.tidy-btn.gewaehlt').count()) === 0);

  // --- Der Kalender steht im Fluss, nicht schwebend ----------------------
  await page.locator('[data-tidy="kalender"]').click();
  await page.waitForTimeout(250);
  console.log('>>> der Kalender klappt im Fluss auf:',
    (await page.locator('.due-cal.tidy-cal').count()) === 1 &&
    (await page.locator('.due-cal.tidy-cal').evaluate((e) => getComputedStyle(e).position)) === 'static');
  await page.locator('.due-cal.tidy-cal .due-cal-day:not(.fremd)').nth(20).click();
  await page.waitForTimeout(250);
  console.log('>>> ein Tag daraus setzt das Datum, ohne weiterzurücken:',
    (await titel(page)) === beiDatum &&
    (await page.locator('.due-cal.tidy-cal').count()) === 0 &&
    (await page.locator('.tidy-btn.gewaehlt').count()) === 1);

  // --- Später: nach rechts, ohne etwas zu ändern -------------------------
  const eingangVorSpaeter = await zaehler(page, 'inbox');
  const kl2 = await flugKlasse(page, () => page.locator('[data-tidy="spaeter"]').click());
  console.log('>>> Später schiebt die Karte nach RECHTS:',
    /tidy-karte-weg/.test(kl2) && /nach-rechts/.test(kl2));
  await page.waitForTimeout(400);
  console.log('>>> Später ändert nichts am Bestand:',
    (await zaehler(page, 'inbox')) === eingangVorSpaeter);
  console.log('>>> und die Aufgabe kommt im selben Durchgang nicht wieder:',
    (await titel(page)) !== beiDatum);

  // --- Erledigt: sinkt in sich zusammen ----------------------------------
  const beiErledigt = await titel(page);
  const kl3 = await flugKlasse(page, () => page.locator('[data-tidy="erledigt"]').click());
  console.log('>>> Erledigt lässt die Karte ZUSAMMENSINKEN:',
    /tidy-karte-weg/.test(kl3) && /zusammen/.test(kl3));
  await page.waitForTimeout(400);
  console.log('>>> die Aufgabe zählt nicht mehr als offen:',
    (await zaehler(page, 'inbox')) === eingangVorSpaeter - 1);

  // --- Löschen: fällt nach unten ----------------------------------------
  const beiLoeschen = await titel(page);
  const kl4 = await flugKlasse(page, () => page.locator('[data-tidy="loeschen"]').click());
  console.log('>>> Löschen lässt die Karte nach UNTEN fallen:',
    /tidy-karte-weg/.test(kl4) && /nach-unten/.test(kl4));
  await page.waitForTimeout(400);

  console.log('>>> vier Entscheidungen, vier verschiedene Bewegungen:',
    new Set([kl1, kl2, kl3, kl4].map((k) => k.replace('tidy-card tidy-karte-weg ', ''))).size === 4);

  // --- Zurück nimmt jeden Schritt zurück ---------------------------------
  await page.locator('[data-tidy="zurueck"]').click();
  await page.waitForTimeout(400);
  console.log('>>> Zurück holt das Gelöschte wieder:',
    (await titel(page)) === beiLoeschen);
  console.log('>>> und die Karte kommt aus der Richtung zurück, in die sie ging:',
    (await page.locator('.tidy-card.tidy-karte-rein.von-unten').count()) === 1);

  await page.locator('[data-tidy="zurueck"]').click();
  await page.waitForTimeout(400);
  console.log('>>> Zurück hebt auch das Abhaken auf:',
    (await titel(page)) === beiErledigt &&
    (await zaehler(page, 'inbox')) === eingangVorSpaeter);

  // Bis zum ersten Schritt zurück: das Verschieben muss die Aufgabe an ihre
  // ALTE STELLE zurückbringen, nicht ans Ende.
  for (let i = 0; i < 6; i++) {
    if (await page.locator('[data-tidy="zurueck"]:not([disabled])').count()) {
      await page.locator('[data-tidy="zurueck"]').click();
      await page.waitForTimeout(300);
    }
  }
  console.log('>>> ganz zurück steht wieder die erste Aufgabe:',
    (await titel(page)) === ersteAufgabe);
  console.log('>>> der Bestand ist wieder der ursprüngliche:',
    (await zaehler(page, 'inbox')) === offenVorher &&
    (await zaehler(page, 'personal')) === personalVorher);
  console.log('>>> und sie steht wieder an ihrer alten Stelle, nicht am Ende:',
    await page.evaluate((t) => {
      const l = document.querySelectorAll('.nav-item[data-list="inbox"]').length;
      return l === 1;
    }, ersteAufgabe));
  console.log('>>> am Anfang lässt sich nicht weiter zurückgehen:',
    await page.locator('[data-tidy="zurueck"]').isDisabled());
  console.log('>>> und der Balken steht wieder auf null:', (await balken(page)) === 0);

  // --- Bis zum Abschlussbild durch ---------------------------------------
  for (let i = 0; i < 12; i++) {
    if (!(await page.locator('[data-tidy-liste="groceries"]').count())) break;
    await page.locator('[data-tidy-liste="groceries"]').click();
    await page.waitForTimeout(360);
  }
  console.log('>>> am Ende steht ein eigenes Bild, kein Verschwinden:',
    (await page.locator('.tidy-ende').count()) === 1);
  console.log('>>> es meldet den leeren Eingang:',
    (await page.locator('.tidy-ende-titel').innerText()) === 'Eingang leer');
  console.log('>>> und zeigt die Bilanz nach Zielliste:',
    /Einkaufen/.test(await page.locator('.tidy-ende-bilanz').innerText()));
  console.log('>>> der Balken ist voll:', (await balken(page)) === 1);
  console.log('>>> "Fertig" steht nur noch einmal auf dem Bild:',
    (await page.locator('.tidy [data-tidy="quit"]').count()) === 1);

  // --- Escape verlässt den Modus -----------------------------------------
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  console.log('>>> Escape verlässt den Aufräum-Modus:',
    (await page.locator('.tidy').count()) === 0);
  console.log('>>> der Eingang ist leer, also fehlt auch der Einstieg:',
    (await page.locator('.tidy-start').count()) === 0);

  // --- Die Bewegungssprache ist wirklich verdrahtet ----------------------
  // Zwei Regeln aus spec.md §2.8/§3, die man beim Umbauen leicht verliert.
  const css = await page.evaluate(() =>
    Array.from(document.styleSheets[0].cssRules).map((r) => r.cssText).join('\n'));
  console.log('>>> jeder Knopf gibt beim Drücken nach (:active, scale):',
    /\.tidy-btn:active[^{]*\{[^}]*scale\(0\.96\)/.test(css));
  console.log('>>> die federnde Kurve bleibt auf die Belohnungsschicht begrenzt:',
    (await page.evaluate(() => {
      const rules = Array.from(document.styleSheets[0].cssRules)
        .filter((r) => r.style && /--ease-spring/.test(r.cssText) && r.selectorText !== ':root');
      return rules.map((r) => r.selectorText);
    })).every((s) => /^\.tidy/.test(s)));

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
