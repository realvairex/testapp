// Fälligkeit im Kopf einer Aufgabenseite: dauerhaft sichtbare Zeile aus
// Schnellwahl (Heute/Morgen) und einem Chip für jedes andere Datum.
//
// Die Regeln dahinter (docs/decisions.md, 2026-08-07):
//   - Kein Aufklappmenü. Der Zustand ist ohne Klick ablesbar.
//   - "Nächste Woche" ist bewusst NICHT dabei: Für einen Termin in einer
//     Woche greift man ohnehin zum Kalender, und die Breite braucht die
//     Zeile in der schmalsten Spalte.
//   - Der Chip wiederholt die Schnellwahl nicht, sondern ergänzt sie um das
//     konkrete Datum.
//   - Überfälliges trägt zusätzlich einen Rahmen (spec.md §4.2): Farbe darf
//     nie der einzige Träger einer Information sein.
//
// Der wichtigste Punkt ist der letzte: Die Zeile muss in die SCHMALSTE
// Spalte passen (drei offene Spalten). Ein früherer Entwurf mit drei
// Schnellwahl-Feldern tat das nicht - der Chip wurde abgeschnitten.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 820 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // Eine verschachtelte Aufgabe öffnen, damit drei Spalten stehen.
  await page.locator('.nav-item[data-drag-id="personal"]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.column[data-col-index="0"] .task-row').first().click();
  await page.waitForTimeout(600);
  await page.locator('.column[data-col-index="1"] .task-row').first().click();
  await page.waitForTimeout(700);
  const spalten = await page.locator('.column').count();
  console.log('offene Spalten:', spalten);

  const letzte = page.locator('.column').last();
  const chipText = () => letzte.locator('.due-chip-label span').innerText();

  console.log('>>> Zeile ist ohne Klick sichtbar:', await letzte.locator('.due-row').isVisible());
  console.log('>>> kein Aufklappmenü mehr vorhanden:',
    (await page.locator('.due-menu, .due-add, .due-opt').count()) === 0);

  const felder = await letzte.locator('.due-seg-btn').allInnerTexts();
  console.log('Schnellwahl:', JSON.stringify(felder));
  console.log('>>> genau zwei Schnellwahl-Felder, Heute und Morgen:',
    felder.length === 2 && felder.join(',') === 'Heute,Morgen');
  console.log('>>> "Nächste Woche" ist entfernt:', !felder.join(',').includes('Woche'));

  // Passt die Zeile in die schmalste Spalte? Das ist der Punkt, an dem der
  // erste Entwurf gescheitert ist.
  const passt = await page.evaluate(() => {
    const cols = document.querySelectorAll('.column');
    const c = cols[cols.length - 1];
    const row = c.querySelector('.due-row');
    const cb = c.getBoundingClientRect(), rb = row.getBoundingClientRect();
    return {
      ueberstand: +(rb.right - cb.right).toFixed(1),
      zeilen: +(rb.height / 30).toFixed(2),
      spaltenbreite: +cb.width.toFixed(1),
    };
  });
  console.log('engster Fall:', JSON.stringify(passt));
  console.log('>>> Zeile passt in die schmalste Spalte:', passt.ueberstand < 0);

  // Zustände durchspielen
  await letzte.locator('.due-seg-btn').nth(0).click();
  await page.waitForTimeout(350);
  const heuteAktiv = await page.locator('.column').last().locator('.due-seg-btn').nth(0)
    .evaluate((e) => e.classList.contains('active'));
  const textHeute = await page.locator('.column').last().locator('.due-chip-label span').innerText();
  console.log('Chip bei "Heute":', textHeute);
  console.log('>>> "Heute" wird als aktiv markiert:', heuteAktiv);
  console.log('>>> Chip wiederholt das Wort nicht, sondern nennt das Datum:',
    !/Heute|Morgen/.test(textHeute) && /\d/.test(textHeute));

  await page.locator('.column').last().locator('.due-seg-btn').nth(1).click();
  await page.waitForTimeout(350);
  console.log('>>> Umschalten auf "Morgen" ändert das Datum:',
    (await page.locator('.column').last().locator('.due-chip-label span').innerText()) !== textHeute);

  await page.locator('.column').last().locator('.due-chip-x').click();
  await page.waitForTimeout(350);
  console.log('>>> das ✕ entfernt die Fälligkeit:',
    (await page.locator('.column').last().locator('.due-chip-label span').innerText()) === 'Datum wählen');

  // Überfälliges: eigener Rahmen, nicht nur Farbe. Die Inbox-Aufgabe
  // "Rauchmelder" ist im Datenbestand überfällig.
  // Erst die offenen Spalten schliessen: sonst steht Spalte 0 hinter dem
  // waagerechten Bildlauf und der Klick trifft den Fensterrahmen.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.locator('.nav-item[data-drag-id="inbox"]').first().click();
  await page.waitForTimeout(600);
  await page.locator('.column[data-col-index="0"] .task-row').nth(1).click();
  await page.waitForTimeout(700);
  const ueber = await page.locator('.column').last().locator('.due-chip').evaluate((e) => ({
    klassen: e.className,
    rahmen: getComputedStyle(e).boxShadow,
  }));
  console.log('überfälliger Chip:', JSON.stringify(ueber));
  console.log('>>> Überfälliges trägt zusätzlich einen Rahmen:',
    ueber.klassen.includes('overdue') && ueber.rahmen !== 'none');

  // --- Kalender ---
  // Er klappt IM FLUSS unter der Zeile auf, nicht als schwebendes Fenster.
  // Das ist kein Schönheitspunkt: Ein Overlay am rechten Fensterrand wird
  // abgeschnitten (am 2026-08-07 an zwei Entwürfen gemessen), ein Element
  // im Fluss kann das per Konstruktion nicht.
  await page.locator('.column').last().locator('.due-chip-label').click();
  await page.waitForTimeout(450);
  const kal = page.locator('.due-cal');
  console.log('>>> Klick auf den Chip öffnet einen Kalender:', await kal.isVisible());
  console.log('>>> Kalender liegt im Fluss, ist kein schwebendes Fenster:',
    (await kal.evaluate((e) => getComputedStyle(e).position)) === 'static');

  const kalMasse = await page.evaluate(() => {
    const cols = document.querySelectorAll('.column');
    const c = cols[cols.length - 1];
    const cal = c.querySelector('.due-cal');
    const cb = c.getBoundingClientRect(), kb = cal.getBoundingClientRect();
    return { spalte: +cb.width.toFixed(1), kalender: +kb.width.toFixed(1), ueberstand: +(kb.right - cb.right).toFixed(1) };
  });
  console.log('Kalender:', JSON.stringify(kalMasse));
  console.log('>>> Kalender passt in die Spalte:', kalMasse.ueberstand < 0);

  console.log('>>> Woche beginnt am Montag:',
    (await page.locator('.due-cal-wd').first().innerText()) === 'Mo');
  console.log('>>> heutiger Tag ist eigens markiert:',
    (await page.locator('.due-cal-day.heute').count()) === 1);

  const monatVorher = await page.locator('.due-cal-month').innerText();
  await page.locator('[data-cal-step="1"]').click();
  await page.waitForTimeout(350);
  const monatNachher = await page.locator('.due-cal-month').innerText();
  console.log('Monatswechsel:', monatVorher, '->', monatNachher);
  console.log('>>> Monat lässt sich blättern:', monatVorher !== monatNachher);

  await page.locator('.due-cal-day').nth(20).click();
  await page.waitForTimeout(400);
  console.log('>>> Auswahl setzt das Datum und schließt den Kalender:',
    (await page.locator('.due-cal').count()) === 0 &&
    /\d+\.\s\w+/.test(await page.locator('.column').last().locator('.due-chip-label span').innerText()));

  console.log('>>> kein natives Datumsfeld mehr in der Oberfläche:',
    (await page.locator('input[type="date"]').count()) === 0);

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
