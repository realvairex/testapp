// Prueft die Datenschicht des Prototyps: Bleibt eingegebene Arbeit ueber
// ein Neuladen UND einen Browser-Neustart hinweg erhalten, und gibt der
// Export das wieder, was drinsteht?
//
// Warum mit einem PERSISTENTEN Profil: Beim ersten Bauversuch lief der Test
// mit browser.newPage(). Das legt in Playwright je Aufruf einen eigenen
// Kontext an - gemessen wurde also die Isolierung des Testwerkzeugs, nicht
// der Browser. Das Ergebnis ("Speicher ueberlebt nie") war frei erfunden.
// Ein persistentes Profil ist das, was ein echter Nutzer hat.
//
// Gegengeprueft am 2026-08-13: Mit `git stash` auf das Mockup kippen fuenf
// der Zusicherungen. Der Test misst also den Einbau und nicht sich selbst.

const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROFIL = fs.mkdtempSync(path.join(os.tmpdir(), 'unfold-profil-'));
const ZIEL = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
const AUFGABE = 'PRUEFTEXT Milch kaufen';
const zeige = (l, v) => console.log('>>> ' + l + ': ' + v);

(async () => {
  const fehler = [];
  let ctx = await chromium.launchPersistentContext(PROFIL, { viewport: { width: 1280, height: 800 } });
  let page = await ctx.newPage();
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(ZIEL);
  await page.waitForTimeout(600);

  zeige('Prototyp-Leiste ist da', await page.locator('#protoLeiste').isVisible());

  // Sie darf nichts zudecken. Beim ersten Bauversuch stand sie unten und lag
  // genau auf dem Schnell-Eingabefeld - aufgefallen ist es nicht beim
  // Ansehen, sondern weil die Pruefung das Feld nicht mehr anklicken konnte.
  const kasten = async (s) => { const l = page.locator(s).first(); return (await l.count()) ? await l.boundingBox() : null; };
  const ueberlappt = (a, b) => !!a && !!b &&
    !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
  zeige('Leiste deckt das App-Fenster nicht zu',
        !ueberlappt(await kasten('#protoLeiste'), await kasten('#appWindow')));
  zeige('Leiste deckt das Eingabefeld nicht zu',
        !ueberlappt(await kasten('#protoLeiste'), await kasten('[data-quick-add]')));

  const feld = page.locator('.quick-add-input, input[placeholder], .composer input').first();
  await feld.click();
  await feld.type(AUFGABE);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  zeige('Aufgabe angelegt', (await page.locator('text=' + AUFGABE).count()) > 0);

  const roh = await page.evaluate(() => localStorage.getItem('unfold.daten'));
  zeige('etwas im Speicher', !!roh);
  const daten = roh ? JSON.parse(roh) : {};
  zeige('Schema-Version steht in den Daten', daten.schema === 1);
  zeige('Aufgabe steht im Speicher', JSON.stringify(daten.listen || []).indexOf(AUFGABE) >= 0);
  zeige('naechste ID mitgespeichert', typeof daten.naechsteId === 'number');

  await page.reload();
  await page.waitForTimeout(700);
  zeige('nach Neuladen noch da', (await page.locator('text=' + AUFGABE).count()) > 0);

  await ctx.close();
  ctx = await chromium.launchPersistentContext(PROFIL, { viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(ZIEL);
  await page.waitForTimeout(700);
  zeige('nach Browser-Neustart noch da', (await page.locator('text=' + AUFGABE).count()) > 0);

  // Der Export ist die Bruecke zur spaeteren Flutter-Datenschicht. Er muss
  // den AKTUELLEN Stand enthalten, nicht die Beispieldaten.
  const inhalt = await page.evaluate(() => {
    let gefangen = null;
    const alt = URL.createObjectURL;
    URL.createObjectURL = function (b) { gefangen = b; return 'blob:pruefung'; };
    document.getElementById('protoExport').click();
    URL.createObjectURL = alt;
    return gefangen ? gefangen.text() : null;
  });
  zeige('Export liefert eine Datei', !!inhalt);
  zeige('Export enthaelt die Aufgabe', !!inhalt && inhalt.indexOf(AUFGABE) >= 0);
  zeige('Export ist lesbares JSON mit Schema', (() => {
    try { return JSON.parse(inhalt).schema === 1; } catch (e) { return false; }
  })());

  await ctx.close();

  // --- Kaputter Stand ---------------------------------------------------
  //
  // Der kaputte Wert muss gesetzt sein, BEVOR das Seitenskript laeuft.
  // Ein `evaluate` + `reload` genuegt nicht: Das Verlassen der alten Seite
  // loest das Speichern aus und ueberschreibt den kaputten Wert, noch ehe
  // der Ladepfad ihn je zu sehen bekommt. Genau daran hat sich diese
  // Pruefung beim ersten Versuch selbst getaeuscht - sie meldete rot fuer
  // einen Weg, den sie nie betreten hatte.
  ctx = await chromium.launchPersistentContext(PROFIL, { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('unfold.daten', '{kaputt'); } catch (e) {}
  });
  page = await ctx.newPage();
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(ZIEL);
  await page.waitForTimeout(900);

  zeige('bei kaputtem Stand erscheint eine Warnung',
        await page.locator('#protoLeiste.warnt').isVisible());
  zeige('kaputter Stand wird NICHT ueberschrieben',
        (await page.evaluate(() => localStorage.getItem('unfold.daten'))) === '{kaputt');
  zeige('Rettungsweg wird angeboten', await page.locator('#protoRetten').isVisible());
  zeige('Neuanfang wird angeboten', await page.locator('#protoNeu').isVisible());

  // Auch eine Aenderung darf jetzt nichts ueberschreiben.
  const feld2 = page.locator('.quick-add-input, input[placeholder], .composer input').first();
  await feld2.click();
  await feld2.type('DARF NICHT GESPEICHERT WERDEN');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  zeige('auch nach einer Aenderung unangetastet',
        (await page.evaluate(() => localStorage.getItem('unfold.daten'))) === '{kaputt');

  zeige('keine JS-Fehler', fehler.length === 0);
  if (fehler.length) console.log('   Fehler:', fehler.slice(0, 3).join(' | '));

  await ctx.close();
  fs.rmSync(PROFIL, { recursive: true, force: true });
})();
