// Der Eingang als fester Ort und das Einsortieren per Ziehen.
//
// Die Regeln (docs/decisions.md, 2026-08-07, angeregt durch Xdo):
//   - Der Eingang ist ein ORT, keine Liste des Nutzers: keine Farbe, kein
//     Umbenennen, kein Löschen, kein Umsortieren, nicht in einer Gruppe.
//     Er steht in der Übersicht über "Heute" und ist die Startansicht.
//   - Erfassen und Einsortieren sind getrennte Vorgänge. Einsortiert wird,
//     indem man eine Aufgabe auf eine Liste in der Sidebar zieht.
//   - Im Eingang gibt es keine Bild-Leiste: Dort wird erfasst, nicht
//     gestaltet.
//
// Der heikelste Punkt ist das Verschieben: Aufgabe UND Blockverweis müssen
// mitwandern. Eines von beiden zu vergessen erzeugt eine Aufgabe, die es
// gibt, die aber nirgends steht - oder einen Verweis ins Leere.
const { chromium } = require('playwright');

const zaehler = (page, id) =>
  page.locator('.nav-item[data-list="' + id + '"] .nav-count').innerText().then(Number);

async function ziehen(page, vonGriff, aufSelektor) {
  const g = await vonGriff.boundingBox();
  const z = await page.locator(aufSelektor).boundingBox();
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
  await page.mouse.down();
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 - 10, { steps: 3 });
  await page.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 12 });
  await page.waitForTimeout(200);
  const markiert = (await page.locator(aufSelektor + '.drop-into').count()) > 0;
  await page.mouse.up();
  await page.waitForTimeout(600);
  return markiert;
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1240, height: 760 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(500);

  // --- Der Eingang als Ort ---
  console.log('>>> Startansicht ist der Eingang:',
    (await page.locator('.column .col-title').first().innerText()) === 'Eingang');
  console.log('>>> Eingang steht in der Übersicht, über "Heute":',
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#sidebar .nav-item'));
      const i = items.findIndex((e) => e.getAttribute('data-list') === 'inbox');
      const t = items.findIndex((e) => e.getAttribute('data-nav') === 'today');
      return i >= 0 && t >= 0 && i < t;
    }));
  console.log('>>> Eingang taucht nicht noch einmal unter LISTEN auf:',
    (await page.locator('.nav-item[data-drag-id="inbox"]').count()) === 0 &&
    (await page.locator('.nav-item[data-list="inbox"]').count()) === 1);
  console.log('>>> Eingang lässt sich nicht umsortieren (kein Ziehgriff):',
    (await page.locator('.nav-item[data-list="inbox"][data-drag-type]').count()) === 0);
  console.log('>>> Eingang lässt sich nicht löschen:',
    (await page.locator('[data-delete-list="inbox"]').count()) === 0);
  console.log('>>> Eingang hat keinen Farbpunkt, sondern ein Symbol:',
    (await page.locator('.nav-item[data-list="inbox"] .nav-dot').count()) === 0 &&
    (await page.locator('.nav-item[data-list="inbox"] .nav-icon').count()) === 1);
  console.log('>>> Titel des Eingangs ist nicht editierbar:',
    (await page.locator('.column .col-title').first().evaluate((e) => e.tagName)) === 'H2');
  console.log('>>> keine Farbwahl im Eingang:',
    (await page.locator('.col-dot').count()) === 0);
  console.log('>>> keine Bild-Leiste im Eingang:',
    (await page.locator('.editor-toolbar').count()) === 0);
  console.log('>>> Erfassungsfeld steht unten und lädt zum Tippen ein:',
    (await page.locator('[data-quick-add="0"]').getAttribute('placeholder')) === 'Was ist zu tun?');

  // --- Einsortieren per Ziehen ---
  const vorEingang = await zaehler(page, 'inbox');
  const vorZiel = await zaehler(page, 'personal');
  const griff = page.locator('.column[data-col-index="0"] .inline-embed').first().locator('[data-embed-grip]');
  const titel = await page.locator('.column[data-col-index="0"] .task-title').first().innerText();
  const markiert = await ziehen(page, griff, '.nav-item[data-list="personal"]');

  console.log('>>> Ablageziel wird beim Ziehen markiert:', markiert);
  const nachEingang = await zaehler(page, 'inbox');
  const nachZiel = await zaehler(page, 'personal');
  console.log('Zähler Eingang/Ziel:', vorEingang + '/' + vorZiel, '->', nachEingang + '/' + nachZiel);
  console.log('>>> Aufgabe verlässt den Eingang und kommt in der Liste an:',
    nachEingang === vorEingang - 1 && nachZiel === vorZiel + 1);

  await page.locator('.nav-item[data-list="personal"]').click();
  await page.waitForTimeout(500);
  console.log('>>> Aufgabe steht wirklich auf der Zielseite:',
    (await page.locator('.column[data-col-index="0"]').innerText()).includes(titel));

  // Gegenrichtung: zurück in den Eingang. Ein Ort, in den man nur hinein-
  // schreiben kann, wäre eine Einbahnstraße.
  //
  // Geprüft wird die Sache, nicht der Zähler: Der zählt alle verschachtelten
  // Aufgaben mit, eine Aufgabe mit vier Unteraufgaben laesst ihn also um
  // fuenf steigen. Eine Erwartung von "+1" waere hier ein Fehler der
  // Pruefung - genau das ist beim ersten Lauf passiert.
  const rueckTitel = await page.locator('.column[data-col-index="0"] .task-title').first().innerText();
  const zurueck = page.locator('.column[data-col-index="0"] .inline-embed').first().locator('[data-embed-grip]');
  await ziehen(page, zurueck, '.nav-item[data-list="inbox"]');
  await page.locator('.nav-item[data-list="inbox"]').click();
  await page.waitForTimeout(500);
  const imEingang = await page.locator('.column[data-col-index="0"]').innerText();
  console.log('>>> Aufgaben lassen sich auch zurück in den Eingang ziehen:',
    imEingang.includes(rueckTitel));

  await page.locator('.nav-item[data-list="personal"]').click();
  await page.waitForTimeout(500);
  console.log('>>> und sie stehen danach nicht mehr in der Herkunftsliste:',
    !(await page.locator('.column[data-col-index="0"]').innerText()).includes(rueckTitel));

  // --- Rueckmeldung waehrend des Ziehens ---
  // Ohne sie wirkte die Geste, als funktioniere sie nicht: Zwischen Editor
  // und Sidebar - quer durchs Fenster - gab es keinerlei Anhaltspunkt.
  await page.locator('.nav-item[data-list="inbox"]').click();
  await page.waitForTimeout(500);
  const gr = await page.locator('.column[data-col-index="0"] .inline-embed').first()
    .locator('[data-embed-grip]').boundingBox();
  const gezogen = await page.locator('.column[data-col-index="0"] .task-title').first().innerText();
  await page.mouse.move(gr.x + gr.width / 2, gr.y + gr.height / 2);
  await page.mouse.down();
  await page.mouse.move(gr.x + gr.width / 2, gr.y + gr.height / 2 - 12, { steps: 3 });
  await page.mouse.move(620, 320, { steps: 8 });
  await page.waitForTimeout(200);

  console.log('>>> ein Etikett folgt dem Zeiger:', await page.locator('.drag-label').isVisible());
  console.log('>>> das Etikett nennt die gezogene Aufgabe:',
    (await page.locator('.drag-label span').innerText()) === gezogen);
  console.log('>>> der Zeiger zeigt die Geste an:',
    await page.evaluate(() => document.body.classList.contains('is-dragging')));
  console.log('>>> die Listen zeigen sich als mögliche Ziele:',
    await page.evaluate(() => document.getElementById('sidebar').classList.contains('drop-armed')));
  console.log('>>> "Heute" wird nicht als Ziel angeboten:',
    await page.evaluate(() => {
      const h = document.querySelector('#sidebar .nav-item[data-nav="today"]');
      return !h.hasAttribute('data-list');
    }));
  console.log('>>> die Quelle bleibt sichtbar, aber gedämpft:',
    await page.evaluate(() => {
      const g = document.querySelector('.inline-embed.drag-ghost');
      return !!g && parseFloat(getComputedStyle(g).opacity) < 1;
    }));

  await page.mouse.up();
  await page.waitForTimeout(500);
  console.log('>>> nach dem Loslassen bleibt nichts zurück:',
    (await page.locator('.drag-label').count()) === 0 &&
    await page.evaluate(() => !document.body.classList.contains('is-dragging') &&
      !document.getElementById('sidebar').classList.contains('drop-armed') &&
      document.querySelectorAll('.drag-ghost').length === 0));

  console.log('>>> keine Seitenfehler:', fehler.length === 0);
  if (fehler.length) console.log(fehler);
  await b.close();
})();
