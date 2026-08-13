// Probiert eine FREMDE FARBPALETTE am Mockup aus, ohne es anzufassen.
//
// Die Tokens werden nur zur Laufzeit ueberschrieben und Screenshots
// abgelegt; die Datei v1-desktop.html bleibt unveraendert. So laesst sich
// eine Palette ansehen, bevor jemand entscheidet, ob sie uebernommen wird.
//
// Heisst bewusst shot_ und nicht test_: Es prueft nichts, es zeigt etwas.
// run-mockup-tests.sh startet nur test_/measure_/verify_ und laesst es
// deshalb liegen (siehe README).
//
//   NODE_PATH=node_modules node design/mockups/tests/shot_palette.js
//
// Ausgabe: design/mockups/tests/out/palette-<name>-hell.png / -dunkel.png
// und eine Kontrolltabelle der Textkontraste auf der Konsole. Die gehoert
// dazu: Die Regel aus spec.md §3 - "accent ist als Textfarbe zu hell, fuer
// Text immer accent-strong" - gilt fuer JEDE Palette, und ob ein Ton sie
// erfuellt, sieht man ihm nicht an.
const { chromium } = require('playwright');
const path = require('path');

// ===================== Die Palette =====================================
//
// Vom Nutzer geliefert (Koernig, 2026-08-13) sind VIER Farben:
//   Sustainable Linen #FAF3E1 · Recycled Cotton #F5E7C6
//   Electric Tangerine #FF6D1F · Black Hole #222222
//
// Das Mockup braucht mehr Tokens als vier - Rahmen, Ueberfahren, leiser
// Text, Listenpunkte. Alles, was unten mit ABGELEITET markiert ist, hat
// der Nutzer NICHT vorgegeben; es ist aus den vier Tonen gerechnet und
// steht zur Diskussion.
const LINEN = '#faf3e1', COTTON = '#f5e7c6', TANGERINE = '#ff6d1f', BLACK = '#222222';

const PALETTE = {
  name: 'koernig',
  hell: {
    '--paper': COTTON,             // ausserhalb des Fensters
    '--surface': LINEN,            // Spaltenflaechen
    '--surface-sunken': COTTON,    // Sidebar
    '--line': '#e0ce9f',           // ABGELEITET
    '--line-soft': '#efe0be',      // ABGELEITET
    '--nav-hover': LINEN,          // hellt auf - Regel aus spec.md §3
    '--tree-line': '#cbb78a',      // ABGELEITET
    '--chip-bg': '#efe0be',        // ABGELEITET
    '--chip-hover': LINEN,
    '--ink': BLACK,
    '--ink-soft': '#4a4a4a',       // ABGELEITET
    // ABGELEITET. Zuerst #6b6b6b - das riss AA am Zaehler in der Sidebar
    // (4,35:1 auf Cotton). Nachgemessen und nachgezogen, nicht die
    // Zusicherung entschaerft.
    '--ink-faint': '#656565',
    '--accent': TANGERINE,
    // ABGELEITET und NOETIG: Tangerine als Text ergibt 2,54:1 auf Linen -
    // klar unter AA. Derselbe Grund, aus dem die alte Palette
    // --accent-strong hat. 65% Helligkeit des Originals, Farbton gehalten.
    '--accent-strong': '#a64714',
    '--accent-ink': LINEN,
    '--accent-soft': '#ffe3d2',    // ABGELEITET
    '--accent-line': '#ffc4a3',    // ABGELEITET
    '--urgent': '#b0301a',         // ABGELEITET
    '--urgent-soft': '#fbe4de',    // ABGELEITET
    '--done': '#656565',           // ABGELEITET
    '--done-ink': LINEN,
    // ABGELEITET, und die schwaechste Stelle: Die Palette kennt keine
    // Listenfarben. Fuenf unterscheidbare Punkte aus Tangerine und Schwarz
    // zu gewinnen geht nur ueber Helligkeit, nicht ueber Farbton.
    '--list-inbox': '#8a6a4e',
    '--list-personal': '#6f6a55',
    '--list-work': TANGERINE,
    '--list-groceries': '#4a4a4a',
    '--list-5': '#c98a3e',
    '--shadow-window': '0 30px 70px -25px rgba(34,34,34,0.35), 0 2px 8px rgba(34,34,34,0.06)'
  },
  dunkel: {
    '--paper': '#1a1a1a',          // ABGELEITET aus Black Hole
    '--surface': BLACK,
    '--surface-sunken': '#141414', // ABGELEITET
    '--line': '#3a3a3a',           // ABGELEITET
    '--line-soft': '#2e2e2e',      // ABGELEITET
    '--nav-hover': '#2e2e2e',      // ABGELEITET
    '--tree-line': '#4a4a4a',      // ABGELEITET
    '--chip-bg': BLACK,
    '--chip-hover': '#333333',     // ABGELEITET
    '--ink': LINEN,
    '--ink-soft': '#b8b0a0',       // ABGELEITET
    '--ink-faint': '#a09a8c',      // ABGELEITET
    '--accent': TANGERINE,
    // Auf Black Hole traegt Tangerine als Text (5,65:1) - hier braucht es
    // keinen zweiten Ton, anders als im hellen Modus.
    '--accent-strong': TANGERINE,
    '--accent-ink': BLACK,
    '--accent-soft': '#3a2113',    // ABGELEITET
    '--accent-line': '#5c3520',    // ABGELEITET
    '--urgent': '#e8654a',         // ABGELEITET
    '--urgent-soft': '#3a1e18',    // ABGELEITET
    '--done': '#8a8a8a',           // ABGELEITET
    '--done-ink': '#1a1a1a',
    '--list-inbox': '#bb9c86',
    '--list-personal': '#a39a83',
    '--list-work': '#ff8442',
    '--list-groceries': '#8a8a8a',
    '--list-5': '#d4a457',
    '--shadow-window': '0 30px 70px -25px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)'
  }
};

// ===================== Anwenden ========================================

const alsCss = (tokens) =>
  Object.entries(tokens).map(([k, v]) => `${k}:${v} !important;`).join('');

// Die drei Theme-Bloecke sind der dokumentierte Fallstrick (status.md §4):
// Farb-Tokens stehen in :root, in :root[data-theme="dark"] UND in der
// prefers-color-scheme-Rueckfallebene. Wer nur einen ueberschreibt, sieht
// je nach Systemeinstellung etwas anderes.
const ueberschreiben = (p) => `
  :root, :root[data-theme="light"] { ${alsCss(p.hell)} }
  :root[data-theme="dark"] { ${alsCss(p.dunkel)} }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { ${alsCss(p.dunkel)} }
  }
`;

// Kontrast an den WIRKLICH GERENDERTEN Elementen messen, nicht an den
// Token-Werten - spec.md §3 verlangt genau das. Ein Token sagt nichts
// darueber, worauf der Text am Ende liegt.
const kontraste = (page) => page.evaluate(() => {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const zahl = (s) => s.match(/\d+(\.\d+)?/g).map(Number);
  const lum = (s) => { const [r, g, b] = zahl(s); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
  const grund = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const a = zahl(bg);
      if (a.length < 4 || a[3] > 0.95) return bg;
    }
    return 'rgb(255,255,255)';
  };
  const messen = (sel, was) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    const [a, b] = [lum(s.color), lum(grund(el))].sort((x, y) => y - x);
    return { was: was, wert: +((a + 0.05) / (b + 0.05)).toFixed(2), px: parseFloat(s.fontSize) };
  };
  return [
    messen('.task-title', 'Aufgabentitel'),
    messen('.col-title', 'Spaltentitel'),
    messen('.nav-name', 'Listenname (Sidebar)'),
    messen('.nav-item.active .nav-name', 'aktive Liste (Akzenttext)'),
    messen('.nav-count', 'Zähler'),
    messen('.sec-label', 'Rubrik'),
    messen('.due-pill', 'Fälligkeits-Pille'),
    messen('.pe-line', 'Fließtext')
  ].filter(Boolean);
});

// ===================== Lauf ============================================

(async () => {
  const out = path.join(process.cwd(), 'design/mockups/tests/out');
  const browser = await chromium.launch();

  for (const modus of ['hell', 'dunkel']) {
    const page = await browser.newPage({
      viewport: { width: 1240, height: 780 }, deviceScaleFactor: 2
    });
    await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
    await page.waitForTimeout(400);
    await page.addStyleTag({ content: ueberschreiben(PALETTE) });
    await page.evaluate((m) => document.documentElement.setAttribute(
      'data-theme', m === 'hell' ? 'light' : 'dark'), modus);

    // Zwei Ansichten, weil sie verschiedene Teile der Palette zeigen: Der
    // Eingang traegt viele Zeilen und den Akzent-Knopf "Aufraeumen", eine
    // Listenseite die Listenfarbe, den Fortschrittsbalken und die Pille.
    await page.waitForTimeout(400);
    const eingang = path.join(out, `palette-${PALETTE.name}-${modus}-eingang.png`);
    await page.screenshot({ path: eingang });

    await page.click('.nav-item[data-list="personal"]');
    await page.waitForTimeout(500);

    const datei = path.join(out, `palette-${PALETTE.name}-${modus}-liste.png`);
    await page.screenshot({ path: datei });

    console.log(`\n=== ${PALETTE.name} / ${modus} ===\n  ${eingang}\n  ${datei}`);
    console.log('Textkontraste, an den gerenderten Elementen gemessen:');
    for (const k of await kontraste(page)) {
      const schwelle = k.px >= 18.66 ? 3.0 : 4.5;   // WCAG: grosse Schrift darf weniger
      console.log(
        `  ${k.was.padEnd(26)} ${String(k.wert).padStart(6)}:1  ` +
        `(${k.px}px, AA ab ${schwelle})  ${k.wert >= schwelle ? 'ok' : 'ZU SCHWACH'}`);
    }
    await page.close();
  }
  await browser.close();
})();
