// Kopf einer Listenspalte: Farbpunkt + Titel, ohne Aufklappmenü.
//
// Die Regel dahinter (docs/decisions.md, 2026-08-07): Umbenennen geschieht
// durch Hineinklicken und Tippen, die Farbe über den Punkt daneben. Es gibt
// bewusst KEIN schwebendes Menü - jedes Overlay verdeckt den Inhalt, den
// man gerade beurteilt, und kostet einen Klick zum Öffnen und einen zum
// Schließen.
//
// Geprüft wird:
//   1. Der Titel ist ein Eingabefeld, Tippen zieht die Sidebar sofort mit.
//   2. Der Punkt öffnet eine Farbreihe, die IM FLUSS liegt (kein Overlay).
//   3. Genau die fünf kuratierten Farben, keine sechste.
//   4. Auswählen setzt die Farbe überall und schließt die Reihe.
//   5. Die gewählte Farbe ist nicht allein über die Größe gekennzeichnet.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 820 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // Auf einer gewoehnlichen Liste, nicht im Eingang: Der ist ein Ort und
  // laesst sich weder umbenennen noch faerben (spec.md 2.0).
  await page.locator('.nav-item[data-drag-id="personal"]').first().click();
  await page.waitForTimeout(500);
  const sidebarName = () => page.locator('.nav-item[data-drag-id="personal"] .nav-name').innerText();

  // 1. Umbenennen ohne Umweg
  const titel = page.locator('.column[data-col-index="0"] .col-title');
  console.log('>>> Titel ist ein Eingabefeld:',
    (await titel.evaluate((e) => e.tagName)) === 'INPUT');
  await titel.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' 2026');
  await page.waitForTimeout(250);
  const nameJetzt = await sidebarName();
  console.log('Sidebar zeigt:', nameJetzt);
  console.log('>>> Tippen benennt die Liste sofort um (ohne Bestätigen):',
    nameJetzt === 'Persönlich 2026');

  // 2./3. Farbreihe
  await page.locator('.col-dot').click();
  await page.waitForTimeout(300);
  const strip = page.locator('.color-strip');
  const lage = await strip.evaluate((e) => {
    const s = getComputedStyle(e);
    return { position: s.position, zIndex: s.zIndex };
  });
  console.log('Farbreihe:', JSON.stringify(lage));
  console.log('>>> Farbreihe liegt im Fluss, ist kein schwebendes Fenster:',
    lage.position === 'static');
  const anzahl = await page.locator('.color-swatch').count();
  console.log('>>> genau die fünf kuratierten Farben:', anzahl === 5);

  // Die Reihe darf den Inhalt nicht überdecken - sie schiebt ihn nach unten.
  const ueberlappung = await page.evaluate(() => {
    const s = document.querySelector('.color-strip').getBoundingClientRect();
    const erste = document.querySelector('.column[data-col-index="0"] .task-row').getBoundingClientRect();
    return +(s.bottom - erste.top).toFixed(1);
  });
  console.log('Abstand Reihe zu erster Aufgabe:', ueberlappung, 'px');
  console.log('>>> Farbreihe verdeckt keine Aufgabe:', ueberlappung < 0);

  // 5. Gewählte Farbe nicht allein über Größe kodiert
  const marke = await page.locator('.color-swatch.active').evaluate((e) => {
    const s = getComputedStyle(e);
    return { schatten: s.boxShadow !== 'none', groesse: s.width };
  });
  console.log('>>> gewählte Farbe trägt einen Ring, nicht nur Größe:', marke.schatten);

  // 4. Auswählen
  //
  // Geprüft wird, dass die GEWÄHLTE Farbe in der Sidebar ankommt - nicht,
  // welche Farbe das ist. Hier stand bis 2026-08-13 der Hexwert des
  // damaligen Taubenblaus fest verdrahtet; beim Wechsel auf die
  // Koernig-Palette meldete das Skript daraufhin einen Fehler, obwohl der
  // Mechanismus tadellos lief. Eine Prüfung, die bei jedem Farbwechsel rot
  // wird, prüft die Farbe und nicht die Funktion. Jetzt wird der Punkt
  // gegen das FELD verglichen, das angeklickt wurde.
  const gewaehlt = await page.locator('.color-swatch').nth(3)
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  await page.locator('.color-swatch').nth(3).click();
  await page.waitForTimeout(350);
  const punktFarbe = await page.locator('.nav-item[data-drag-id="personal"] .nav-dot')
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  console.log('Sidebar-Punkt:', punktFarbe, '· angeklicktes Feld:', gewaehlt);
  console.log('>>> Auswahl setzt die Farbe auch in der Sidebar:',
    punktFarbe === gewaehlt);
  console.log('>>> Farbreihe schließt sich nach der Auswahl:',
    (await page.locator('.color-strip').count()) === 0);

  // Kein Rest des verworfenen Titelmenues
  console.log('>>> kein Aufklappmenü am Titel:',
    (await page.locator('.title-menu, .vz-menu').count()) === 0);

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
