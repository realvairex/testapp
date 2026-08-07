// Vorschau-Bilder für zwei Entwürfe, die noch NICHT entschieden sind.
//
//   Entwurf 1 — Titel mit Aufklapp-Menü (Umbenennen · Farbe · Gruppe · Löschen)
//   Entwurf 2 — Fälligkeit als segmentierte Zeile statt fünfzeiligem Menü,
//               in zwei Spielarten: (a) dauerhaft im Kopf, (b) im Menü
//
// Absichtlich als Einblendung zur Laufzeit gebaut, nicht als Änderung am
// Mockup: Der veröffentlichte Stand bleibt unberührt, es entsteht keine
// halbfertige zweite Fassung, und wird der Entwurf verworfen, ist nur
// diese Datei zu löschen.
//
//   node design/mockups/proposals/vorschau-entwuerfe.js [Zielverzeichnis]
//
// Ohne Argument landen die Bilder in design/mockups/tests/out/ (nicht im Git).
const { chromium } = require('playwright');
const path = require('path');

const OUT = process.argv[2] || path.join('design', 'mockups', 'tests', 'out');
const MOCKUP = 'file://' + process.cwd() + '/design/mockups/v1-desktop.html';

// Icons in der Strichstärke des Projekts: entscheidend ist
// stroke-width × (Anzeigegröße ÷ viewBox) = 1,25px. Bei viewBox 15 und
// 14px Anzeige sind das 1,34.
const ico = (d) =>
  '<svg width="14" height="14" viewBox="0 0 15 15" fill="none" style="flex-shrink:0">' +
  d.map((p) => '<path d="' + p + '" stroke="currentColor" stroke-width="1.34" stroke-linecap="round" stroke-linejoin="round"/>').join('') +
  '</svg>';

const ICO_PENCIL = ico(['M10.2 2.6l2.2 2.2M3 12l.6-2.4L10 3.2l2.2 2.2-6.4 6.4L3 12z']);
const ICO_COLOR = ico(['M7.5 2.2a5.3 5.3 0 100 10.6 1.6 1.6 0 001.2-2.7 1.6 1.6 0 011.2-2.7h1.3a2.6 2.6 0 002.6-2.6C13.8 3.2 11 2.2 7.5 2.2z']);
const ICO_FOLDER = ico(['M1.9 4.3c0-.6.4-1 1-1h2.6l1.1 1.3h6.5c.6 0 1 .4 1 1v5.3c0 .6-.4 1-1 1H2.9c-.6 0-1-.4-1-1V4.3z']);
const ICO_TRASH = ico(['M2.6 4h9.8M6 4V2.9c0-.3.3-.6.6-.6h1.8c.3 0 .6.3.6.6V4M3.6 4l.7 8a1.1 1.1 0 001.1 1h4.2a1.1 1.1 0 001.1-1l.7-8']);
const ICO_CAL = ico(['M2.6 4.6c0-.6.4-1 1-1h7.8c.6 0 1 .4 1 1v6.8c0 .6-.4 1-1 1H3.6c-.6 0-1-.4-1-1V4.6zM2.6 6.6h9.8M5.2 2.6v2M9.8 2.6v2']);
const ICO_X = ico(['M4.2 4.2l6.6 6.6M10.8 4.2l-6.6 6.6']);
const ICO_CHEV = ico(['M4.4 6l3.1 3.1L10.6 6']);

const CSS = `
/* --- Entwurf 1: Titel als Menü --- */
.vz-title-wrap { position: relative; display: flex; align-items: center; gap: 4px; min-width: 0; }
.vz-chevron {
  width: 22px; height: 22px; padding: 0; border: none; background: transparent;
  color: var(--ink-faint); border-radius: var(--r-sm); cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}
.vz-chevron:hover { background: var(--line-soft); color: var(--ink); }
.vz-menu {
  position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; min-width: 218px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg);
  box-shadow: var(--el-2); padding: 6px; display: flex; flex-direction: column; gap: 2px;
}
.vz-opt {
  display: flex; align-items: center; gap: 9px; width: 100%;
  font: inherit; font-size: var(--fs-sm); text-align: left; color: var(--ink);
  background: transparent; border: none; border-radius: var(--r-md);
  padding: 7px 8px; cursor: pointer;
}
.vz-opt svg { color: var(--ink-faint); }
.vz-opt:hover { background: var(--line-soft); }
.vz-opt.vz-hovered { background: var(--line-soft); }
.vz-sep { height: 1px; background: var(--line-soft); margin: 4px 2px; }
.vz-danger, .vz-danger svg { color: var(--urgent); }
.vz-danger:hover { background: var(--urgent-soft); }
/* Farbpunkte in der Zeile "Farbe ändern" */
.vz-dots { display: flex; gap: 4px; margin-left: auto; }
.vz-dot { width: 9px; height: 9px; border-radius: 50%; }

/* --- Entwurf 2: Fälligkeit als eine Zeile --- */
.vz-due-row { display: flex; align-items: center; gap: var(--sp-4); flex-wrap: wrap; }
.vz-seg {
  display: flex; background: var(--surface-sunken); border: 1px solid var(--line);
  border-radius: var(--r-md); padding: 4px;
}
.vz-seg-btn {
  border: none; background: transparent; color: var(--ink-soft);
  font: inherit; font-size: var(--fs-sm); font-weight: var(--fw-medium);
  padding: 5px 11px; border-radius: var(--r-sm); cursor: pointer; white-space: nowrap;
}
.vz-seg-btn.active { background: var(--surface); color: var(--ink); font-weight: var(--fw-strong); box-shadow: var(--el-1); }
.vz-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: var(--fs-xs); font-weight: var(--fw-strong); font-variant-numeric: tabular-nums;
  background: var(--line-soft); color: var(--ink-soft);
  border: none; border-radius: var(--r-pill); padding: 5px 9px; cursor: pointer;
}
.vz-chip.set { background: var(--accent-soft); color: var(--accent-strong); }
.vz-chip-x { display: flex; opacity: 0.55; margin-left: 1px; margin-right: -2px; }
.vz-chip-x:hover { opacity: 1; }
.vz-chip-x svg { width: 11px; height: 11px; }
/* Umbruch verbieten: bricht die Zeile, ist sie zu breit - und das soll
   auffallen, statt sich still in zwei Zeilen zu verstecken. */
.vz-due-row { flex-wrap: nowrap; }
`;

const MENU_HTML = `
<div class="vz-menu">
  <button class="vz-opt">${ICO_PENCIL}Umbenennen</button>
  <button class="vz-opt vz-hovered">${ICO_COLOR}Farbe ändern
    <span class="vz-dots">
      <span class="vz-dot" style="background:var(--list-inbox)"></span>
      <span class="vz-dot" style="background:var(--list-personal)"></span>
      <span class="vz-dot" style="background:var(--list-work)"></span>
    </span>
  </button>
  <button class="vz-opt">${ICO_FOLDER}In Gruppe verschieben</button>
  <div class="vz-sep"></div>
  <button class="vz-opt vz-danger">${ICO_TRASH}Liste löschen</button>
</div>`;

const dueRow = (mitDatum) => `
<div class="vz-due-row">
  <div class="vz-seg">
    <button class="vz-seg-btn">Heute</button>
    <button class="vz-seg-btn${mitDatum ? ' active' : ''}">Morgen</button>
    <button class="vz-seg-btn">Nächste Woche</button>
  </div>
  <button class="vz-chip${mitDatum ? ' set' : ''}">${ICO_CAL}${mitDatum ? '6. Aug' : 'Datum wählen'}${mitDatum ? `<span class="vz-chip-x" title="Fälligkeit entfernen">${ICO_X}</span>` : ''}</button>
</div>`;

async function neueSeite(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 1240, height: 820 } });
  await page.goto(MOCKUP);
  await page.waitForTimeout(400);
  await page.click(`[data-set-theme="${theme}"]`);
  await page.waitForTimeout(350);
  await page.addStyleTag({ content: CSS });
  return page;
}

(async () => {
  const browser = await chromium.launch();
  const bilder = [];

  // --- Entwurf 1: Titelmenü, beide Themes ---
  for (const theme of ['light', 'dark']) {
    const page = await neueSeite(browser, theme);
    await page.evaluate((menu) => {
      const h = document.querySelector('.column[data-col-index="0"] .col-header-top');
      const titel = h.querySelector('.col-title');
      const wrap = document.createElement('div');
      wrap.className = 'vz-title-wrap';
      titel.replaceWith(wrap);
      wrap.appendChild(titel);
      wrap.insertAdjacentHTML('beforeend',
        '<button class="vz-chevron">' +
        '<svg width="14" height="14" viewBox="0 0 15 15" fill="none">' +
        '<path d="M4.4 6l3.1 3.1L10.6 6" stroke="currentColor" stroke-width="1.34" stroke-linecap="round" stroke-linejoin="round"/></svg></button>');
      wrap.insertAdjacentHTML('beforeend', menu);
    }, MENU_HTML);
    await page.waitForTimeout(250);
    const p = path.join(OUT, `vorschau-1-titelmenue-${theme}.png`);
    await page.locator('.column[data-col-index="0"]').screenshot({ path: p });
    bilder.push(p);
    await page.close();
  }

  // --- Entwurf 2: Fälligkeit, zwei Spielarten ---
  // (a) dauerhaft sichtbare Zeile im Kopf der Aufgabenseite
  {
    const page = await neueSeite(browser, 'light');
    await page.locator('.column[data-col-index="0"] .task-row').first().click();
    await page.waitForTimeout(700);
    await page.evaluate((html) => {
      const row = document.querySelector('.column[data-col-index="1"] .col-progress-row');
      row.innerHTML = html;
    }, dueRow(true));
    await page.waitForTimeout(250);
    const p = path.join(OUT, 'vorschau-2a-faelligkeit-dauerhaft.png');
    await page.locator('.column[data-col-index="1"]').screenshot({ path: p });
    bilder.push(p);
    await page.close();
  }

  // (b) dieselbe Zeile, aber erst nach Klick auf die Pille - ersetzt die
  //     bisherigen fuenf Menuezeilen
  {
    const page = await neueSeite(browser, 'light');
    await page.locator('.column[data-col-index="0"] .task-row').first().click();
    await page.waitForTimeout(700);
    await page.locator('.column[data-col-index="1"] .due-trigger').first().click();
    await page.waitForTimeout(350);
    await page.evaluate((html) => {
      const menu = document.querySelector('.column[data-col-index="1"] .due-menu');
      menu.style.minWidth = '0';
      menu.style.padding = '8px';
      menu.innerHTML = html;
    }, dueRow(true));
    await page.waitForTimeout(250);
    const p = path.join(OUT, 'vorschau-2b-faelligkeit-menue.png');
    await page.locator('.column[data-col-index="1"]').screenshot({ path: p });
    bilder.push(p);
    await page.close();
  }

  // Der engste Fall: drei Spalten offen, jede also am schmalsten. Dafuer
  // braucht es eine verschachtelte Aufgabe - "Urlaub planen" in
  // "Persoenlich" hat Unteraufgaben, die erste Inbox-Aufgabe nicht.
  {
    const page = await neueSeite(browser, 'light');
    await page.locator('.nav-item[data-drag-id="personal"]').first().click();
    await page.waitForTimeout(600);
    await page.locator('.column[data-col-index="0"] .task-row').first().click();
    await page.waitForTimeout(700);
    await page.locator('.column[data-col-index="1"] .task-row').first().click();
    await page.waitForTimeout(700);
    const spalten = await page.locator('.column').count();
    await page.evaluate((html) => {
      const cols = document.querySelectorAll('.column');
      const letzte = cols[cols.length - 1];
      const row = letzte.querySelector('.col-progress-row');
      if (row) row.innerHTML = html;
    }, dueRow(true));
    await page.waitForTimeout(250);
    const p = path.join(OUT, 'vorschau-2a-faelligkeit-eng.png');
    await page.locator('.app-window').screenshot({ path: p });
    bilder.push(p);
    console.log('  (engster Fall: ' + spalten + ' Spalten offen)');
    await page.close();
  }

  // Gegenprobe: haelt Variante (b) den engsten Fall aus? Das Menue
  // schwebt, kann also breiter sein als die Spalte - anders als (a).
  {
    const page = await neueSeite(browser, 'light');
    await page.locator('.nav-item[data-drag-id="personal"]').first().click();
    await page.waitForTimeout(600);
    await page.locator('.column[data-col-index="0"] .task-row').first().click();
    await page.waitForTimeout(700);
    await page.locator('.column[data-col-index="1"] .task-row').first().click();
    await page.waitForTimeout(700);
    const cols = await page.locator('.column').count();
    await page.locator('.column').nth(cols - 1).locator('.due-trigger').first().click();
    await page.waitForTimeout(350);
    await page.evaluate((html) => {
      const c = document.querySelectorAll('.column');
      const menu = c[c.length - 1].querySelector('.due-menu');
      if (menu) { menu.style.minWidth = '0'; menu.style.padding = '8px'; menu.innerHTML = html; }
    }, dueRow(true));
    await page.waitForTimeout(250);
    const p = path.join(OUT, 'vorschau-2b-faelligkeit-eng.png');
    await page.locator('.app-window').screenshot({ path: p });
    bilder.push(p);
    await page.close();
  }

  // Zum Vergleich: der heutige Zustand des Faelligkeits-Menues.
  {
    const page = await neueSeite(browser, 'light');
    await page.locator('.column[data-col-index="0"] .task-row').first().click();
    await page.waitForTimeout(700);
    await page.locator('.column[data-col-index="1"] .due-trigger').first().click();
    await page.waitForTimeout(350);
    const p = path.join(OUT, 'vorschau-2-heute-zum-vergleich.png');
    await page.locator('.column[data-col-index="1"]').screenshot({ path: p });
    bilder.push(p);
    await page.close();
  }

  await browser.close();
  console.log('Bilder geschrieben:');
  bilder.forEach((b) => console.log('  ' + b));
})();
