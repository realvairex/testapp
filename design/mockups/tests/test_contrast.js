const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);

  const measure = () => page.evaluate(() => {
    function parse(c){ const m=c.match(/\d+(\.\d+)?/g).map(Number); return [m[0],m[1],m[2],m[3]===undefined?1:m[3]]; }
    function lum([r,g,b]){ const f=c=>{c/=255; return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); }
    function effBg(el){ // walk up until a non-transparent background
      let n=el;
      while(n && n!==document.documentElement){
        const bg=parse(getComputedStyle(n).backgroundColor);
        if(bg[3]>0) return bg;
        n=n.parentElement;
      }
      return [255,255,255,1];
    }
    function ratio(el){ const fg=parse(getComputedStyle(el).color); const bg=effBg(el);
      const a=lum(fg),b=lum(bg); const hi=Math.max(a,b),lo=Math.min(a,b); return (hi+0.05)/(lo+0.05); }
    function px(el){ return parseFloat(getComputedStyle(el).fontSize); }
    const out=[];
    const targets=[
      ['aktive Liste (Name)','#sidebar .nav-item.active .nav-name'],
      ['aktive Liste (Zahl)','#sidebar .nav-item.active .nav-count'],
      ['Liste inaktiv (Zahl)','#sidebar .nav-item:not(.active) .nav-count'],
      ['Rubrik "LISTEN"','#sidebar .nav-label'],
      ['Gruppentitel','#sidebar .group-title'],
      ['Spalten-Meta "5 offen"','.col-meta'],
      ['Aufgaben-Titel','.task-row .task-title'],
      ['Fällig-Pille (heute)','.due-pill.today'],
      ['Fällig-Pille (normal)','.due-pill:not(.today)'],
      ['Einfügen-Button Text','.insert-btn'],
      ['Bild-Platzhalter','.block-image'],
    ];
    for(const [name,sel] of targets){
      const el=document.querySelector(sel); if(!el) continue;
      const size=px(el); const bold=parseInt(getComputedStyle(el).fontWeight,10)>=700;
      const need=(size>=24||(size>=18.66&&bold))?3.0:4.5;
      out.push({name, r:+ratio(el).toFixed(2), size, need});
    }
    return out;
  });

  for (const mode of ['light','dark']) {
    await page.evaluate(m => document.documentElement.setAttribute('data-theme', m), mode);
    await page.waitForTimeout(250);
    console.log(`\n=== ${mode.toUpperCase()} ===`);
    const rows = await measure();
    let fails=0;
    for (const r of rows) {
      const ok = r.r >= r.need;
      if (!ok) fails++;
      console.log(`  ${r.name.padEnd(24)} ${String(r.r).padStart(6)}:1  (${r.size}px, nötig ${r.need}:1)  ${ok?'OK':'<<< ZU WENIG'}`);
    }
    console.log(`  --> Durchgefallen: ${fails}`);
  }
  await browser.close();
})();
