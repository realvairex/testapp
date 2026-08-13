// Prueft die Sprung-Bewegung des Kaestchens beim Abhaken UND beim
// Zuruecknehmen - und vor allem, dass sie NICHT bei jedem Neuaufbau
// erneut losläuft.
//
// Warum die zweite Frage die wichtigere ist: Am 2026-08-12 hing eine
// Einblend-Animation ohne Bedingung an den Zeilen. Weil jede Aenderung
// alle Zeilen neu erzeugt, blendete bei JEDER Aktion alles neu ein - der
// Nutzer meldete es als "staendiges Refreshen der Liste". Eine Animation
// am ZUSTAND (.done) statt an der HANDLUNG faellt genau in diese Falle.

const { chromium } = require('playwright');
const ZIEL = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';
const zeige = (l, v) => console.log('>>> ' + l + ': ' + v);

// Welche check-pop-Animationen laufen gerade?
const pops = (page) => page.evaluate(() =>
  document.getAnimations()
    .filter(a => a.animationName === 'check-pop' && a.playState === 'running')
    .length);

(async () => {
  const fehler = [];
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => fehler.push(String(e)));
  await page.goto(ZIEL);
  await page.waitForTimeout(600);

  zeige('im Ruhezustand laeuft keine', (await pops(page)) === 0);

  const kaesten = page.locator('.check-btn');
  const wieViele = await kaesten.count();
  zeige('Kaestchen vorhanden', wieViele > 0);

  // --- Abhaken ---
  const offen = page.locator('.check-btn:not(.done)').first();
  await offen.click();
  await page.waitForTimeout(40);
  zeige('beim Abhaken laeuft GENAU eine', (await pops(page)) === 1);

  // Form und Dauer: unsere, nicht die der Vorlage
  // Achtung bei der Kurve: a.effect.getTiming().easing liefert bei einer
  // CSS-Animation immer "linear" - die Kurve haengt an den einzelnen
  // Bildern, nicht am Effekt. Diese Pruefung hat sich daran beim ersten
  // Lauf selbst getaeuscht und rot gemeldet, obwohl alles stimmte.
  // Verlaesslich ist der berechnete Stil.
  const daten = await page.evaluate(() => {
    const a = document.getAnimations().find(x => x.animationName === 'check-pop');
    const el = document.querySelector('.check-btn.gerade-abgehakt');
    const st = el ? getComputedStyle(el) : null;
    return {
      dauer: a ? Math.round(a.effect.getTiming().duration) : 0,
      kurve: st ? st.animationTimingFunction : '',
      radius: st ? st.borderRadius : '',
      breite: st ? st.width : ''
    };
  });
  zeige('Dauer ist 400ms (--dur-slow)', daten.dauer === 400);
  zeige('laeuft auf der Hauskurve --ease', daten.kurve === 'cubic-bezier(0.32, 0.72, 0, 1)');
  zeige('Form bleibt eckig (kein Kreis)', daten.radius !== '50%' && daten.radius !== daten.breite);

  await page.waitForTimeout(600);
  zeige('danach laeuft keine mehr', (await pops(page)) === 0);

  // --- Zuruecknehmen: soll ebenfalls laufen (Wunsch des Nutzers) ---
  const zu = page.locator('.check-btn.done').first();
  await zu.click();
  await page.waitForTimeout(40);
  zeige('beim Zuruecknehmen laeuft sie auch', (await pops(page)) === 1);
  await page.waitForTimeout(600);

  // --- DER Kernpunkt: kein Neuaufbau-Feuerwerk ---
  // Eine Aktion, die alles neu baut, aber KEIN Kaestchen betrifft.
  const vorher = await page.evaluate(() => document.querySelectorAll('.check-btn.done').length);
  zeige('es gibt erledigte Aufgaben zum Nachbauen', vorher > 0);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(50);
  zeige('Spaltenwechsel loest KEINE Pops aus', (await pops(page)) === 0);
  await page.waitForTimeout(500);
  await page.click('.nav-item[data-list="inbox"]');
  await page.waitForTimeout(50);
  zeige('Zurueckwechseln loest KEINE Pops aus', (await pops(page)) === 0);

  zeige('keine JS-Fehler', fehler.length === 0);
  if (fehler.length) console.log('   ', fehler.slice(0, 3).join(' | '));
  await b.close();
})();
