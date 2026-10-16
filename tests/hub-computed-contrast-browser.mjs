import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {PNG}=createRequire(import.meta.url)('pngjs');
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-computed-contrast';
const widths=(process.env.BAUMAN_CONTRAST_WIDTHS||'1440,768,390').split(',').map(Number);
const themes=(process.env.BAUMAN_CONTRAST_THEMES||'academic,paper,night,mint').split(',');
const EXPECT_PLATFORM_ACCESS=process.env.BAUMAN_E2E_EXPECT_PLATFORM_ACCESS==='1';
const TESTED_HEAD=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const TESTED_DIRTY=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
const routes=['home','roadmap','subjects','schedule','research'];
fs.mkdirSync(OUT,{recursive:true});
const luminance=c=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);

// Read the final cascade. Text is temporarily unpainted (not removed/reflowed),
// then actual PNG pixels supply the composited gradient/image/overlay backdrop.
// No authored-color lookup or assumed dark-background constant can make this pass.
async function measure(page,label,scope='body'){
  const fullPage=scope==='body'||await page.locator(scope).first().evaluate(el=>{for(let a=el;a;a=a.parentElement)if(getComputedStyle(a).position==='fixed')return false;return true});
  if(fullPage)await page.evaluate(()=>window.scrollTo(0,0));
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const nodes=await page.evaluate(scope=>{
    const root=document.querySelector(scope);
    if(!root)throw new Error('Missing audited surface '+scope);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const opacityOf=el=>{let opacity=1;for(let a=el;a;a=a.parentElement)opacity*=Number(getComputedStyle(a).opacity);return opacity};
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
      let fixedEscape=false;
      for(let a=el;a&&a!==document.body&&a!==document.documentElement;a=a.parentElement){
        const s=getComputedStyle(a),b=a.getBoundingClientRect();
        const containing=s.transform!=='none'||s.perspective!=='none'||s.filter!=='none'||s.backdropFilter!=='none'||/paint|layout|strict|content/.test(s.contain)||/transform|perspective|filter/.test(s.willChange);
        if(fixedEscape&&!containing)continue;
        if(containing)fixedEscape=false;
        if(/hidden|clip|auto|scroll/.test(s.overflowX)){box.x=Math.max(box.x,b.x+scrollX);box.right=Math.min(box.right,b.right+scrollX)}
        if(/hidden|clip|auto|scroll/.test(s.overflowY)){box.y=Math.max(box.y,b.y+scrollY);box.bottom=Math.min(box.bottom,b.bottom+scrollY)}
        if(s.position==='fixed')fixedEscape=true;
      }
      return {...box,w:box.right-box.x,h:box.bottom-box.y};
    }).filter(r=>r.w>1&&r.h>1);
    const result=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
      const el=node.parentElement,text=node.textContent.trim();
      const button=el.closest('button'),icon=!!text&&!!button&&!/[\p{L}\p{N}]/u.test(button.innerText);
      if((!/[\p{L}\p{N}]/u.test(text)&&!icon)||el.closest('script,style,option,[aria-hidden="true"]')||!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const range=document.createRange();range.selectNodeContents(node);const rects=visibleRects(el,[...range.getClientRects()]);if(!rects.length)continue;
      const s=getComputedStyle(el),opacity=opacityOf(el);
      const points=rects.flatMap(r=>[.1,.3,.5,.7,.9].flatMap(fx=>[.25,.5,.75].map(fy=>({x:r.x+r.w*fx,y:r.y+r.h*fy})))).filter(point=>unobscured(el,point));
      if(!points.length)continue;
      result.push({kind:icon?'icon':undefined,selector:selector(el),text,foreground:s.color,rgba:rgba(s.color),opacity,size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),disabled:!!el.closest(':disabled'),rects,points});
    }
    for(const el of root.querySelectorAll('*')){
      for(const pseudo of ['::before','::after']){
        const s=getComputedStyle(el,pseudo),text=s.content;
        if(!text||['none','normal','\"\"'].includes(text)||!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
        result.push({kind:!/[\p{L}\p{N}]/u.test(text)?'icon':undefined,selector:selector(el)+pseudo,text,foreground:s.color,rgba:rgba(s.color),opacity:opacityOf(el)*Number(s.opacity),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),disabled:!!el.closest(':disabled'),rects:visibleRects(el,[el.getBoundingClientRect()])});
      }
    }
    for(const shape of root.querySelectorAll('button svg :is(path,circle,rect,line,polyline,polygon,ellipse)')){
      if(!shape.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const r=shape.getBoundingClientRect(),s=getComputedStyle(shape),fill=s.fill!=='none',stroke=s.stroke!=='none';
      if(!fill&&!stroke)continue;
      if(fill)shape.dataset.c2Fill='1';if(stroke)shape.dataset.c2Stroke='1';
      const inset=stroke?parseFloat(s.strokeWidth)/2:0;
      const rects=visibleRects(shape,[{x:r.x-inset,y:r.y-inset,right:r.right+inset,bottom:r.bottom+inset}]);
      const points=rects.flatMap(r=>[.1,.3,.5,.7,.9].flatMap(fx=>[.25,.5,.75].map(fy=>({x:r.x+r.w*fx,y:r.y+r.h*fy})))).filter(point=>unobscured(shape.closest('button'),point));
      result.push({kind:'icon',pixelInk:true,selector:selector(shape),text:'button SVG icon',foreground:fill?s.fill:s.stroke,rgba:rgba(fill?s.fill:s.stroke),opacity:opacityOf(shape),disabled:!!shape.closest(':disabled'),rects,points});
    }
    for(const el of [root,...root.querySelectorAll('*')].filter(el=>el.matches('input:not([type="checkbox"]):not([type="radio"]),textarea,select'))){
      if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      const placeholder=!el.value&&el.placeholder,ps=placeholder?getComputedStyle(el,'::placeholder'):s;
      const points=[.2,.4,.6].map(f=>({x:r.x+scrollX+r.width*f,y:r.y+scrollY+r.height/2})).filter(point=>unobscured(el,point));
      result.push({selector:selector(el),text:el.value||el.placeholder||'empty field',foreground:ps.color,rgba:rgba(ps.color),opacity:opacityOf(el)*(placeholder?Number(ps.opacity):1),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),disabled:el.disabled,rects:visibleRects(el,[{x:r.x+4,y:r.y+4,right:r.right-4,bottom:r.bottom-4}]),points});
      const boundary={x:r.x+scrollX+r.width/2,y:r.y+scrollY+3};
      if(parseFloat(s.borderTopWidth)>0&&unobscured(el,boundary))result.push({kind:'boundary',selector:selector(el),text:'field boundary',foreground:s.borderTopColor,rgba:rgba(s.borderTopColor),opacity:opacityOf(el),disabled:el.disabled,rects:[{x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:parseFloat(s.borderTopWidth)+1}],points:[boundary]});
    }
    for(const el of [root,...root.querySelectorAll('*')].filter(el=>el.matches('input[type="checkbox"],input[type="radio"]'))){
      const r=el.getBoundingClientRect();
      if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||!visibleRects(el,[r]).length||!unobscured(el,{x:r.x+scrollX+r.width/2,y:r.y+scrollY+r.height/2}))continue;
      const box={x:r.x+scrollX+(r.width-Math.min(r.width,r.height))/2,y:r.y+scrollY+(r.height-Math.min(r.width,r.height))/2,w:Math.min(r.width,r.height),h:Math.min(r.width,r.height)};
      const edges=[{x:box.x,y:box.y+box.h/2,dx:1,dy:0},{x:box.x+box.w-1,y:box.y+box.h/2,dx:-1,dy:0},{x:box.x+box.w/2,y:box.y,dx:0,dy:1},{x:box.x+box.w/2,y:box.y+box.h-1,dx:0,dy:-1}].filter(e=>{
        const inside={x:e.x+e.dx,y:e.y+e.dy},outside={x:e.x-e.dx*3,y:e.y-e.dy*3};
        return unobscured(el,inside)&&unobscured(el.parentElement,outside);
      });
      result.push({kind:'checkbox',selector:selector(el),text:el.checked?'checked indicator':'unchecked boundary',disabled:el.disabled,controlRect:box,edges,rects:[]});
    }
    const focused=document.activeElement;
    if(root.contains(focused)&&focused.matches(':focus-visible')){
      const s=getComputedStyle(focused),r=focused.getBoundingClientRect();
      if(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2)result.push({kind:'focus',selector:selector(focused),text:'keyboard focus indicator',foreground:s.outlineColor,rgba:rgba(s.outlineColor),opacity:opacityOf(focused),disabled:false,rects:(()=>{const gap=parseFloat(s.outlineOffset),width=parseFloat(s.outlineWidth),x=r.x+scrollX-gap-width,y=r.y+scrollY-gap-width,w=r.width+2*(gap+width),h=r.height+2*(gap+width);return [{x,y,w,h:width},{x,y:y+h-width,w,h:width},{x,y,w:width,h},{x:x+w-width,y,w:width,h}]})()});
      else throw new Error('Keyboard focus is invisible on '+selector(focused));
    }
    return result;
  },scope);
  const clip=fullPage?null:await page.evaluate(()=>({x:scrollX,y:scrollY}));
  const screenshotOptions={fullPage};
  const screenshot=label+'.png';
  const original=PNG.sync.read(await page.screenshot({path:path.join(OUT,screenshot),...screenshotOptions,animations:'disabled'}));
  // Black/white glyph probes recover coverage separately from group opacity.
  // Original - unpainted pixels then reconstruct the actual full-coverage ink,
  // including ancestor opacity, alpha colors, SVG strokes and image backdrops.
  const paint=async(color,outlineOnly=false)=>{
    const outline=await page.evaluate(color=>{const el=document.activeElement;if(!el?.matches(':focus-visible'))return null;const previous={value:el.style.getPropertyValue('outline-color'),priority:el.style.getPropertyPriority('outline-color')};el.style.setProperty('outline-color',color,'important');return previous},color);
    const style=await page.addStyleTag({content:outlineOnly?`:focus-visible{outline-color:${color}!important}`:`
      *,*::before,*::after{ -webkit-text-fill-color:${color}!important;text-shadow:none!important;caret-color:transparent!important }
      input::placeholder,textarea::placeholder{-webkit-text-fill-color:${color}!important}
      [data-c2-fill]{fill:${color}!important;fill-opacity:1!important}[data-c2-stroke]{stroke:${color}!important;stroke-opacity:1!important}
      input,textarea,select{border-color:${color}!important}
      :focus-visible{outline-color:${color}!important}
    `});
    try{return PNG.sync.read(await page.screenshot({...screenshotOptions,animations:'disabled'}))}finally{await style.evaluate(el=>el.remove());if(outline)await page.evaluate(previous=>{const el=document.activeElement;if(previous.value)el.style.setProperty('outline-color',previous.value,previous.priority);else el.style.removeProperty('outline-color')},outline)}
  };
  const blank=await paint('transparent');
  const needsProbe=nodes.some(node=>node.kind!=='checkbox'&&!node.disabled&&(node.opacity!==1||node.pixelInk));
  const black=needsProbe?await paint('#000'):null,white=needsProbe?await paint('#fff'):null;
  const hasFocus=nodes.some(node=>node.kind==='focus');
  const focusBlank=hasFocus?await paint('transparent',true):null;
  const focusBlack=hasFocus?await paint('#000',true):null,focusWhite=hasFocus?await paint('#fff',true):null;
  const samples=[];
  for(const node of nodes){
    if(node.kind==='checkbox'){
      const r=node.controlRect,pixel=(x,y)=>{
        x=Math.floor(x-(clip?.x||0));y=Math.floor(y-(clip?.y||0));
        return x>=0&&y>=0&&x<original.width&&y<original.height?[...original.data.slice((y*original.width+x)*4,(y*original.width+x)*4+3)]:null;
      };
      const sides=node.edges.map(e=>{
        const bg=pixel(e.x-e.dx*3,e.y-e.dy*3);let ratio=0,fg=null;
        for(let i=0;i<Math.min(4,r.w/2,r.h/2);i++){const ink=pixel(e.x+e.dx*i,e.y+e.dy*i);if(ink&&bg&&contrast(ink,bg)>ratio){ratio=contrast(ink,bg);fg=ink}}
        return {ratio,foreground:fg,background:bg};
      });
      const side=sides.sort((a,b)=>a.ratio-b.ratio)[0];
      if(!side)continue;
      if(!side.foreground)continue;
      samples.push({...node,rects:undefined,controlRect:undefined,...side,minimum:3,pass:node.disabled||side.ratio>=3,exception:node.disabled?'WCAG inactive control':null});
      continue;
    }
    let worst=Infinity,background=null,position=null,painted=0;
    if(node.kind!=='focus'&&!node.pixelInk&&node.opacity===1&&node.rgba){
      for(const point of node.points||node.rects.flatMap(r=>[.1,.3,.5,.7,.9].flatMap(fx=>[.25,.5,.75].map(fy=>({x:r.x+r.w*fx,y:r.y+r.h*fy}))))){
        const x=Math.floor(point.x-(clip?.x||0)),y=Math.floor(point.y-(clip?.y||0));if(x<0||y<0||x>=blank.width||y>=blank.height)continue;
        const index=(y*blank.width+x)*4,bg=[...blank.data.slice(index,index+3)],alpha=node.rgba[3]/255;
        const fg=node.rgba.slice(0,3).map((v,i)=>v*alpha+bg[i]*(1-alpha)),ratio=contrast(fg,bg);painted++;
        if(ratio<worst){worst=ratio;background=bg;position={x,y}}
      }
    }
    const rects=node.kind==='focus'||node.opacity!==1||node.pixelInk?node.rects:[];
    for(const r of rects){
      const left=Math.max(0,Math.floor(r.x-(clip?.x||0))),top=Math.max(0,Math.floor(r.y-(clip?.y||0)));
      const right=Math.min(blank.width,Math.ceil(r.x+r.w-(clip?.x||0))),bottom=Math.min(blank.height,Math.ceil(r.y+r.h-(clip?.y||0)));
      for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
        const index=(y*blank.width+x)*4;
        const bg=[...(node.kind==='focus'?focusBlank:blank).data.slice(index,index+3)];
        let fg;
        if(node.kind==='focus'){
          const coverage=[0,1,2].reduce((n,i)=>n+focusWhite.data[index+i]-focusBlack.data[index+i],0)/(3*255*node.opacity);
          if(coverage<.5)continue;
          fg=bg.map((v,i)=>Math.max(0,Math.min(255,v+(original.data[index+i]-v)/Math.min(1,coverage))));
        }else if(!node.pixelInk&&node.opacity===1&&node.rgba){
          const alpha=node.rgba[3]/255;
          fg=node.rgba.slice(0,3).map((v,i)=>v*alpha+bg[i]*(1-alpha));
        }else{
          if(!black||!white)continue;
          const delta=[0,1,2].map(i=>white.data[index+i]-black.data[index+i]);
          const coverage=delta.reduce((n,v)=>n+v,0)/(3*255*node.opacity);
          if(coverage<.5||coverage>1.05)continue;
          fg=bg.map((v,i)=>Math.max(0,Math.min(255,v+(original.data[index+i]-v)/Math.min(1,coverage))));
        }
        const ratio=contrast(fg,bg);painted++;
        if(ratio<worst){worst=ratio;background=bg;position={x,y}}
      }
    }
    if(!Number.isFinite(worst))continue;
    const minimum=node.kind||node.size>=24||(node.size>=56/3&&node.weight>=700)?3:4.5;
    samples.push({...node,rects:undefined,points:undefined,painted,background,position,ratio:worst,minimum,pass:node.disabled||worst>=minimum,exception:node.disabled?'WCAG inactive control':null});
  }
  const geometry=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  return {label,screenshot,geometry,count:samples.length,failures:samples.filter(x=>!x.pass),samples};
}

let browser;const matrix=[],states=[];
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  if(EXPECT_PLATFORM_ACCESS){
    assert.ok(['127.0.0.1','localhost'].includes(new URL(BASE).hostname),'Managed CI fixture is loopback-only');
    const deviceId='c'.repeat(64),deviceCode='BM-SYSTEM-E2E';
    const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
    await page.route('http://127.0.0.1:3003/**',async route=>{
      const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
      const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
      const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
      if(pathname==='/api/device/register'||pathname==='/api/device/status'||pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
      if(pathname==='/api/device/challenge')return send({challengeId:'challenge-system-e2e',signingInput:`bauman-system-e2e:${deviceId}`});
      if(pathname==='/api/device/verify')return send({sessionToken:'bm1.system-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
      return route.fulfill({status:404,headers,body:'{}'});
    });
  }
  const cssReceipts=[],cssRequests=[];
  page.on('response',response=>{
    const url=new URL(response.url());
    if(url.origin!==new URL(BASE).origin||!/^\/(?:assets\/css|platform\/ui)\/.*\.css$/.test(url.pathname))return;
    cssRequests.push((async()=>{
      const relative=decodeURIComponent(url.pathname).slice(1),body=await response.body();
      const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
      const receipt={url:url.href,status:response.status(),fromServiceWorker:response.fromServiceWorker(),sha256:sha256(body),sourceSha256:sha256(fs.readFileSync(relative)),cacheControl:response.headers()['cache-control']||null};
      cssReceipts.push(receipt);
    })());
  });
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.BAUMAN_HUB_PRIMARY_PAGES_V6?.selfCheck?.().patched&&!document.body.classList.contains('hub-ui-booting')&&!document.getElementById('appRoot').classList.contains('hidden'));
  const record=()=>fs.writeFileSync(path.join(OUT,'audit.json'),JSON.stringify({head:TESTED_HEAD,workingTreeModified:TESTED_DIRTY,stylesheets:cssReceipts,base:BASE,accessFixture:EXPECT_PLATFORM_ACCESS?'Canonical managed CI control receipt':'None (standalone)',matrix,states,errors},null,2));
  const state=async(label,scope,expected)=>{
    const target=page.locator(scope).first();await target.waitFor({state:'visible'});await target.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
    const max=await target.evaluate(el=>el.scrollHeight-el.clientHeight),views=[];
    const step=await target.evaluate(el=>Math.max(150,el.clientHeight*.7));
    const positions=[0];for(let top=step;top<max;top+=step)positions.push(top);if(max>2)positions.push(max);
    for(const [i,top] of positions.entries()){
      await target.evaluate((el,top)=>el.scrollTop=top,top);
      views.push(await measure(page,label+(positions.length>1?'-scroll-'+i:''),scope));
    }
    await target.evaluate(el=>el.scrollTop=0);
    const result={label,count:views.reduce((n,v)=>n+v.count,0),views,failures:views.flatMap(v=>v.failures),samples:views.flatMap(v=>v.samples)};
    assert.ok(result.count>0,label+': intended surface had no painted samples');
    if(expected)assert.ok(result.samples.some(s=>s.text.includes(expected)),label+': missing painted '+expected);
    if(label.endsWith('-focus'))assert.ok(result.samples.some(s=>s.kind==='focus'),label+': focus outline has no rendered coverage');
    states.push(result);record();
  };
  // Calibrate the measurement algorithm, never the application's acceptance.
  // Each known low-contrast group must FAIL, with the correct composited ratio.
  await page.evaluate(()=>{
    const host=document.createElement('div');host.id='c2ContrastCalibration';
    host.style.cssText='position:fixed;left:50px;top:100px;width:320px;z-index:999999;background:#fff;padding:20px';
    host.innerHTML='<style>#c2ContrastCalibration input::placeholder{color:#fff!important;opacity:1!important}#c2ContrastCalibration button{background:transparent!important}</style><div style="opacity:.5;background:#000;color:#fff;font:16px Arial">C2 opacity group</div><div style="color:#fff;background:#fff;font:16px Arial">C2 invisible ink</div><div style="opacity:.2;background:#000;color:#fff;font:16px Arial"><input aria-label="probe" placeholder="C2 faded placeholder" style="background:transparent;color:#fff;border:0;font:16px Arial;opacity:1"><button style="background:transparent;color:#fff;border:0"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3L21 21M3 21L21 3" fill="none" stroke="#fff" stroke-width="3"/></svg></button></div>';
    host.insertAdjacentHTML('beforeend','<div style="opacity:.2;padding:10px"><button id="c2FadedFocus" style="outline:3px solid #000!important;outline-offset:0!important;border:0!important">C2 faded focus</button></div><button id="c2DefaultFillSvg"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3L21 21M3 21L21 3" stroke="#fff" stroke-width="3"/></svg></button>');
    document.body.append(host);
  });
  try{
    const probe=await measure(page,'measurement-calibration','#c2ContrastCalibration');
    for(const [text,expected] of [['C2 invisible ink',1],['C2 opacity group',contrast([255,255,255],[128,128,128])],['C2 faded placeholder',contrast([255,255,255],[204,204,204])],['button SVG icon',contrast([255,255,255],[204,204,204])]]){
      const sample=probe.samples.find(s=>s.text===text);
      assert.ok(sample&&!sample.pass&&Math.abs(sample.ratio-expected)<.12,'Incorrect composited-opacity measurement: '+text+' '+JSON.stringify(sample));
    }
    const defaultFill=probe.samples.find(s=>s.selector.includes('#c2DefaultFillSvg'));
    assert.ok(defaultFill&&!defaultFill.pass&&Math.abs(defaultFill.ratio-1)<.12,'Unpainted default SVG fill must not mask an invisible stroke: '+JSON.stringify(defaultFill));
    await page.keyboard.press('Tab');await page.locator('#c2FadedFocus').focus();
    const focusProbe=await measure(page,'measurement-faded-focus','#c2ContrastCalibration');
    const fadedFocus=focusProbe.samples.find(s=>s.kind==='focus');
    assert.ok(fadedFocus&&!fadedFocus.pass&&Math.abs(fadedFocus.ratio-contrast([204,204,204],[255,255,255]))<.12,'Incorrect composited focus measurement: '+JSON.stringify(fadedFocus));
    fs.writeFileSync(path.join(OUT,'measurement-calibration.json'),JSON.stringify({probe,focusProbe},null,2));
  }finally{await page.locator('#c2ContrastCalibration').evaluate(el=>el.remove())}
  const waitToast=()=>page.waitForFunction(()=>![...document.querySelectorAll('.toast')].some(el=>el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})));
  if(process.env.BAUMAN_CONTRAST_STATES!=='0'){
    await page.evaluate(()=>window.app.page('research',false));
    await page.locator('#page-research .thesis-page__tabs button').last().click();
    await state('research-initial-empty','#page-research .thesis-page__task-list','Chưa có nhiệm vụ');
    await page.locator('#page-research .thesis-page__tabs button').first().click();
    for(const [i,tone] of ['blue','green','yellow','purple','red'].entries()){
      await page.locator('#page-research .thesis-page__header-actions button').last().click();
      await page.locator('#thesisTaskTitle').fill('C2 QA LOCAL_HUB '+tone);
      await page.locator('#thesisTaskStart').fill(String(9+i*2).padStart(2,'0')+':00');
      await page.locator('#thesisTaskEnd').fill(String(10+i*2).padStart(2,'0')+':00');
      await page.locator('#thesisTaskTone').selectOption(tone);
      await page.locator('#page-research .thesis-page__modal-actions button').last().click();
      await waitToast();
    }
    assert.equal(await page.locator('#page-research .thesis-page__event').count(),5,'All five LOCAL_HUB task tones must render');
    let prompt=0;const answer=dialog=>dialog.accept(prompt++===0?'C2 QA LOCAL_HUB note':'C2 QA deadline');
    page.on('dialog',answer);
    await page.locator('#page-research .thesis-page__notes .thesis-page__panel-head button').click();
    page.off('dialog',answer);assert.equal(prompt,2,'Research note must use both actual prompts');
    await page.locator('#page-research .thesis-page__notes-grid input').check();
  }
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
        if(route==='research'){
          for(const [i,view] of ['week','month','gantt','list'].entries()){
            await page.locator(root+' .thesis-page__tabs button').nth(i).click();
            const scope=view==='week'?'.thesis-page__timeline':view==='month'?'.thesis-page__month-view':'.thesis-page__task-list';
            if(view==='week')assert.equal(await page.locator(root+' .thesis-page__event').count(),5);
            await state(`${route}-${theme}-${width}-${view}`,root+' '+scope,view==='month'?'T2':view==='week'?'Thứ 2':'C2 QA LOCAL_HUB');
            if(view==='week'){
              const scroller=page.locator(root+' .thesis-page__plan-body');
              const max=await scroller.evaluate(el=>el.scrollWidth-el.clientWidth);
              if(max>2){
                const step=await scroller.evaluate(el=>el.clientWidth*.7),positions=[0];
                for(let left=step;left<max;left+=step)positions.push(left);positions.push(max);
                const captured=[];
                for(const [j,left] of positions.entries()){
                  await scroller.evaluate((el,left)=>el.scrollLeft=left,left);
                  await state(`${route}-${theme}-${width}-week-horizontal-${j}`,root+' '+scope,j===0?'08:00':j===positions.length-1?'Chủ nhật':null);
                  captured.push(...states.at(-1).samples);
                }
                for(const tone of ['blue','green','yellow','purple','red'])assert.ok(captured.some(s=>s.text==='C2 QA LOCAL_HUB '+tone),'Missing horizontally scrolled '+tone+' event');
                await scroller.evaluate(el=>el.scrollLeft=0);
              }
            }
          }
          await page.locator(root+' .thesis-page__task-list button').first().click();
          await state(`${route}-${theme}-${width}-task-detail`,root+' .thesis-page__modal','Thời gian');
          await page.locator(root+' .thesis-page__modal-actions button').click();
          await state(`${route}-${theme}-${width}-note-done`,root+' .thesis-page__notes','C2 QA LOCAL_HUB note');
          await page.locator(root+' .thesis-page__tabs button').first().click();
        }
        if(route==='schedule'){
          for(const [i,view] of ['day','week','month'].entries()){
            await page.locator(root+' .schedule-ref__segments button').nth(i).click();
            const calendarScope=view==='week'&&width<=600?'.schedule-ref__mobile-agenda':'.schedule-ref__calendar-body';
            await state(`${route}-${theme}-${width}-${view}`,root+' '+calendarScope);
          }
          await page.locator(root+' .schedule-ref__segments button').nth(1).click();
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
  await Promise.all(cssRequests);record();
  assert.ok(cssReceipts.length>=10,'Actual stylesheet receipts are missing');
  for(const asset of cssReceipts){assert.equal(asset.status,200,asset.url);assert.equal(asset.fromServiceWorker,false,asset.url);assert.equal(asset.sha256,asset.sourceSha256,'Served asset differs from tested checkout: '+asset.url)}
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),TESTED_HEAD,'HEAD changed during audit');
  assert.deepEqual(errors,[],'Hub runtime errors');
  for(const cell of matrix){assert.ok(cell.count>60,cell.label+': audit unexpectedly empty');assert.ok(cell.views.flatMap(v=>v.samples).filter(s=>s.selector.startsWith('#page-'+cell.label.split('-')[0])).length>30,cell.label+': route content unexpectedly empty');assert.ok(cell.geometry.scroll<=cell.geometry.client+2,cell.label+': document overflow')}
  const failures=[...matrix,...states].flatMap(cell=>cell.failures.map(f=>({cell:cell.label,...f})));
  assert.equal(failures.length,0,JSON.stringify(failures.slice(0,20),null,2));
  // Prove that later winning CSS can make the test fail despite correct tokens.
  await page.evaluate(()=>window.app.page('subjects',false));
  await page.locator('#page-subjects .hub-v6-hero').scrollIntoViewIfNeeded();
  const poison=await page.addStyleTag({content:'#appRoot .hub-v6-hero h2{color:#071628!important;background:#071628!important}'});
  const negative=await measure(page,'negative-control-winning-cascade','#page-subjects .hub-v6-hero');
  await poison.evaluate(el=>el.remove());
  assert.ok(negative.failures.some(f=>f.selector.includes('h2')),'Audit failed to detect invisible 1:1 ink overriding correct on-dark tokens');
  fs.writeFileSync(path.join(OUT,'negative-control.json'),JSON.stringify(negative,null,2));
  console.log('HUB_COMPUTED_CONTRAST_PASS',JSON.stringify({cells:matrix.length,textSamples:matrix.reduce((n,c)=>n+c.count,0)}));
}finally{await browser?.close()}
