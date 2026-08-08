// Löschregeln aus docs/spec.md §4.3, entschieden am 2026-08-08.
//
//   - Gelöschte Gruppe nimmt ihre Listen MIT. Solange es keinen Papierkorb
//     gibt, ist die Rückfrage zwingend - sonst wäre es unwiderruflicher
//     Datenverlust mit einem Klick.
//   - Gelöschtes hinterlässt eine Rückgängig-Zeile AN SEINER STELLE, die
//     nach fünf Sekunden weich einklappt. Die schwebende Meldung unten im
//     Fenster wurde verworfen: Sie verdeckt Inhalt und steht immer am
//     selben Ort, egal wo gelöscht wurde.
//   - Verschwindet ein Knoten aus dem Baum, schließen sich alle geöffneten
//     Spalten ab diesem Knoten.
//
// Der Kern der Rückgängig-Zeile ist, dass NICHTS SPRINGT: Der Platz bleibt
// belegt, die Liste rutscht beim Löschen nicht hoch und beim Zurückholen
// nicht wieder runter. Genau das wird hier gemessen.
const { chromium } = require('playwright');

const zweiteZeileOben = (page) =>
  page.evaluate(() => {
    const e = document.querySelectorAll('.column[data-col-index="0"] .inline-embed')[1];
    return e ? +e.getBoundingClientRect().top.toFixed(0) : null;
  });

const inboxZaehler = (page) =>
  page.locator('.nav-item[data-list="inbox"] .nav-count').innerText().then(Number);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 700 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(500);

  // --- Rückgängig-Zeile an Ort und Stelle ---
  const obenVorher = await zweiteZeileOben(page);
  const zaehlerVorher = await inboxZaehler(page);
  const titel = await page.locator('.column[data-col-index="0"] .task-title').first().innerText();

  await page.locator('.column[data-col-index="0"] .inline-embed').first().hover();
  await page.locator('.column[data-col-index="0"] .row-delete').first().click({ force: true });
  await page.waitForTimeout(400);

  console.log('>>> Löschen hinterlässt eine Rückgängig-Zeile:',
    (await page.locator('.undo-row').count()) === 1);
  console.log('>>> sie nennt, was gelöscht wurde:',
    (await page.locator('.undo-row-name').innerText()) === titel);

  const obenNachher = await zweiteZeileOben(page);
  console.log('Position der Folgezeile:', obenVorher, '->', obenNachher);
  console.log('>>> nichts springt (Folgezeile bleibt, wo sie war):',
    Math.abs(obenNachher - obenVorher) <= 2);

  console.log('>>> die Aufgabe zählt sofort nicht mehr mit:',
    (await inboxZaehler(page)) === zaehlerVorher - 1);
  console.log('>>> die Rückgängig-Zeile lässt sich nicht ziehen:',
    (await page.locator('.undo-row [data-embed-grip]').count()) === 0);

  // --- Zurückholen ---
  await page.locator('.undo-btn').click();
  await page.waitForTimeout(500);
  console.log('>>> Rückgängig stellt die Aufgabe wieder her:',
    (await inboxZaehler(page)) === zaehlerVorher);
  console.log('>>> und zwar an ihrer alten Stelle:',
    (await page.locator('.column[data-col-index="0"] .task-title').first().innerText()) === titel);
  console.log('>>> die Rückgängig-Zeile ist verschwunden:',
    (await page.locator('.undo-row').count()) === 0);

  // --- Fünf Sekunden, dann endgültig ---
  await page.locator('.column[data-col-index="0"] .inline-embed').first().hover();
  await page.locator('.column[data-col-index="0"] .row-delete').first().click({ force: true });
  await page.waitForTimeout(3400);
  console.log('>>> nach 3,4 s steht sie noch:', (await page.locator('.undo-row').count()) === 1);
  await page.waitForTimeout(2600);
  console.log('>>> nach 6 s ist sie weg:', (await page.locator('.undo-row').count()) === 0);
  console.log('>>> und die Aufgabe bleibt gelöscht:',
    (await inboxZaehler(page)) === zaehlerVorher - 1);

  // --- Gruppe löschen: Rückfrage, dann Kaskade ---
  const gruppen = () => page.evaluate(() =>
    Array.from(document.querySelectorAll('#sidebar .group-title')).map((t) => t.value));
  const listen = () => page.evaluate(() =>
    Array.from(document.querySelectorAll('#sidebar .nav-item[data-drag-id]'))
      .map((t) => t.querySelector('.nav-name').textContent));

  let frage = null;
  page.on('dialog', async (d) => { frage = d.message(); await d.dismiss(); });
  await page.locator('.group-row[data-drag-id="g1"]').hover();
  await page.locator('[data-delete-group="g1"]').click({ force: true });
  await page.waitForTimeout(500);

  console.log('>>> Löschen einer Gruppe fragt nach:', frage !== null);
  console.log('>>> die Rückfrage nennt Anzahl und Namen der Listen:',
    !!frage && /2 Listen/.test(frage) && /Persönlich/.test(frage) && /Einkaufen/.test(frage));
  console.log('>>> Abbrechen ändert nichts:',
    (await gruppen()).length === 2 && (await listen()).length === 3);

  page.removeAllListeners('dialog');
  page.on('dialog', async (d) => { await d.accept(); });
  await page.locator('.group-row[data-drag-id="g1"]').hover();
  await page.locator('[data-delete-group="g1"]').click({ force: true });
  await page.waitForTimeout(700);
  console.log('>>> Bestätigen löscht Gruppe UND ihre Listen:',
    (await gruppen()).join() === 'Arbeit' && (await listen()).join() === 'Redesign-Launch');

  // --- Spalten ab dem verschwundenen Knoten schließen ---
  await page.locator('.nav-item[data-drag-id="work"]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.column[data-col-index="0"] .task-title').first().click();
  await page.waitForTimeout(700);
  const offenVorher = await page.locator('.column').count();
  await page.locator('.column[data-col-index="0"] .inline-embed').first().hover();
  await page.locator('.column[data-col-index="0"] .row-delete').first().click({ force: true });
  await page.waitForTimeout(600);
  console.log('Spalten vorher/nachher:', offenVorher, '->', await page.locator('.column').count());
  console.log('>>> die Spalte der gelöschten Aufgabe schließt sich:',
    (await page.locator('.column').count()) === offenVorher - 1);

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
