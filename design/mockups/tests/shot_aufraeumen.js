// Screenshots des Aufräum-Modus in beiden Themes - zum Ansehen und
// Beurteilen, nicht zum Prüfen. Es hat keine Zusicherungen und läuft
// deshalb NICHT im Läufer mit (der nimmt nur test_/measure_/verify_).
//
// Warum es im Repo liegt: Es ist bei jeder weiteren Iteration am
// Aufräum-Modus wieder nötig, und es dann neu zu schreiben kostet mehr,
// als die Datei hier kostet. (CLAUDE.md: "Würde ich das in vier Wochen
// noch einmal brauchen? Dann sofort ins Repo.")
//
// Aufruf aus dem Repo-Wurzelverzeichnis:
//   NODE_PATH="$(npm root -g)" node design/mockups/tests/shot_aufraeumen.js
// Ergebnis: design/mockups/tests/out/tidy-*.png (nicht im Git)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 1240, height: 760 } });
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await p.waitForTimeout(300);
    if (theme === 'dark') { await p.locator('.theme-seg-btn').first().click(); await p.waitForTimeout(300); }
    await p.locator('.tidy-start').click();
    await p.waitForTimeout(500);
    await p.screenshot({ path: `design/mockups/tests/out/tidy-1-${theme}.png` });
    // zweite Karte: die mit Unteraufgaben
    await p.locator('[data-tidy-liste="work"]').click(); await p.waitForTimeout(450);
    await p.locator('[data-tidy="spaeter"]').click(); await p.waitForTimeout(450);
    await p.locator('[data-tidy="spaeter"]').click(); await p.waitForTimeout(450);
    await p.screenshot({ path: `design/mockups/tests/out/tidy-2-${theme}.png` });
    await p.locator('[data-tidy="kalender"]').click(); await p.waitForTimeout(300);
    await p.screenshot({ path: `design/mockups/tests/out/tidy-3-${theme}.png` });
    console.log(theme, 'Fehler:', errs);
    await p.close();
  }
  await b.close();
})();
