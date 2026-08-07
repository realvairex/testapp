// Der "+"-Knopf einer Gruppe (Liste in dieser Gruppe anlegen) hebt sich
// beim Ueberfahren NUR ueber die Icon-Farbe hervor - ohne Flaeche.
//
// Warum das eine Regel ist und keine Laune: Der Knopf sitzt unmittelbar
// neben dem Papierkorb. Bekommt er dieselbe gefuellte Flaeche, sieht das
// harmlose Anlegen einer Liste so gewichtig aus wie das Loeschen daneben,
// und die Gruppenzeile wirkt unruhig. Die optische Gewichtung soll die
// Tragweite der Aktion abbilden.
//
// Der Papierkorb behaelt seine Flaeche - er ist die folgenschwere Aktion.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  const groupRow = page.locator('.group-row').first();
  await groupRow.hover();
  await page.waitForTimeout(200);

  const read = async (sel) => {
    await page.locator(sel).first().hover();
    await page.waitForTimeout(250); // Farbuebergang abwarten (--dur-fast)
    return page.locator(sel).first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, opacity: s.opacity };
    });
  };

  const plus = await read('.group-actions [data-add-list-to]');
  const trash = await read('.group-actions .nav-delete:not([data-add-list-to])');

  const transparent = (c) => c === 'transparent' || /rgba\(0,\s*0,\s*0,\s*0\)/.test(c);

  console.log('plus  :', JSON.stringify(plus));
  console.log('trash :', JSON.stringify(trash));

  console.log('>>> "+" bleibt beim Hovern flaechenlos:', transparent(plus.bg));
  console.log('>>> "+" wechselt beim Hovern die Icon-Farbe:',
    plus.color !== trash.color && !/rgb\(92,\s*98,\s*107\)/.test(plus.color));
  console.log('>>> Papierkorb behaelt seine Flaeche:', !transparent(trash.bg));
  console.log('>>> beide sind bei Gruppen-Hover sichtbar:',
    plus.opacity === '1' && trash.opacity === '1');

  await b.close();
})();
