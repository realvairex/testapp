const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:800} });
  await page.goto('file://'+process.cwd()+'/design/mockups/v1-desktop.html');
  await page.waitForTimeout(400);
  const r = await page.evaluate(()=>{
    const c=(el)=>{const b=el.getBoundingClientRect(); return +(b.x+b.width/2).toFixed(1);};
    const g=(s)=>document.querySelector(s);
    const out={};
    out.heuteZahl = c(g('.nav-item[data-nav="today"] .nav-count'));
    out.listeZahl = c(g('.nav-item-wrap .nav-count'));
    out.listeLoeschen = c(g('.nav-item-wrap .nav-delete'));
    out.gruppeZahl = c(g('.group-row .nav-count'));
    out.gruppeLoeschen = c(g('.group-actions [data-delete-group]'));
    // linke Kanten: Icons und Text
    const l=(el)=>+el.getBoundingClientRect().x.toFixed(1);
    out.heuteIcon = l(g('.nav-item[data-nav="today"] .nav-icon'));
    out.listenPunkt = l(g('.nav-item[data-drag-id="personal"] .nav-dot'));
    out.heuteText = l(g('.nav-item[data-nav="today"] .nav-name'));
    out.listenText = l(g('.nav-item[data-drag-id="personal"] .nav-name'));
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
