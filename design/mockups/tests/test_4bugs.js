const { chromium } = require('playwright');

async function setup(page){
  await page.goto('file://' + process.cwd() + '/design/mockups/v1-desktop.html');
  await page.waitForTimeout(300);
  await page.click('.nav-item[data-list="personal"]');
  await page.waitForTimeout(400);
}
const struct = p => p.evaluate(() => {
  const ed = document.querySelector('[data-col-index="0"] .page-editor');
  return Array.from(ed.childNodes).map(n => n.nodeType===3 ? 'RAWTEXT("'+n.textContent+'")'
    : (n.classList.contains('inline-embed') ? 'EMBED['+n.getAttribute('data-embed-marker')+']'
       : 'LINE("'+n.textContent+'")'));
});
const reload = async p => { await p.click('.nav-item[data-list="groceries"]'); await p.waitForTimeout(250);
                            await p.click('.nav-item[data-list="personal"]'); await p.waitForTimeout(400); };

(async () => {
  const browser = await chromium.launch();
  const errs=[];

  // ===== BUG 1: multiple text lines survive moving a task =====
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('B1 '+e.message));
    await setup(page);
    const ed = await page.$('[data-col-index="0"] .page-editor');
    await ed.click({ position:{x:100,y:8} });
    await page.keyboard.press('End');
    await page.keyboard.press('Enter'); await page.keyboard.type('Zeile2');
    await page.keyboard.press('Enter'); await page.keyboard.type('Zeile3');
    await page.waitForTimeout(200);
    console.log('BUG1 after typing:'); (await struct(page)).forEach(s=>console.log('   ',s));
    // move the 2nd embed to the top
    const grips = await page.$$('[data-col-index="0"] .inline-embed [data-embed-grip]');
    const embeds = await page.$$('[data-col-index="0"] .inline-embed');
    const g = await grips[1].boundingBox(), t = await embeds[0].boundingBox();
    await page.mouse.move(g.x+g.width/2, g.y+g.height/2); await page.mouse.down();
    await page.mouse.move(g.x+g.width/2, g.y+g.height/2-8,{steps:4});
    await page.mouse.move(g.x+g.width/2, t.y+2,{steps:10}); await page.mouse.up();
    await page.waitForTimeout(600);
    const after = await struct(page);
    console.log('BUG1 after moving a task:'); after.forEach(s=>console.log('   ',s));
    const lines = after.filter(s=>s.startsWith('LINE'));
    console.log('>>> BUG1 FIXED (3 separate text lines kept):',
      lines.some(l=>l.includes('Zeile2')) && lines.some(l=>l.includes('Zeile3')) &&
      !lines.some(l=>l.includes('Zeile2Zeile3')));
    await page.close();
  }

  // ===== BUG 2: drop a task between two text lines =====
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('B2 '+e.message));
    await setup(page);
    const ed = await page.$('[data-col-index="0"] .page-editor');
    await ed.click({ position:{x:100,y:8} });
    await page.keyboard.press('End');
    await page.keyboard.press('Enter'); await page.keyboard.type('AAAA');
    await page.keyboard.press('Enter'); await page.keyboard.type('BBBB');
    await page.waitForTimeout(300);
    const before = await struct(page);
    console.log('BUG2 before:'); before.forEach(s=>console.log('   ',s));
    // drag last embed onto the boundary between line AAAA and BBBB
    const grips = await page.$$('[data-col-index="0"] .inline-embed [data-embed-grip]');
    const bLine = await page.evaluate(() => {
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      const l=Array.from(ed.children).find(c=>c.textContent==='BBBB');
      const r=l.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.top+2};
    });
    const g = await grips[grips.length-1].boundingBox();
    await page.mouse.move(g.x+g.width/2, g.y+g.height/2); await page.mouse.down();
    await page.mouse.move(g.x+g.width/2, g.y+g.height/2-8,{steps:4});
    await page.mouse.move(bLine.x, bLine.y,{steps:12}); await page.mouse.up();
    await page.waitForTimeout(600);
    const after = await struct(page);
    console.log('BUG2 after dropping a task between AAAA and BBBB:'); after.forEach(s=>console.log('   ',s));
    const ia = after.findIndex(s=>s==='LINE("AAAA")'), ib = after.findIndex(s=>s==='LINE("BBBB")');
    const between = after.slice(ia+1, ib).some(s=>s.startsWith('EMBED'));
    console.log('>>> BUG2 FIXED (task sits between the two text lines):', between);
    await page.close();
  }

  // ===== BUG 3: write text / blank line between two tasks =====
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('B3 '+e.message));
    await setup(page);
    const gapOk = await page.evaluate(() => {
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      const k=Array.from(ed.childNodes);
      for(let i=0;i<k.length-1;i++){
        const a=k[i],b=k[i+1];
        if(a.classList&&a.classList.contains('inline-embed')&&b.classList&&b.classList.contains('inline-embed')) return false;
      }
      return true;
    });
    console.log('>>> BUG3a every pair of tasks has a paragraph between them:', gapOk);
    // click the paragraph between the two tasks and type
    const typed = await page.evaluate(() => {
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      const k=Array.from(ed.children);
      const firstEmbed=k.findIndex(c=>c.classList.contains('inline-embed'));
      const gap=k[firstEmbed+1];
      return gap && !gap.classList.contains('inline-embed');
    });
    console.log('>>> BUG3b a paragraph exists directly after the first task:', typed);
    const gapBox = await page.evaluate(() => {
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      const k=Array.from(ed.children);
      const fe=k.findIndex(c=>c.classList.contains('inline-embed'));
      const r=k[fe+1].getBoundingClientRect(); return {x:r.x+20,y:r.y+r.height/2};
    });
    await page.mouse.click(gapBox.x, gapBox.y);
    await page.keyboard.type('ZWISCHEN');
    await page.waitForTimeout(200);
    await reload(page);
    const s = await struct(page);
    console.log('BUG3 after typing between tasks + reload:'); s.forEach(x=>console.log('   ',x));
    console.log('>>> BUG3 FIXED (text between tasks persists):', s.some(x=>x==='LINE("ZWISCHEN")'));
    await page.close();
  }

  // ===== BUG 4: Enter above the first task creates a blank line =====
  {
    const page = await browser.newPage({ viewport:{width:1200,height:800} });
    page.on('pageerror', e=>errs.push('B4 '+e.message));
    await setup(page);
    // put the caret at the very start of the first paragraph and press Enter
    await page.evaluate(() => {
      const ed=document.querySelector('[data-col-index="0"] .page-editor');
      ed.focus();
      const r=document.createRange(); r.selectNodeContents(ed.firstChild); r.collapse(true);
      const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
    });
    await page.keyboard.press('Enter');
    await page.keyboard.type('GANZOBEN');
    await page.waitForTimeout(200);
    await reload(page);
    const s = await struct(page);
    console.log('BUG4 after Enter at very top + typing + reload:'); s.forEach(x=>console.log('   ',x));
    console.log('>>> BUG4 FIXED (new line created at the top):', s.some(x=>x.includes('GANZOBEN')));
    await page.close();
  }

  console.log('PAGE ERRORS:', errs.length?errs:'none');
  await browser.close();
})();
