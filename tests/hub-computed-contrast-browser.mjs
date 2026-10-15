import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {PNG}=createRequire(import.meta.url)('pngjs');
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-computed-contrast';
const widths=(process.env.BAUMAN_CONTRAST_WIDTHS||'1440,768,390').split(',').map(Number);
const themes=(process.env.BAUMAN_CONTRAST_THEMES||'academic,paper,night,mint').split(',');
const routes=['home','roadmap','subjects','schedule','research'];
fs.mkdirSync(OUT,{recursive:true});
const luminance=c=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);

// Read the final cascade. Text is temporarily unpainted (not removed/reflowed),
// then actual PNG pixels supply the composited gradient/image/overlay backdrop.
// No authored-color lookup or assumed dark-background constant can make this pass.
async function measure(page,label,scope='body'){
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const nodes=await page.evaluate(scope=>{
    const root=document.querySelector(scope);
    if(!root)throw new Error('Missing audited surface '+scope);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data]};
    const unobscured=(el,point)=>{
      const x=point.x-scrollX,y=point.y-scrollY;
      if(y<0||y>=innerHeight)return true;
      const hit=document.elementFromPoint(x,y);
      return hit===el||el.contains(hit);
    };
    const selector=el=>{const parts=[];for(let a=el;a&&a!==document.body;a=a.parentElement){if(a.id){parts.unshift('#'+CSS.escape(a.id));break}parts.unshift(a.tagName.toLowerCase()+[...a.classList].map(c=>'.'+CSS.escape(c)).join('')+':nth-child('+([...a.parentElement.children].indexOf(a)+1)+')')}return parts.join(' > ')};
    const visibleRects=(el,rects)=>rects.map(r=>{
      let box={x:r.x+scrollX,y:r.y+scrollY,right:r.right+scrollX,bottom:r.bottom+scrollY};
      for(let a=el;a&&a!==document.body&&a!==document.documentElement;a=a.parentElement){
        const s=getComputedStyle(a),b=a.getBoundingClientRect();
        if(/hidden|clip|auto|scroll/.test(s.overflowX)){box.x=Math.max(box.x,b.x+scrollX);box.right=Math.min(box.right,b.right+scrollX)}
        if(/hidden|clip|auto|scroll/.test(s.overflowY)){box.y=Math.max(box.y,b.y+scrollY);box.bottom=Math.min(box.bottom,b.bottom+scrollY)}
      }
      return {...box,w:box.right-box.x,h:box.bottom-box.y};
    }).filter(r=>r.w>1&&r.h>1);
    const result=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
      const el=node.parentElement,text=node.textContent.trim();
      const button=el.closest('button'),icon=!!text&&!!button&&!/[\p{L}\p{N}]/u.test(button.innerText);
      if((!/[\p{L}\p{N}]/u.test(text)&&!icon)||el.closest('script,style,option,[aria-hidden="true"]')||!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const range=document.createRange();range.selectNodeContents(node);const rects=visibleRects(el,[...range.getClientRects()]);if(!rects.length)continue;
      const s=getComputedStyle(el);let opacity=1;for(let a=el;a;a=a.parentElement)opacity*=Number(getComputedStyle(a).opacity);
      const points=rects.flatMap(r=>[.1,.3,.5,.7,.9].flatMap(fx=>[.25,.5,.75].map(fy=>({x:r.x+r.w*fx,y:r.y+r.h*fy})))).filter(point=>unobscured(el,point));
      result.push({kind:icon?'icon':undefined,selector:selector(el),text,foreground:s.color,rgba:rgba(s.color),opacity,size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),disabled:!!el.closest(':disabled'),rects,points});
    }
    for(const svg of root.querySelectorAll('button svg')){
      if(!svg.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const r=svg.getBoundingClientRect(),s=getComputedStyle(svg);
      result.push({kind:'icon',selector:selector(svg),text:'button SVG icon',foreground:s.color,rgba:rgba(s.color),opacity:1,disabled:!!svg.closest(':disabled'),rects:visibleRects(svg,[r])});
    }
    for(const el of root.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]),textarea,select')){
      if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      const placeholder=!el.value&&el.placeholder,ps=placeholder?getComputedStyle(el,'::placeholder'):s;
      const points=[.2,.4,.6].map(f=>({x:r.x+scrollX+r.width*f,y:r.y+scrollY+r.height/2})).filter(point=>unobscured(el,point));
      result.push({selector:selector(el),text:el.value||el.placeholder||'empty field',foreground:ps.color,rgba:rgba(ps.color),opacity:Number(ps.opacity),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),disabled:el.disabled,rects:[],points});
      const boundary={x:r.x+scrollX+r.width/2,y:r.y+scrollY+3};
      if(parseFloat(s.borderTopWidth)>0&&unobscured(el,boundary))result.push({kind:'boundary',selector:selector(el),text:'field boundary',foreground:s.borderTopColor,rgba:rgba(s.borderTopColor),opacity:1,disabled:el.disabled,rects:[],points:[boundary]});
    }
    const focused=document.activeElement;
    if(root.contains(focused)&&focused.matches(':focus-visible')){
      const s=getComputedStyle(focused),r=focused.getBoundingClientRect();
      if(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2)result.push({kind:'focus',selector:selector(focused),text:'keyboard focus indicator',foreground:s.outlineColor,rgba:rgba(s.outlineColor),opacity:1,disabled:false,rects:[{x:r.x+scrollX+r.width/2,y:r.y+scrollY-7,w:1,h:1}]});
      else throw new Error('Keyboard focus is invisible on '+selector(focused));
    }
    return result;
  },scope);
  const clip=scope==='body'?null:await page.locator(scope).first().evaluate(el=>{const r=el.getBoundingClientRect();return {x:Math.max(0,r.x+scrollX-8),y:Math.max(0,r.y+scrollY-8),width:r.width+16,height:r.height+16}});
  const screenshotOptions=clip?{clip}:{fullPage:true};
  const screenshot=label+'.png';
  await page.screenshot({path:path.join(OUT,screenshot),...screenshotOptions,animations:'disabled'});
  const hide=await page.addStyleTag({content:'*{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}button svg{visibility:hidden!important}'});
  let png;
  try{png=PNG.sync.read(await page.screenshot({...screenshotOptions,animations:'disabled'}))}finally{await hide.evaluate(el=>el.remove())}
  const samples=[],rendered=png;
  for(const node of nodes){
    let worst=Infinity,background=null,position=null;
    const points=node.points||node.rects.flatMap(r=>[.1,.3,.5,.7,.9].flatMap(fx=>[.25,.5,.75].map(fy=>({x:r.x+r.w*fx,y:r.y+r.h*fy}))));
    for(const point of points){
      const x=Math.floor(point.x-(clip?.x||0)),y=Math.floor(point.y-(clip?.y||0));if(x<0||y<0||x>=png.width||y>=png.height)continue;
      const index=(y*rendered.width+x)*4,bg=[...rendered.data.slice(index,index+3)],alpha=node.rgba[3]/255*node.opacity;
      const fg=node.rgba.slice(0,3).map((v,i)=>v*alpha+bg[i]*(1-alpha)),ratio=contrast(fg,bg);
      if(ratio<worst){worst=ratio;background=bg;position={x,y}}
    }
    if(!Number.isFinite(worst))continue;
    const minimum=node.kind||node.size>=24||(node.size>=56/3&&node.weight>=700)?3:4.5;
    samples.push({...node,rects:undefined,points:undefined,background,position,ratio:worst,minimum,pass:node.disabled||worst>=minimum,exception:node.disabled?'WCAG inactive control':null});
  }
  const geometry=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  return {label,screenshot,geometry,count:samples.length,failures:samples.filter(x=>!x.pass),samples};
}

let browser;const matrix=[],states=[];
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.BAUMAN_HUB_PRIMARY_PAGES_V6?.selfCheck?.().patched&&!document.body.classList.contains('hub-ui-booting')&&!document.getElementById('appRoot').classList.contains('hidden'));
  const record=()=>fs.writeFileSync(path.join(OUT,'audit.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base:BASE,matrix,states,errors},null,2));
  const state=async(label,scope)=>{const result=await measure(page,label,scope);states.push(result);record()};
  for(const width of widths){
    await page.setViewportSize({width,height:width===390?844:1000});
    for(const theme of themes){
      await page.locator('#themeSelect').selectOption(theme,{force:true});
      await page.waitForFunction(value=>document.body.dataset.theme===value,theme);
      // Theme changes produce a real timed toast. Wait on its actual lifecycle,
      // so it cannot occlude another component's sampled background.
      await page.waitForFunction(()=>![...document.querySelectorAll('.toast')].some(el=>el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})));
      for(const route of routes){
        await page.evaluate(id=>window.app.page(id,false),route);
        await page.waitForFunction(id=>document.querySelector('#page-'+id)?.classList.contains('active'),route);
        const scrolling=await page.evaluate(()=>{
          const main=document.querySelector('.main'),el=main.scrollHeight>main.clientHeight+2?main:document.scrollingElement;
          el.dataset.c2Scroll='1';el.scrollTop=0;
          // Full-page capture already includes normal document flow. Only an
          // independently scrolling main needs multiple viewport captures.
          return {max:el===document.scrollingElement?0:el.scrollHeight-el.clientHeight,step:Math.max(200,el.clientHeight*.7)};
        });
        const positions=[0];for(let top=scrolling.step;top<scrolling.max;top+=scrolling.step)positions.push(top);
        if(scrolling.max>0)positions.push(scrolling.max);
        const views=[];
        for(const [index,top] of positions.entries()){
          await page.evaluate(top=>{document.querySelector('[data-c2-scroll]').scrollTop=top},top);
          views.push({...await measure(page,`${route}-${theme}-${width}-scroll-${index}`),scrollTop:top});
        }
        await page.evaluate(()=>{const el=document.querySelector('[data-c2-scroll]');el.scrollTop=0;el.removeAttribute('data-c2-scroll')});
        const result={label:`${route}-${theme}-${width}`,count:views.reduce((n,v)=>n+v.count,0),geometry:views[0].geometry,views,failures:views.flatMap(v=>v.failures)};matrix.push(result);
        console.log(result.label,JSON.stringify({count:result.count,failures:result.failures.length}));
        record();
        if(process.env.BAUMAN_CONTRAST_STATES==='0')continue;
        const root='#page-'+route;
        const control=page.locator(root+' button:visible').first();
        await control.hover();await state(`${route}-${theme}-${width}-hover`,root);
        await control.focus();await page.keyboard.press('Tab');
        const focused=await page.evaluate(()=>{const el=document.activeElement;el.dataset.c2Focus='1';return el.matches(':focus-visible')});
        assert.equal(focused,true,'Real keyboard focus must enter a visible control');
        await state(`${route}-${theme}-${width}-focus`,'[data-c2-focus="1"]');
        await page.evaluate(()=>document.querySelector('[data-c2-focus]')?.removeAttribute('data-c2-focus'));
        if(route==='subjects'||route==='research'||route==='schedule'){
          const prefix=route==='subjects'?'.subjects-page':route==='research'?'.thesis-page':'.schedule-ref';
          await page.locator(root+' '+prefix+'__filter-wrap button').first().click();
          await state(`${route}-${theme}-${width}-filter`,root+' '+prefix+'__filter-panel');
          await page.locator(root+' '+prefix+'__filter-wrap button').first().click();
        }
        if(route==='subjects'||route==='research'){
          const prefix=route==='subjects'?'.subjects-page':'.thesis-page';
          await page.locator(root+' '+prefix+'__header-actions button').last().click();
          await page.waitForSelector(root+' '+prefix+'__modal',{state:'visible'});
          await state(`${route}-${theme}-${width}-form`,root+' '+prefix+'__modal');
          await page.locator(root+' '+prefix+'__modal-actions button').last().click();
          await page.waitForSelector('.toast',{state:'visible'});
          await state(`${route}-${theme}-${width}-validation-error`,'.toast');
          await page.waitForFunction(()=>![...document.querySelectorAll('.toast')].some(el=>el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})));
          await page.locator(root+' '+prefix+'__modal-actions button').first().click();
        }
        if(route==='subjects'){
          await page.locator(root+' .subjects-page__tabs button').last().click();
          await state(`${route}-${theme}-${width}-empty`,root+' .subjects-page__course-list');
          await page.locator(root+' .subjects-page__tabs button').first().click();
        }
        if(route==='schedule'){
          await page.locator(root+' .schedule-ref__range').click();
          await state(`${route}-${theme}-${width}-date`,root+' .schedule-ref__range-popover');
          await page.locator(root+' .schedule-ref__range').click();
        }
        if(route==='home'){
          await page.locator('#appearanceBtn').click();
          await page.waitForSelector('.appearance-menu',{state:'visible'});
          await state(`${route}-${theme}-${width}-appearance`,'.appearance-menu');
          await page.locator('#appearanceBtn').click();
          await page.locator('#hubSafeSearch').fill('zzzz-no-results-336');
          await page.locator('#hubSafeSearch').press('Enter');
          await page.waitForSelector('#modalRoot .dialog',{state:'visible'});
          await state(`${route}-${theme}-${width}-search-empty`,'#modalRoot .dialog');
          await page.locator('#modalRoot [data-action="close-modal"]').click();
          await page.locator('#hubSafeSearch').fill('');
        }
      }
    }
  }
  assert.deepEqual(errors,[],'Hub runtime errors');
  for(const cell of matrix){assert.ok(cell.count>60,cell.label+': audit unexpectedly empty');assert.ok(cell.geometry.scroll<=cell.geometry.client+2,cell.label+': document overflow')}
  const failures=[...matrix,...states].flatMap(cell=>cell.failures.map(f=>({cell:cell.label,...f})));
  assert.equal(failures.length,0,JSON.stringify(failures.slice(0,20),null,2));
  // Prove that later winning CSS can make the test fail despite correct tokens.
  await page.evaluate(()=>window.app.page('subjects',false));
  await page.locator('#page-subjects .hub-v6-hero').scrollIntoViewIfNeeded();
  const poison=await page.addStyleTag({content:'#appRoot .hub-v6-hero h2{color:#071628!important}'});
  const negative=await measure(page,'negative-control-winning-cascade','#page-subjects .hub-v6-hero');
  await poison.evaluate(el=>el.remove());
  assert.ok(negative.failures.some(f=>f.selector.includes('h2')),'Audit failed to detect dark ink overriding correct on-dark tokens');
  fs.writeFileSync(path.join(OUT,'negative-control.json'),JSON.stringify(negative,null,2));
  console.log('HUB_COMPUTED_CONTRAST_PASS',JSON.stringify({cells:matrix.length,textSamples:matrix.reduce((n,c)=>n+c.count,0)}));
}finally{await browser?.close()}
