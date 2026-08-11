// Drei Platzierungen für den "Erledigt"-Knopf im Aufräum-Modus, zur
// Vorlage beim Nutzer (Anlass 2026-08-11: "der Erledigt-Button muss
// woanders hin und sich von der Masse abheben, dort wo er ist, ist er
// bisschen random").
//
// Die Varianten werden AM ECHTEN MOCKUP hergestellt, nicht in einer
// nachgebauten Datei: Nur so tragen sie garantiert dieselben Tokens,
// Abstände und Schriftgrößen wie das Erzeugnis. Eine Vergleichsseite, die
// vom Mockup abdriftet, führt bei der Entscheidung in die Irre.
//
// Aufruf aus dem Repo-Wurzelverzeichnis:
//   NODE_PATH="$(npm root -g)" node design/mockups/tests/shot_erledigt_varianten.js
const { chromium } = require('playwright');

// --- Variante A: mittig unten, freistehend, ÜBER der Fußzeile -----------
// Vom Nutzer ausdrücklich gewünscht. Die Rubrik "ODER" fällt weg; der Knopf
// bekommt einen eigenen Bereich mit Trennlinie darüber.
const A = `
  .tidy-rubrik.oder, .tidy-wahl.oder { display: none; }
  .v-erledigt-block {
    margin-top: var(--sp-7); padding-top: var(--sp-6);
    border-top: 1px solid var(--line-soft);
    display: flex; justify-content: center;
  }
  .v-erledigt-a {
    display: inline-flex; align-items: center; gap: var(--sp-3);
    background: var(--accent); color: var(--accent-ink);
    border: 1px solid var(--accent); border-radius: var(--r-pill);
    font: inherit; font-size: var(--fs-md); font-weight: var(--fw-strong);
    padding: 9px 20px; cursor: pointer;
    transition: transform var(--dur-fast) var(--ease);
  }
  .v-erledigt-a:active { transform: scale(0.96); }
`;

// --- Variante B: Häkchen links am Titel --------------------------------
// Die Sprache der App: Aufgaben werden überall über das Kästchen LINKS
// abgehakt. Der Modus erfände hier nichts Neues, er vergrößert nur, was
// man ohnehin kennt.
const B = `
  .tidy-rubrik.oder, .tidy-wahl.oder { display: none; }
  .tidy-card-titelzeile { display: flex; align-items: flex-start; gap: var(--sp-5); }
  .v-haken {
    flex-shrink: 0; margin-top: 3px;
    width: 26px; height: 26px; border-radius: 50%;
    border: 1.5px solid var(--accent); background: transparent; color: var(--accent);
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
    transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease,
                transform var(--dur-fast) var(--ease);
  }
  .v-haken:hover { background: var(--accent); color: var(--accent-ink); }
  .v-haken:active { transform: scale(0.92); }
  .v-haken svg { width: 13px; height: 13px; }
  .v-haken-text { font-size: var(--fs-xs); color: var(--ink-faint); margin-top: var(--sp-3); }
`;

// --- Variante C: Akzent-Pille rechts, auf Höhe des Titels ---------------
// Der Titel links, die Handlung rechts - dieselbe Achse wie "Fertig" im
// Kopf. Sie steht an der Aufgabe, nicht unter den Einordnungs-Rubriken.
const C = `
  .tidy-rubrik.oder, .tidy-wahl.oder { display: none; }
  .tidy-card-titelzeile { display: flex; align-items: flex-start; gap: var(--sp-5); }
  .tidy-card-titelzeile .tidy-card-title { flex: 1 1 auto; }
  .v-erledigt-c {
    flex-shrink: 0; margin-top: 2px;
    display: inline-flex; align-items: center; gap: var(--sp-3);
    background: var(--accent); color: var(--accent-ink);
    border: 1px solid var(--accent); border-radius: var(--r-pill);
    font: inherit; font-size: var(--fs-sm); font-weight: var(--fw-strong);
    padding: 6px 14px; cursor: pointer;
    transition: transform var(--dur-fast) var(--ease);
  }
  .v-erledigt-c:active { transform: scale(0.96); }
`;

const HAKEN = '<svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 8l3.2 3.2L12 4.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const VARIANTEN = [
  { name: 'a-mittig-unten', css: A, bau: (h) => `
      document.querySelectorAll('.tidy-rubrik')[2].classList.add('oder');
      document.querySelectorAll('.tidy-wahl')[2].classList.add('oder');
      var b = document.createElement('div');
      b.className = 'v-erledigt-block';
      b.innerHTML = '<button class="v-erledigt-a" type="button">${h} Erledigt</button>';
      document.querySelector('.tidy-card').appendChild(b);
  ` },
  { name: 'b-haken-am-titel', css: B, bau: (h) => `
      document.querySelectorAll('.tidy-rubrik')[2].classList.add('oder');
      document.querySelectorAll('.tidy-wahl')[2].classList.add('oder');
      var z = document.querySelector('.tidy-card-titelzeile');
      var k = document.createElement('button');
      k.className = 'v-haken'; k.type = 'button';
      k.setAttribute('aria-label', 'Erledigt');
      k.innerHTML = '${h}';
      z.insertBefore(k, z.firstChild);
  ` },
  { name: 'c-pille-rechts', css: C, bau: (h) => `
      document.querySelectorAll('.tidy-rubrik')[2].classList.add('oder');
      document.querySelectorAll('.tidy-wahl')[2].classList.add('oder');
      var z = document.querySelector('.tidy-card-titelzeile');
      var p = document.createElement('button');
      p.className = 'v-erledigt-c'; p.type = 'button';
      p.innerHTML = '${h} Erledigt';
      z.appendChild(p);
  ` }
];

(async () => {
  const b = await chromium.launch();
  for (const thema of ['light', 'dark']) {
    for (const v of VARIANTEN) {
      const page = await b.newPage({ viewport: { width: 1240, height: 700 } });
      await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
      await page.waitForTimeout(350);
      if (thema === 'dark') {
        await page.locator('.theme-seg-btn').first().click();
        await page.waitForTimeout(300);
      }
      await page.locator('.tidy-start').click();
      await page.waitForTimeout(450);
      await page.addStyleTag({ content: v.css });
      await page.evaluate(v.bau(HAKEN));
      await page.waitForTimeout(200);
      const datei = `design/mockups/tests/out/erledigt-${v.name}-${thema}.png`;
      await page.screenshot({ path: datei });
      console.log('geschrieben:', datei);
      await page.close();
    }
  }
  await b.close();
})();
