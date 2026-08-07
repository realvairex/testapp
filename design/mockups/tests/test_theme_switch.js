// Der Darstellungs-Schalter (Optionen > Darstellung) ist ein segmentierter
// Schalter mit gleitendem Knopf: dunkel links, System in der Mitte, hell
// rechts.
//
// Geprueft wird, was leicht unbemerkt kaputtgeht:
//   1. Reihenfolge dunkel -> System -> hell (nicht nur die Beschriftung,
//      sondern die tatsaechliche Position auf dem Bildschirm).
//   2. Der Knopf sitzt ueber dem aktiven Feld - deckungsgleich.
//   3. Bewegt wird ausschliesslich per transform. Wuerde jemand auf
//      left/width umbauen, saehe es gleich aus, erzwaenge aber in jedem
//      Bild ein neues Layout (docs/spec.md, "Bewegung").
//   4. Das Menue bleibt beim Umschalten offen - sonst sieht man das
//      Gleiten nie und kann Hell/Dunkel nicht vergleichen.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);

  await page.click('#optionsBtn');
  await page.waitForTimeout(300);

  const labels = await page.$$eval('.theme-seg-btn', (els) =>
    els.map((e) => ({ text: e.textContent.trim(), key: e.getAttribute('data-set-theme'), x: e.getBoundingClientRect().x })));
  console.log('Felder:', JSON.stringify(labels));

  const order = labels.slice().sort((a, b2) => a.x - b2.x).map((l) => l.key);
  console.log('>>> Reihenfolge auf dem Bildschirm ist dunkel-System-hell:',
    order.join(',') === 'dark,system,light');

  // Deckungsgleichheit: Knopf ueber dem aktiven Feld, in jeder Stellung.
  const measure = async (key) => {
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
        offen: !document.getElementById('optionsPanel').hasAttribute('hidden'),
      };
    });
  };

  const stellungen = [];
  for (const k of ['dark', 'system', 'light']) stellungen.push(await measure(k));
  stellungen.forEach((s) => console.log('  ', JSON.stringify(s)));

  console.log('>>> Knopf deckt in jeder Stellung das aktive Feld:',
    stellungen.every((s) => s && Math.abs(s.versatz) <= 1 && Math.abs(s.breitenDiff) <= 1));
  console.log('>>> aktives Feld entspricht der Auswahl:',
    stellungen.map((s) => s && s.aktiv).join(',') === 'dark,system,light');
  console.log('>>> Menue bleibt beim Umschalten offen:',
    stellungen.every((s) => s && s.offen));

  // Der Weg wird ueber die Matrix gemessen, nicht ueber left: eine
  // Verschiebung per transform zeigt sich dort als tx != 0.
  const tx = (m) => (m && m !== 'none' ? parseFloat(m.split(',')[4]) : 0);
  console.log('>>> Bewegung laeuft ueber transform, nicht ueber Layout:',
    tx(stellungen[0].transform) === 0 && tx(stellungen[2].transform) > 0);

  // Kontrast an den real gerenderten Elementen, in beiden Themes. Die
  // Beschriftungen sitzen auf zwei verschiedenen Untergruenden: das aktive
  // Feld auf dem Knopf (--surface), die inaktiven auf der Schiene
  // (--surface-sunken). Beide muessen WCAG AA (4,5:1) erfuellen - die
  // Farben haben sich mit dem Umbau geaendert, vorher lag weisser Text auf
  // der Akzentflaeche.
  const kontraste = await page.evaluate(() => {
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
  });

  const alleAB = (o) => Object.values(o).every((v) => v >= 4.5);
  console.log('Kontraste hell:', JSON.stringify(kontraste));
  console.log('>>> Beschriftungen erfuellen WCAG AA im hellen Design:', alleAB(kontraste));

  await page.click('[data-set-theme="dark"]');
  await page.waitForTimeout(400);
  const kontrasteDunkel = await page.evaluate(() => {
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
  });
  console.log('Kontraste dunkel:', JSON.stringify(kontrasteDunkel));
  console.log('>>> Beschriftungen erfuellen WCAG AA im dunklen Design:', alleAB(kontrasteDunkel));

  await b.close();
})();
