// Aufgaben in andere Aufgaben ziehen (= Unteraufgabe), gebaut 2026-08-13.
//
// Die zwei Festlegungen des Nutzers, die hier nachgemessen werden:
//
//   1. KEINE TIEFENGRENZE. Das Datenmodell erlaubt beliebig tiefe
//      Verschachtelung (spec.md §1), das Ziehen darf sie nicht heimlich
//      beschneiden.
//   2. DER KREISFALL WIRD GAR NICHT ERST ANGEBOTEN. Zieht man "Urlaub
//      planen" ueber ihre eigene Unteraufgabe, erscheint KEINE Markierung;
//      Loslassen tut nichts. Bewusst nicht: erlauben und hinterher meckern.
//
// Warum der Kreisfall ueberhaupt eine Rolle spielt: Ein Baum, der sich
// selbst enthaelt, laesst recomputeAncestors() im Kreis laufen. Die
// Notbremse dort ("would loop forever and freeze the whole app") ist der
// Beleg, dass die Lage erreichbar ist - hier wird geprueft, dass sie
// erst gar nicht entsteht.
//
// Gemessen wird ausschliesslich am DOM, also an dem, was der Nutzer sieht.
// Eine verschwundene Zeile ist noch kein Beweis: Geloescht saehe genauso
// aus wie eingehaengt. Deshalb wird jedes Mal auch die ZIELSEITE geoeffnet
// und nachgesehen, ob die Aufgabe dort wirklich angekommen ist.
const { chromium } = require('playwright');

const URL = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';

// --- Ablesen ---------------------------------------------------------

const titelIn = (page, col) => page.evaluate((col) => {
  const rows = document.querySelectorAll(
    `.column[data-col-index="${col}"] .inline-embed[data-embed-marker^="task:"]`);
  return Array.from(rows).map(r => {
    const t = r.querySelector('.task-title');
    return t ? t.textContent.trim() : '?';
  });
}, col);

const idVon = (page, col, titel) => page.evaluate(([col, titel]) => {
  const rows = document.querySelectorAll(
    `.column[data-col-index="${col}"] .inline-embed[data-embed-marker^="task:"]`);
  for (const r of rows) {
    const t = r.querySelector('.task-title');
    if (t && t.textContent.trim() === titel) return r.getAttribute('data-embed-marker').slice(5);
  }
  return null;
}, [col, titel]);

// "1 von 3 erledigt" - oder null, wenn die Zeile keine Unteraufgaben hat.
const fortschritt = (page, id) => page.evaluate((id) => {
  const row = document.querySelector(`[data-embed-marker="task:${id}"] .mini-progress`);
  return row ? row.getAttribute('title') : null;
}, id);

const istErledigt = (page, id) => page.evaluate((id) =>
  !!document.querySelector(`[data-embed-marker="task:${id}"] .task-row.done`), id);

// Eine gesetzte Klasse ist noch keine sichtbare Markierung: Fuer
// .inline-embed.drop-into gibt es keine eigene Regel, es greift die
// allgemeine - und .inline-embed hat overflow:hidden. Also nachsehen, was
// tatsaechlich gezeichnet wird.
const markierungGezeichnet = (page) => page.evaluate(() => {
  const el = document.querySelector('.drop-into');
  if (!el) return null;
  const s = getComputedStyle(el);
  return { schatten: s.boxShadow, flaeche: s.backgroundColor };
});

// Was zeigt die Ablagemarkierung gerade an? null = gar nichts.
const markierung = (page) => page.evaluate(() => {
  const el = document.querySelector('.drop-into, .drop-before, .drop-after');
  if (!el) return null;
  const art = ['into', 'before', 'after'].find(c => el.classList.contains('drop-' + c));
  const t = el.querySelector('.task-title');
  return { art: art, titel: t ? t.textContent.trim() : null };
});

// --- Bedienen --------------------------------------------------------

async function neueSeite(browser, fehler) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(URL);
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
  return page;
}

async function oeffne(page, col, titel) {
  const id = await idVon(page, col, titel);
  await page.locator(`[data-embed-marker="task:${id}"] .task-title`).click();
  await page.waitForTimeout(500);
  return id;
}

// Zieht die Zeile `vonId` an ihrem Griff auf die Zeile `zielId`. `wohin`
// waehlt das Drittel. Laesst den Zeiger UNTEN, damit die Markierung noch
// abgelesen werden kann - losgelassen wird mit loslassen().
async function ziehe(page, vonId, zielId, wohin) {
  const griff = await page.locator(`[data-embed-marker="task:${vonId}"] [data-embed-grip]`).boundingBox();
  const ziel = await page.locator(`[data-embed-marker="task:${zielId}"]`).boundingBox();
  const y = ziel.y + ziel.height * (wohin === 'oben' ? 0.15 : wohin === 'unten' ? 0.85 : 0.5);
  await page.mouse.move(griff.x + griff.width / 2, griff.y + griff.height / 2);
  await page.mouse.down();
  // Die Geste wird erst ab 4px senkrechter Bewegung zu einem Ziehen -
  // darunter bleibt sie ein gewoehnlicher Klick.
  await page.mouse.move(griff.x + griff.width / 2, griff.y + griff.height / 2 - 8, { steps: 4 });
  await page.mouse.move(ziel.x + ziel.width / 2, y, { steps: 14 });
  await page.waitForTimeout(80);
}

async function loslassen(page) {
  await page.mouse.up();
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch();
  const fehler = [];

  // === 1. Grundfall: eine Aufgabe wird Unteraufgabe einer anderen =====
  {
    const page = await neueSeite(browser, fehler);
    const urlaub = await idVon(page, 0, 'Urlaub planen');
    const schuhe = await idVon(page, 0, 'Laufschuhe neu kaufen');
    const vorher = await fortschritt(page, urlaub);

    await ziehe(page, schuhe, urlaub, 'mitte');
    const m = await markierung(page);
    console.log('>>> Mitte der Zeile kuendigt "hinein" an:',
      !!m && m.art === 'into' && m.titel === 'Urlaub planen', JSON.stringify(m));

    const gez = await markierungGezeichnet(page);
    console.log('gezeichnete Markierung:', JSON.stringify(gez));
    console.log('>>> und sie ist auch wirklich zu sehen:',
      !!gez && gez.schatten !== 'none' && gez.flaeche !== 'rgba(0, 0, 0, 0)');
    await loslassen(page);

    const oben = await titelIn(page, 0);
    console.log('>>> die Aufgabe steht nicht mehr auf der Listenseite:',
      oben.length === 1 && oben[0] === 'Urlaub planen', JSON.stringify(oben));

    const nachher = await fortschritt(page, urlaub);
    console.log('Fortschritt der Zielaufgabe:', vorher, '->', nachher);
    console.log('>>> das Ziel hat eine Unteraufgabe mehr:',
      vorher === '1 von 3 erledigt' && nachher === '1 von 4 erledigt');

    // Verschwunden ist nicht gleich eingehaengt - also nachsehen.
    await oeffne(page, 0, 'Urlaub planen');
    const drin = await titelIn(page, 1);
    console.log('>>> sie liegt wirklich in der Zielaufgabe:',
      drin.includes('Laufschuhe neu kaufen'), JSON.stringify(drin));
    await page.close();
  }

  // === 2. Oberes/unteres Drittel bleibt "daneben" =====================
  {
    const page = await neueSeite(browser, fehler);
    const urlaub = await idVon(page, 0, 'Urlaub planen');
    const schuhe = await idVon(page, 0, 'Laufschuhe neu kaufen');

    await ziehe(page, schuhe, urlaub, 'oben');
    const m = await markierung(page);
    console.log('>>> oberes Drittel kuendigt "davor" an:',
      !!m && m.art === 'before', JSON.stringify(m));
    await loslassen(page);

    const oben = await titelIn(page, 0);
    console.log('>>> beide bleiben nebeneinander, nur umsortiert:',
      oben.length === 2 && oben[0] === 'Laufschuhe neu kaufen', JSON.stringify(oben));
    await page.close();
  }

  // === 3. Kreisfall: die eigene Unteraufgabe bietet nichts an =========
  {
    const page = await neueSeite(browser, fehler);
    const urlaub = await oeffne(page, 0, 'Urlaub planen');
    const fluege = await idVon(page, 1, 'Flüge vergleichen');

    await ziehe(page, urlaub, fluege, 'mitte');
    console.log('>>> ueber der eigenen Unteraufgabe erscheint KEINE Markierung:',
      (await markierung(page)) === null);
    await loslassen(page);

    const oben = await titelIn(page, 0);
    console.log('>>> Loslassen aendert nichts:',
      oben.length === 2 && oben[0] === 'Urlaub planen', JSON.stringify(oben));
    console.log('>>> die Zielaufgabe hat keine Unteraufgabe dazubekommen:',
      (await fortschritt(page, fluege)) === '1 von 2 erledigt');
    await page.close();
  }

  // === 4. Kreisfall ueber zwei Ebenen (der Enkel) =====================
  {
    const page = await neueSeite(browser, fehler);
    const urlaub = await oeffne(page, 0, 'Urlaub planen');
    await oeffne(page, 1, 'Flüge vergleichen');
    const enkel = await idVon(page, 2, 'Preise auf Skyscanner checken');

    await ziehe(page, urlaub, enkel, 'mitte');
    console.log('>>> auch zwei Ebenen tiefer erscheint KEINE Markierung:',
      (await markierung(page)) === null);
    await loslassen(page);
    console.log('>>> auch hier aendert Loslassen nichts:',
      (await titelIn(page, 0)).length === 2);
    await page.close();
  }

  // === 5. Keine Tiefengrenze ==========================================
  // Die vierte Ebene muss genauso entstehen koennen wie die zweite.
  {
    const page = await neueSeite(browser, fehler);
    const schuhe = await idVon(page, 0, 'Laufschuhe neu kaufen');
    await oeffne(page, 0, 'Urlaub planen');
    await oeffne(page, 1, 'Flüge vergleichen');
    const enkel = await idVon(page, 2, 'Preise auf Skyscanner checken');

    // Ebene 1 Liste > 2 Urlaub > 3 Fluege > 4 Preise > 5 Laufschuhe
    await ziehe(page, schuhe, enkel, 'mitte');
    await loslassen(page);
    console.log('>>> eine fuenfte Ebene laesst sich anlegen:',
      (await fortschritt(page, enkel)) === '0 von 1 erledigt');

    await oeffne(page, 2, 'Preise auf Skyscanner checken');
    console.log('>>> und sie steht dort, wo sie hingehoert:',
      (await titelIn(page, 3)).includes('Laufschuhe neu kaufen'),
      JSON.stringify(await titelIn(page, 3)));
    await page.close();
  }

  // === 6. Fremde Spalte: die ganze Zeile ist "hinein" =================
  // Dort gibt es kein "daneben" zu treffen, also darf auch das obere
  // Drittel nicht ins Leere laufen.
  {
    const page = await neueSeite(browser, fehler);
    const schuhe = await idVon(page, 0, 'Laufschuhe neu kaufen');
    await oeffne(page, 0, 'Urlaub planen');
    const unterkunft = await idVon(page, 1, 'Unterkunft aussuchen');

    await ziehe(page, schuhe, unterkunft, 'oben');
    const m = await markierung(page);
    console.log('>>> in einer fremden Spalte meldet auch das obere Drittel "hinein":',
      !!m && m.art === 'into' && m.titel === 'Unterkunft aussuchen', JSON.stringify(m));
    await loslassen(page);
    console.log('>>> und die Aufgabe landet dort:',
      (await fortschritt(page, unterkunft)) === '0 von 1 erledigt');
    await page.close();
  }

  // === 7. Die Erledigt-Kaskade wird in BEIDE Richtungen nachgezogen ===
  // spec.md §2.2: Eine Aufgabe gilt genau dann als erledigt, wenn sie
  // mindestens eine Unteraufgabe hat und alle erledigt sind. Wandert eine
  // ERLEDIGTE Aufgabe unter eine unerledigte ohne Kinder, wird diese
  // dadurch fertig - und der bisherige Besitzer verliert eine erledigte.
  {
    const page = await neueSeite(browser, fehler);
    const schuhe = await idVon(page, 0, 'Laufschuhe neu kaufen');
    const urlaub = await oeffne(page, 0, 'Urlaub planen');
    const versicherung = await idVon(page, 1, 'Reiseversicherung abschließen');

    console.log('>>> Ausgangslage: das Ziel ist unerledigt und ohne Unteraufgaben:',
      (await istErledigt(page, schuhe)) === false && (await fortschritt(page, schuhe)) === null);

    await ziehe(page, versicherung, schuhe, 'mitte');
    await loslassen(page);

    console.log('>>> das Ziel wird durch die erledigte Unteraufgabe selbst fertig:',
      (await istErledigt(page, schuhe)) === true);
    console.log('>>> und zeigt sie als vollen Fortschritt:',
      (await fortschritt(page, schuhe)) === '1 von 1 erledigt');
    console.log('>>> der bisherige Besitzer zaehlt sie nicht mehr mit:',
      (await fortschritt(page, urlaub)) === '0 von 2 erledigt');
    await page.close();
  }

  console.log('>>> keine JavaScript-Fehler:', fehler.length === 0,
    JSON.stringify(fehler));
  await browser.close();
})();
