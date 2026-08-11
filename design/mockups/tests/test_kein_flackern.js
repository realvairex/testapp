// Kein Aufblitzen bei gewöhnlichen Aktionen (docs/spec.md §2.2).
//
// Anlass, 2026-08-12. Der Nutzer: *„Kalender drücken, auf die Aufgabe
// drücken, Heute auswählen usw. lösen aus, dass die Aufgabe so eine kleine
// Animation macht — sieht aus, als würde sich die Seite refreshen."*
//
// Es war beides. Die Spalte wird bei jeder Änderung neu aufgebaut, UND die
// Einblend-Animation `block-in` hing unbedingt an `.inline-embed`. Also
// blendeten sich bei jedem Klick sämtliche Aufgabenzeilen neu ein — sechs
// laufende Animationen pro Klick, gemessen mit `document.getAnimations()`.
//
// Einblenden ist für NEUE Dinge da. Dieses Skript hält fest, dass eine
// Aktion, die nichts hinzufügt, auch nichts einblenden lässt.
//
// **Warum getAnimations() und nicht ein Screenshot:** Die Bewegung ist
// 3 Pixel groß und 200 ms kurz. Auf einem Standbild ist sie unsichtbar, und
// zwei Screenshots im Abstand von 200 ms treffen sie nur mit Glück. Die
// Frage „läuft gerade eine Animation?" beantwortet der Browser dagegen
// exakt.
const { chromium } = require('playwright');

// Klickt und sieht im übernächsten Bild nach, welche benannten Animationen
// laufen. Zwei Bilder, weil die Seite im ersten neu aufgebaut wird und eine
// frisch gestartete Animation erst danach in getAnimations() auftaucht.
const animationenNach = (page, auswahl) =>
  page.evaluate((sel) => new Promise((fertig) => {
    const el = document.querySelector(sel);
    if (!el) { fertig({ FEHLT: 1 }); return; }
    el.click();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const zaehl = {};
      document.getAnimations().forEach((a) => {
        // Übergänge (transition) sind hier in Ordnung - sie bewegen einen
        // Wert, der sich wirklich geändert hat. Gesucht sind die benannten
        // Keyframe-Animationen, die etwas EINBLENDEN.
        if (a.animationName) zaehl[a.animationName] = (zaehl[a.animationName] || 0) + 1;
      });
      fertig(zaehl);
    }));
  }), auswahl);

const einblender = (z) => (z['block-in'] || 0) + (z['strip-in'] || 0);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 760 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(600);
  await page.locator('.nav-item[data-list="personal"]').click();
  await page.waitForTimeout(700);

  // Eine Seite öffnen: Die NEUE Spalte darf ihren Inhalt einblenden - er ist
  // wirklich neu. Die bereits sichtbare Spalte 0 darf es nicht.
  const beimOeffnen = await animationenNach(page, '.column[data-col-index="0"] .task-title');
  const inSpalteNull = await page.evaluate(() =>
    document.querySelectorAll('.column[data-col-index="0"] .inline-embed.ist-neu').length);
  console.log('Beim Öffnen einer Seite:', JSON.stringify(beimOeffnen),
    '| davon in der schon sichtbaren Spalte:', inSpalteNull);
  console.log('>>> die bereits sichtbare Spalte blendet nicht neu ein:', inSpalteNull === 0);
  await page.waitForTimeout(800);

  // Ab hier: Aktionen, die NICHTS hinzufügen. Sie dürfen gar nichts
  // einblenden lassen - außer dem Kalender, der sich wirklich öffnet.
  const kalender = await animationenNach(page, '[data-cal-for]');
  console.log('Kalender öffnen:', JSON.stringify(kalender));
  console.log('>>> der Kalender selbst blendet ein (er erscheint ja):',
    (kalender['strip-in'] || 0) === 1);
  console.log('>>> aber keine einzige Aufgabenzeile:', (kalender['block-in'] || 0) === 0);
  await page.waitForTimeout(800);

  const blaettern = await animationenNach(page, '[data-cal-step]');
  console.log('Im Kalender blättern:', JSON.stringify(blaettern));
  console.log('>>> Blättern blendet gar nichts ein:', einblender(blaettern) === 0);
  await page.waitForTimeout(800);

  const tag = await animationenNach(page, '.due-cal-day:not(.fremd)');
  console.log('Einen Tag wählen:', JSON.stringify(tag));
  console.log('>>> ein Datum zu setzen blendet nichts ein:', einblender(tag) === 0);
  await page.waitForTimeout(800);

  const heute = await animationenNach(page, '.due-seg-btn');
  console.log('"Heute" wählen:', JSON.stringify(heute));
  console.log('>>> "Heute" blendet nichts ein:', einblender(heute) === 0);
  await page.waitForTimeout(800);

  const haken = await animationenNach(page, '.column[data-col-index="1"] .check-btn');
  console.log('Ein Kästchen abhaken:', JSON.stringify(haken));
  console.log('>>> Abhaken blendet nichts ein:', einblender(haken) === 0);
  await page.waitForTimeout(800);

  // Gegenprobe: Was WIRKLICH neu ist, muss weiterhin einblenden. Ohne diese
  // Zusicherung wäre "keine Animation mehr" auch dadurch zu erreichen, dass
  // man sie ganz entfernt - und dann fehlte sie dort, wo sie hingehört.
  await page.locator('.column[data-col-index="1"] [data-quick-add]').fill('Frisch dazugekommen');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(60);
  const neueZeile = await page.evaluate(() => {
    const els = document.querySelectorAll('.column[data-col-index="1"] .inline-embed.ist-neu');
    return { anzahl: els.length, titel: els.length ? els[els.length - 1].innerText.trim() : '' };
  });
  console.log('Neu hinzugefügt:', JSON.stringify(neueZeile));
  console.log('>>> eine wirklich neue Zeile blendet weiterhin ein:',
    neueZeile.anzahl === 1 && /Frisch dazugekommen/.test(neueZeile.titel));

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
