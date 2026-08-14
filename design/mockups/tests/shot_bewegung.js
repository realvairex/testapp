// Fotografiert eine Bewegung Bild fuer Bild.
//
//   NODE_PATH="$(npm root -g)" node design/mockups/tests/shot_bewegung.js \
//       ".check-btn:not(.done)" check-pop
//
//   Argument 1: was angeklickt wird (CSS-Auswahl)
//   Argument 2: Name der Animation, die dabei laufen soll
//   Argument 3: optional, Vergroesserung (Standard 4)
//
// Warum es das gibt: `document.getAnimations()` sagt, DASS etwas laeuft
// und wie lange - aber nicht, wie es aussieht. Ein Standbild wiederum
// zeigt nur den Ruhezustand. Beides zusammen fehlte, als der Nutzer am
// 2026-08-13 die Sprung-Bewegung des Kaestchens beurteilen sollte: Eine
// Beschreibung in Worten ist dafuer wertlos, und ein einzelnes Bild auch.
//
// Das Skript haelt die Animation an und greift sie an mehreren
// Zeitpunkten ab. So laesst sich eine Bewegung ansehen, ohne sie in
// Zeitlupe nachstellen zu muessen - und der Nutzer entscheidet am Bild
// statt an meiner Beschreibung.
//
// Es prueft nichts und wird deshalb vom Laeufer nicht gestartet (shot_).

const { chromium } = require('playwright');
const path = require('path');

const auswahl = process.argv[2] || '.check-btn:not(.done)';
const animation = process.argv[3] || 'check-pop';
const zoom = parseFloat(process.argv[4] || '4');
const AUS = path.join(process.cwd(), 'design/mockups/tests/out');

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: zoom });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(600);

  const ziel = page.locator(auswahl).first();
  if (!(await ziel.count())) { console.log('Nichts gefunden fuer:', auswahl); await b.close(); return; }
  const bb = await ziel.boundingBox();
  const rand = 14;
  const clip = { x: bb.x - rand, y: bb.y - rand, width: bb.width + 2 * rand, height: bb.height + 2 * rand };

  await ziel.click();
  await page.waitForTimeout(20);

  const dauer = await page.evaluate((name) => {
    const a = document.getAnimations().find(x => x.animationName === name);
    return a ? Math.round(a.effect.getTiming().duration) : 0;
  }, animation);

  if (!dauer) {
    console.log('Keine laufende Animation namens "' + animation + '" gefunden.');
    console.log('Laufende:', await page.evaluate(() =>
      document.getAnimations().map(a => a.animationName || a.transitionProperty).join(', ')));
    await b.close();
    return;
  }

  const namen = [];
  for (const t of [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * dauer))) {
    await page.evaluate(([name, ms]) => {
      const a = document.getAnimations().find(x => x.animationName === name);
      if (a) { a.pause(); a.currentTime = ms; }
    }, [animation, t]);
    await page.waitForTimeout(60);
    const datei = `bewegung-${animation}-${String(t).padStart(4, '0')}ms.png`;
    await page.screenshot({ path: path.join(AUS, datei), clip });
    namen.push(datei);
  }

  console.log(`${animation}: ${dauer}ms, ${namen.length} Bilder in design/mockups/tests/out/`);
  namen.forEach(n => console.log('   ' + n));
  await b.close();
})();
