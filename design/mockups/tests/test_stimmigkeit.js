// Stimmigkeit und Kontinuität der gesamten Oberfläche — angelegt 2026-08-13
// auf Bitte des Nutzers ("prüfe die gesamte Stimmigkeit und Kontinuität").
//
// Warum als SKRIPT und nicht als Augenschein: Genau diese Frage wurde schon
// einmal von Hand beantwortet. Das Ergebnis damals — 12 Schriftgrößen, 8
// Radien, 13 Übergangsdauern — steht in docs/spec.md §3 als Begründung für
// die Skalen. Eine Prüfung von Hand ist nach der nächsten Änderung wieder
// wertlos; diese hier läuft bei jedem `run-mockup-tests.sh` mit.
//
// Geprüft wird gegen die Skalen aus docs/spec.md §3, und zwar an den
// TATSÄCHLICH GERENDERTEN Elementen. Ein Token in der CSS-Datei sagt nicht,
// was auf dem Bildschirm ankommt: Ein `<button>` ohne `font-size` erbt die
// Browser-Vorgabe von 13,33px, und die steht in keiner Skala.
//
// Bewusst NICHT hier drin: Farbkontraste (test_contrast.js) und die
// Strichstärke der Icons (test_svg.js / verify_icon.js). Zwei Skripte, die
// dasselbe prüfen, driften auseinander.
const { chromium } = require('playwright');

// --- Die Skalen aus docs/spec.md §3 ---------------------------------
const SCHRIFT = [11, 12, 13.5, 15.5, 22];
const DAUERN = [0, 120, 200, 400, 600];   // 600 = dur-slow + dur-base
const KURVEN = {
  'cubic-bezier(0.32, 0.72, 0, 1)': 'ease',
  'cubic-bezier(0.34, 1.28, 0.52, 1)': 'ease-spring',
  'cubic-bezier(0.85, 0, 0.35, 1)': 'ease-lauf',
  'linear': 'linear',
  'ease': 'browser-ease',
  'ease-in-out': 'browser-ease-in-out'
};
const RADIEN = [0, 6, 10, 16, 18, 100];   // + 50% für Kreise

// Sammelt alles Sichtbare ein. Läuft im Browser, nicht hier.
const erheben = (page) => page.evaluate(() => {
  const sichtbar = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
  };
  const eigenerText = (e) => Array.from(e.childNodes)
    .some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

  const schrift = {}, dauern = {}, kurven = {}, kurvenFarbe = {}, radien = {};
  const merken = (topf, wert, wo) => {
    const k = String(wert);
    (topf[k] = topf[k] || []).push(wo);
  };
  const wo = (e) => (e.tagName.toLowerCase() +
    (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));

  for (const e of document.querySelectorAll('*')) {
    if (!sichtbar(e)) continue;
    const s = getComputedStyle(e);

    // Schriftgröße nur dort, wo wirklich Text steht - sonst zählt man
    // Container mit, die ihre Größe nur weitervererben.
    if (eigenerText(e)) merken(schrift, parseFloat(s.fontSize), wo(e));

    for (const d of (s.transitionDuration || '').split(',')) {
      if (d.trim()) merken(dauern, Math.round(parseFloat(d) * 1000), wo(e));
    }
    for (const d of (s.animationDuration || '').split(',')) {
      if (d.trim()) merken(dauern, Math.round(parseFloat(d) * 1000), wo(e));
    }
    // Kurven getrennt nach BEWEGUNG und Farbe/Deckkraft. Der Unterschied
    // ist nicht Pedanterie: Auf einer 120ms langen Farbblende sieht
    // niemand, welche Kurve läuft; an einer Bewegung sieht man es sofort.
    // Deshalb wird die Bewegung streng geprüft und der Rest nur gezählt.
    const eigen = (s.transitionProperty || '').split(',').map((x) => x.trim());
    const kurvenListe = (s.transitionTimingFunction || '').split(/,(?![^(]*\))/);
    if (parseFloat(s.transitionDuration) > 0) {
      kurvenListe.forEach((f, i) => {
        if (!f.trim()) return;
        const prop = eigen[i] || eigen[0] || '';
        merken(prop === 'transform' ? kurven : kurvenFarbe, f.trim(), wo(e));
      });
    }
    for (const f of (s.animationTimingFunction || '').split(/,(?![^(]*\))/)) {
      if (f.trim() && parseFloat(s.animationDuration) > 0) merken(kurven, f.trim(), wo(e));
    }

    const r = s.borderRadius;
    if (r && r !== '0px') merken(radien, r, wo(e));
  }
  return { schrift, dauern, kurven, kurvenFarbe, radien };
});

// Die Marke im Sidebar-Kopf: Bildmarke und Wortmarke müssen zueinander
// passen. Gemessen wird die SICHTBARE Höhe des Wimpels, nicht die des
// SVG-Kastens - v2 trägt oben einen Bogen, der Kasten ist also höher als
// das, was als Marke gelesen wird.
const marke = (page) => page.evaluate(() => {
  const svg = document.querySelector('.brand-logo');
  const name = document.querySelector('.brand-name');
  if (!svg || !name) return null;
  const r = svg.getBoundingClientRect();
  const s = getComputedStyle(name);
  const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  return {
    logoHoehe: +r.height.toFixed(1),
    logoBreite: +r.width.toFixed(1),
    viewBox: vb.slice(2).join('x'),
    schriftPx: parseFloat(s.fontSize),
    schriftGewicht: s.fontWeight,
    // Versalhöhe grob: 0,72 der Schriftgröße - das ist die Höhe, die das
    // Auge neben der Bildmarke vergleicht, nicht die Schriftgröße selbst.
    versalPx: +(parseFloat(s.fontSize) * 0.72).toFixed(1)
  };
});

const listeAbweichungen = (topf, erlaubt, pruef) => Object.entries(topf)
  .filter(([k]) => !pruef(k, erlaubt))
  .map(([k, v]) => ({ wert: k, mal: v.length, z: Array.from(new Set(v)).slice(0, 3) }));

(async () => {
  const browser = await chromium.launch();
  const fehler = [];
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(500);

  // Möglichst viel der Oberfläche sichtbar machen, sonst prüft das Skript
  // nur die Startansicht. Eine Regel, die auf einer nie geöffneten Seite
  // gebrochen wird, ist trotzdem gebrochen.
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(450);
  await page.locator('[data-open-task]').first().click();
  await page.waitForTimeout(500);

  const d = await erheben(page);

  const schriftAb = listeAbweichungen(d.schrift, SCHRIFT, (k, e) => e.includes(parseFloat(k)));
  console.log('Schriftgrößen im Einsatz:', Object.keys(d.schrift).map(Number).sort((a, b) => a - b).join(', '));
  console.log('>>> alle Schriftgrößen liegen auf der Skala:', schriftAb.length === 0,
    JSON.stringify(schriftAb));

  const dauerAb = listeAbweichungen(d.dauern, DAUERN, (k, e) => e.includes(parseFloat(k)));
  console.log('Dauern im Einsatz:', Object.keys(d.dauern).map(Number).sort((a, b) => a - b).join(', '));
  console.log('>>> alle Übergangsdauern liegen auf der Skala:', dauerAb.length === 0,
    JSON.stringify(dauerAb));

  // Bewegung: streng. Nur die drei Hauskurven sind zulaessig - die
  // Browser-Vorgabe 'ease' zaehlt hier ausdruecklich als Abweichung, denn
  // sie ist eine vierte Kurve, nur ohne Namen.
  const HAUS = ['cubic-bezier(0.32, 0.72, 0, 1)', 'cubic-bezier(0.34, 1.28, 0.52, 1)',
                'cubic-bezier(0.85, 0, 0.35, 1)', 'linear'];
  const kurvenAb = listeAbweichungen(d.kurven, HAUS, (k) => HAUS.includes(k));
  console.log('Kurven an Bewegungen:', Object.keys(d.kurven).map((k) => KURVEN[k] || k).join(' · '));
  console.log('>>> jede Bewegung laeuft auf einer der drei Hauskurven:', kurvenAb.length === 0,
    JSON.stringify(kurvenAb));

  // Farbe/Deckkraft: nur gezaehlt. Bewusst keine Zusicherung - siehe die
  // Begruendung oben in erheben(). Wer das aendern will, aendert 56 Stellen.
  const farbBrowser = Object.entries(d.kurvenFarbe)
    .filter(([k]) => !HAUS.includes(k)).reduce((n, [, v]) => n + v.length, 0);
  console.log('Farb-/Deckkraft-Uebergaenge auf der Browser-Kurve:', farbBrowser,
    '(bewusst geduldet, nicht zugesichert)');

  const radienAb = listeAbweichungen(d.radien, RADIEN, (k) =>
    k === '50%' || k.split(' ').every((t) => RADIEN.includes(parseFloat(t))));
  console.log('Radien im Einsatz:', Object.keys(d.radien).join(' · '));
  console.log('>>> alle Radien liegen auf der Skala:', radienAb.length === 0,
    JSON.stringify(radienAb));

  // --- Die Marke ----------------------------------------------------
  const m = await marke(page);
  console.log('Marke:', JSON.stringify(m));
  // Bild- und Wortmarke sollen sich die Waage halten. Maßstab ist die
  // Versalhöhe der Schrift gegen die Höhe der Bildmarke; deutlich
  // auseinander heißt, eines der beiden trägt die Marke allein.
  const verhaeltnis = +(m.logoHoehe / m.versalPx).toFixed(2);
  console.log('Verhältnis Bildmarke : Versalhöhe =', verhaeltnis);
  console.log('>>> Bild- und Wortmarke halten sich die Waage (1,3-2,2):',
    verhaeltnis >= 1.3 && verhaeltnis <= 2.2);
  console.log('>>> die Wortmarke liegt auf der Schriftskala:',
    SCHRIFT.includes(m.schriftPx));

  console.log('>>> keine JavaScript-Fehler:', fehler.length === 0, JSON.stringify(fehler));
  await browser.close();
})();
