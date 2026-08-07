// Der Darstellungs-Schalter steht direkt in der Sidebar, unten ueber den
// beiden Aktionsknoepfen: ein segmentierter Schalter mit gleitendem Knopf,
// dunkel links, hell rechts. Er hat den frueheren Knopf "Optionen" samt
// Aufklapp-Panel ersetzt.
//
// Geprueft wird, was leicht unbemerkt kaputtgeht:
//   1. Zwei Felder, Reihenfolge dunkel -> hell - gemessen an der
//      tatsaechlichen Position auf dem Bildschirm, nicht am Markup.
//   2. Kein Rest des alten Aufklapp-Menues (der Schalter muss ohne Umweg
//      sichtbar sein, das war der ganze Zweck der Aenderung).
//   3. Der Knopf sitzt deckungsgleich ueber dem aktiven Feld.
//   4. Bewegt wird ausschliesslich per transform. Ein Umbau auf left/width
//      saehe gleich aus, erzwaenge aber in jedem Bild ein neues Layout
//      (docs/spec.md, "Bewegung").
//   5. Kontrast beider Beschriftungen in beiden Themes, an den real
//      gerenderten Elementen (WCAG AA, 4,5:1).
const { chromium } = require('playwright');

// Kontrast an gerenderten Farben. Bewusst im Skript und nicht im Kopf
// gerechnet: --ink-faint auf --surface-sunken liegt knapp ueber der
// Schwelle, das haelt keine Schaetzung aus.
const KONTRAST_FN = () => {
  const lum = (c) => {
    const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return +((x + 0.05) / (y + 0.05)).toFixed(2);
  };
  const thumb = getComputedStyle(document.querySelector('.theme-seg-thumb')).backgroundColor;
  const track = getComputedStyle(document.querySelector('.theme-segmented')).backgroundColor;
  const out = {};
  document.querySelectorAll('.theme-seg-btn').forEach((btn) => {
    const on = btn.classList.contains('active');
    out[btn.getAttribute('data-set-theme') + (on ? ' (aktiv)' : '')] =
      ratio(getComputedStyle(btn).color, on ? thumb : track);
  });
  return out;
};

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  // Der Schalter muss ohne jeden Klick sichtbar sein.
  const felder = await page.$$eval('.theme-seg-btn', (els) =>
    els.map((e) => ({ text: e.textContent.trim(), key: e.getAttribute('data-set-theme'), x: e.getBoundingClientRect().x })));
  console.log('Felder:', JSON.stringify(felder));

  console.log('>>> Schalter ist ohne Aufklappen sichtbar:',
    await page.locator('.theme-segmented').isVisible());
  console.log('>>> genau zwei Felder, dunkel links und hell rechts:',
    felder.length === 2 &&
    felder.slice().sort((a, c) => a.x - c.x).map((f) => f.key).join(',') === 'dark,light');
  console.log('>>> kein Rest des alten Optionen-Menues:',
    (await page.locator('#optionsBtn').count()) === 0 &&
    (await page.locator('.options-panel').count()) === 0);

  const messen = async (key) => {
    await page.click('[data-set-theme="' + key + '"]');
    await page.waitForTimeout(400); // --dur-base 200ms plus Reserve
    return page.evaluate(() => {
      const t = document.querySelector('.theme-seg-thumb');
      const a = document.querySelector('.theme-seg-btn.active');
      if (!t || !a) return null;
      const tb = t.getBoundingClientRect(), ab = a.getBoundingClientRect();
      return {
        versatz: +(tb.x - ab.x).toFixed(1),
        breitenDiff: +(tb.width - ab.width).toFixed(1),
        transform: getComputedStyle(t).transform,
        aktiv: a.getAttribute('data-set-theme'),
      };
    });
  };

  const stellungen = [];
  for (const k of ['dark', 'light']) stellungen.push(await messen(k));
  stellungen.forEach((s) => console.log('  ', JSON.stringify(s)));

  console.log('>>> Knopf deckt in jeder Stellung das aktive Feld:',
    stellungen.every((s) => s && Math.abs(s.versatz) <= 1 && Math.abs(s.breitenDiff) <= 1));
  console.log('>>> aktives Feld entspricht der Auswahl:',
    stellungen.map((s) => s && s.aktiv).join(',') === 'dark,light');

  // Der Weg zeigt sich in der Matrix als tx != 0. Waere er per left
  // umgesetzt, bliebe tx bei 0 - und die Zusicherung schlaegt an.
  const tx = (m) => (m && m !== 'none' ? parseFloat(m.split(',')[4]) : 0);
  console.log('>>> Bewegung laeuft ueber transform, nicht ueber Layout:',
    tx(stellungen[0].transform) === 0 && tx(stellungen[1].transform) > 0);

  const alleAB = (o) => Object.values(o).every((v) => v >= 4.5);

  // Stellung "hell" ist gerade aktiv.
  const hell = await page.evaluate(KONTRAST_FN);
  console.log('Kontraste hell:', JSON.stringify(hell));
  console.log('>>> Beschriftungen erfuellen WCAG AA im hellen Design:', alleAB(hell));

  await page.click('[data-set-theme="dark"]');
  await page.waitForTimeout(400);
  const dunkel = await page.evaluate(KONTRAST_FN);
  console.log('Kontraste dunkel:', JSON.stringify(dunkel));
  console.log('>>> Beschriftungen erfuellen WCAG AA im dunklen Design:', alleAB(dunkel));

  await b.close();
})();
