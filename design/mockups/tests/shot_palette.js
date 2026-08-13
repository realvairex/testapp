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
// Nachgeliefert am 2026-08-13: ein Rot fuer "ueberfaellig". Der Grund war
// eine Luecke, keine Vorliebe - aus Tangerine allein liess sich kein
// Warnton gewinnen, der nicht wie der Akzent aussieht.
const LINEN = '#faf3e1', COTTON = '#f5e7c6', TANGERINE = '#ff6d1f',
      BLACK = '#222222', RED = '#b43852';

// ===================== Die Listenfamilie ===============================
//
// Vorgeschlagen 2026-08-13, weil die vier Grundfarben keine hergeben:
// Fuenf Punkte allein aus Tangerine und Schwarz unterscheiden sich nur in
// der Helligkeit, und auf 8 px ist das keine Unterscheidung mehr.
//
// Zwei Zonen sind besetzt und bleiben frei: Orange (~24°) traegt der
// Akzent, Rosenrot (~347°) das Ueberfaellige. Eine Listenfarbe dort waere
// eine zweite Bedeutung in derselben Farbe.
//
// PETROL UND BLAUVIOLETT SIND AUSGESCHLOSSEN - beide standen schon einmal
// in der Reihe und wurden verworfen, weil sie "als Fremdkoerper wirkten"
// (spec.md §3). Deshalb: Erdtoene, mit genau EINEM kuehlen Anker
// (Taubenblau), der aus der bestehenden Reihe uebernommen ist.
//
// Die Toene sind in der Helligkeit angeglichen, damit kein Punkt lauter
// ruft als die anderen, und in der Buntheit gedaempft, damit sie neben
// dem Akzent nicht um Aufmerksamkeit streiten. Wie unterscheidbar sie
// tatsaechlich sind, misst der Lauf weiter unten nach - behauptet wird es
// hier nicht.

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
    '--urgent': RED,
    '--urgent-soft': '#f8e2e6',    // ABGELEITET: Tint von RED auf Linen
    '--done': '#656565',           // ABGELEITET
    '--done-ink': LINEN,
    // Listenfarben, vorgeschlagen 2026-08-13. Siehe LISTENFAMILIE unten.
    '--list-inbox': '#9b7355',     // Lehm
    '--list-personal': '#7d8a4e',  // Olive
    '--list-work': '#c1902f',      // Ocker
    '--list-groceries': '#5c7590', // Taubenblau
    '--list-5': '#4a7a5e',         // Tanne
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
    // ABGELEITET: RED selbst traegt auf Schwarz als Text nicht (3,4:1),
    // deshalb aufgehellt - derselbe Handgriff wie umgekehrt im hellen
    // Modus beim Akzent.
    '--urgent': '#e2637e',
    '--urgent-soft': '#3a1a22',    // ABGELEITET
    '--done': '#8a8a8a',           // ABGELEITET
    '--done-ink': '#1a1a1a',
    // Dieselbe Familie, aufgehellt fuer den dunklen Grund.
    '--list-inbox': '#bc9271',     // Lehm
    '--list-personal': '#9ba968',  // Olive
    '--list-work': '#ddae50',      // Ocker
    '--list-groceries': '#7e97b4', // Taubenblau
    '--list-5': '#6d9e82',         // Tanne
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
    // :not(.active) ist noetig, nicht kosmetisch: Die aktive Zeile traegt
    // Akzenttext auf Akzentflaeche. Ohne den Ausschluss misst
    // querySelector je nach Ansicht mal die gewoehnliche, mal die aktive
    // Zeile - und der Wert springt, ohne dass sich eine Farbe geaendert
    // haette.
    messen('.nav-item:not(.active) .nav-name', 'Listenname (Sidebar)'),
    messen('.nav-item.active .nav-name', 'aktive Liste (Akzenttext)'),
    messen('.nav-item:not(.active) .nav-count', 'Zähler'),
    messen('.sec-label', 'Rubrik'),
    messen('.due-pill:not(.overdue):not(.today)', 'Fälligkeits-Pille'),
    // Der Warnton auf seiner eigenen Flaeche. Er steht nur im Eingang,
    // deshalb wird dort UND auf der Listenseite gemessen und
    // zusammengefuehrt - sonst faellt genau die Farbe durchs Raster, die
    // neu dazugekommen ist.
    messen('.due-pill.today', 'Pille „heute fällig“'),
    messen('.due-pill.overdue', 'Pille „überfällig“'),
    messen('.pe-line', 'Fließtext')
  ].filter(Boolean);
});

// Wie weit liegen die Listenfarben auseinander? Gerechnet, nicht am
// gerenderten Element gemessen - und das ist hier richtig: Die Frage ist,
// ob sich die Toene UNTEREINANDER unterscheiden, nicht, wie sie auf einem
// Grund sitzen. (Beim Text ist es umgekehrt, deshalb steht der oben in
// der Seite.)
//
// Maßstab ist der Abstand in CIELAB (CIE76). Faustregel: unter 10 wird es
// auf einer kleinen Flaeche unsicher, ab etwa 20 sind zwei Punkte auch
// nebeneinander klar zwei Farben.
function labAbstand(hexA, hexB) {
  const lab = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const [r, g, b] = [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)];
    // sRGB -> XYZ (D65) -> Lab
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = (0.2126 * r + 0.7152 * g + 0.0722 * b);
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const k = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const [fx, fy, fz] = [k(X), k(Y), k(Z)];
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  };
  const [a, b] = [lab(hexA), lab(hexB)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function listenAbstaende(tokens) {
  const namen = {
    '--list-inbox': 'Lehm', '--list-personal': 'Olive', '--list-work': 'Ocker',
    '--list-groceries': 'Taubenblau', '--list-5': 'Tanne'
  };
  const keys = Object.keys(namen);
  const paare = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      paare.push({
        paar: `${namen[keys[i]]} / ${namen[keys[j]]}`,
        d: +labAbstand(tokens[keys[i]], tokens[keys[j]]).toFixed(1)
      });
    }
  }
  // Und gegen die beiden besetzten Zonen, damit keine Listenfarbe mit
  // Akzent oder Warnton verwechselt wird.
  for (const k of keys) {
    paare.push({ paar: `${namen[k]} / AKZENT`, d: +labAbstand(tokens[k], tokens['--accent']).toFixed(1) });
    paare.push({ paar: `${namen[k]} / ÜBERFÄLLIG`, d: +labAbstand(tokens[k], tokens['--urgent']).toFixed(1) });
  }
  return paare.sort((a, b) => a.d - b.d);
}

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
    const ausEingang = await kontraste(page);

    await page.click('.nav-item[data-list="personal"]');
    await page.waitForTimeout(500);

    const datei = path.join(out, `palette-${PALETTE.name}-${modus}-liste.png`);
    await page.screenshot({ path: datei });
    const ausListe = await kontraste(page);

    // Zusammenfuehren: Was auf einer der beiden Seiten vorkommt, zaehlt.
    const zusammen = [...ausEingang];
    for (const k of ausListe) if (!zusammen.some(x => x.was === k.was)) zusammen.push(k);

    console.log(`\n=== ${PALETTE.name} / ${modus} ===\n  ${eingang}\n  ${datei}`);
    console.log('Textkontraste, an den gerenderten Elementen gemessen:');
    for (const k of zusammen) {
      const schwelle = k.px >= 18.66 ? 3.0 : 4.5;   // WCAG: grosse Schrift darf weniger
      console.log(
        `  ${k.was.padEnd(26)} ${String(k.wert).padStart(6)}:1  ` +
        `(${k.px}px, AA ab ${schwelle})  ${k.wert >= schwelle ? 'ok' : 'ZU SCHWACH'}`);
    }

    const abst = listenAbstaende(PALETTE[modus]);
    console.log('Listenfarben, die vier engsten Paare (CIELAB-Abstand):');
    for (const p of abst.slice(0, 4)) {
      console.log(`  ${p.paar.padEnd(26)} ${String(p.d).padStart(6)}  ` +
        `${p.d >= 20 ? 'klar' : p.d >= 10 ? 'knapp' : 'ZU NAH'}`);
    }
    await page.close();
  }
  await browser.close();
})();
