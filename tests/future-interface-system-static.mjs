import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function walk(dir,out=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p,out); else out.push(p);
  }
  return out;
}

const html=walk('.').filter(p=>p.endsWith('.html')&&!p.includes('/node_modules/')&&!p.includes('\\node_modules\\'));
assert.ok(html.length>=40,'Expected the full set of user-facing HTML entry points');

const missing=[];
for(const file of html){
  const c=fs.readFileSync(file,'utf8');
  if(!c.includes('data-bauman-ui="future-v1"'))missing.push(file+':attr');
  if(!c.includes('platform/ui/bauman-ui.css?v=1'))missing.push(file+':css');
  if(!c.includes('platform/ui/bauman-ui.js?v=1'))missing.push(file+':js');
}
assert.deepEqual(missing,[],'Some HTML surfaces have not adopted the shared UI kernel: '+missing.join(', '));

const tokens=fs.readFileSync('platform/ui/tokens.css','utf8');
const foundation=fs.readFileSync('platform/ui/foundations.css','utf8');
const components=fs.readFileSync('platform/ui/components.css','utf8');
const layouts=fs.readFileSync('platform/ui/layouts.css','utf8');
const responsive=fs.readFileSync('platform/ui/responsive.css','utf8');
const dashboard=fs.readFileSync('platform/ui/dashboard.css','utf8');
const device=fs.readFileSync('platform/ui/device-responsive.css','utf8');
const compact=fs.readFileSync('platform/ui/compact-controls.css','utf8');
const contrast=fs.readFileSync('platform/ui/contrast-system.css','utf8');
const constitution=fs.readFileSync('docs/UI_CONTRAST_CONSTITUTION.md','utf8');
const kernel=fs.readFileSync('platform/ui/bauman-ui.css','utf8');
const runtime=fs.readFileSync('platform/ui/bauman-ui.js','utf8');

for(const marker of [
  '--bui-surface-canvas','--bui-surface-primary','--bui-space-4','--bui-radius-md',
  '--bui-shadow-raised','--bui-type-body','--bui-motion-normal','--bui-z-modal',
  '--bui-touch:44px'
]) assert.ok(tokens.includes(marker),'Missing design token '+marker);

assert.ok(tokens.includes('body[data-theme="night"]'),'Dark-mode token scale missing');
assert.ok(foundation.includes('prefers-reduced-motion:reduce'),'Reduced-motion contract missing');
assert.ok(foundation.includes(':focus-visible'),'Keyboard focus contract missing');
assert.ok(components.includes('.bui-empty'),'Empty-state primitive missing');
assert.ok(components.includes('.bui-error'),'Error-state primitive missing');
assert.ok(components.includes('.bui-skeleton'),'Loading skeleton primitive missing');
assert.ok(layouts.includes('grid-template-columns:repeat(12'),'12-column desktop grid missing');
assert.ok(responsive.includes('repeat(8'),'8-column tablet grid missing');
assert.ok(responsive.includes('repeat(4'),'4-column mobile grid missing');
assert.ok(runtime.includes('routeOwnership:false'),'Shared runtime must not own application routing');
assert.ok(runtime.includes('installPrimaryNavigation'),'UI-E5 primary navigation architecture missing');
assert.ok(runtime.includes("setAttribute('aria-current','page')"),'UI-E5 active-route accessibility state missing');
assert.ok(runtime.includes('bui-mobile-nav'),'UI-E5 mobile navigation mirror missing');
assert.ok(responsive.includes('.bui-mobile-nav'),'UI-E5 mobile navigation presentation missing');
assert.ok(responsive.includes('safe-area-inset-bottom'),'UI-E5 mobile safe-area handling missing');
assert.ok(runtime.includes('BAUMAN_UI'),'Shared UI runtime API missing');
assert.ok(dashboard.includes('.bui-dashboard__layout'),'UI-E6 dashboard structural layout missing');
assert.ok(dashboard.includes('@container bui-dashboard'),'UI-E6 dashboard container architecture missing');
assert.ok(fs.readFileSync('assets/js/hub-safe-shell.js','utf8').includes('data-bui-dashboard="e6"'),'UI-E6 dashboard semantic marker missing');
assert.ok(runtime.includes('dashboardReady'),'UI-E6 dashboard readiness signal missing');
assert.ok(device.includes('min-width:821px')&&device.includes('max-width:1100px'),'UI-E7 tablet-landscape profile missing');
assert.ok(device.includes('min-width:481px')&&device.includes('max-width:820px'),'UI-E7 tablet-portrait profile missing');
assert.ok(device.includes('max-width:480px'),'UI-E7 phone profile missing');
assert.ok(device.includes('safe-area-inset-bottom'),'UI-E7 iPhone safe-area protection missing');
assert.ok(runtime.includes('COMPACT_LABEL'),'UI-E7 compact navigation labels missing');
assert.ok(runtime.includes('baumanDeviceProfile'),'UI-E7 device profile runtime missing');
assert.ok(kernel.includes('./compact-controls.css'),'UI-E8 compact control layer is not loaded by the shared kernel');
for(const marker of [
  '.bui-button--primary','.bui-button--secondary','.bui-button--ghost',
  '.bui-button--icon','.bui-button--compact','.bui-button--danger','.bui-button-group'
]) assert.ok(compact.includes(marker),'UI-E8 button primitive missing: '+marker);
assert.ok(compact.includes('max-width:1440px'),'UI-E8 compact laptop/ASUS breakpoint missing');
assert.ok(compact.includes('min-width:481px')&&compact.includes('max-width:820px'),'UI-E8 iPad mini portrait control contract missing');
assert.ok(compact.includes('max-width:480px'),'UI-E8 iPhone control contract missing');
assert.ok(compact.includes('safe-area-inset-bottom'),'UI-E8 safe-area control protection missing');
assert.ok(compact.includes('white-space:nowrap'),'UI-E8 button labels must be protected from accidental wrapping');
assert.ok(kernel.includes('./contrast-system.css'),'UI-E9 contrast enforcement layer is not loaded by the shared kernel');
assert.ok(kernel.trim().endsWith('@import url("./contrast-system.css");'),'UI-E9 contrast enforcement must remain the final shared CSS layer');
for(const marker of [
  '--bui-hub-text-primary','--bui-hub-text-secondary','--bui-hub-text-muted',
  '--bui-hub-placeholder','--bui-hub-border-strong','--bui-hub-action-bg','--bui-hub-action-text'
]) assert.ok(tokens.includes(marker),'UI-E9 semantic contrast token missing: '+marker);
for(const marker of [
  'Content must visually dominate the background','4.5:1','3:1',
  'Responsive invariance','Theme invariance','Acceptance gate'
]) assert.ok(constitution.includes(marker),'UI-E9 Contrast Constitution clause missing: '+marker);
for(const marker of [
  '.hub-safe-hero::after','.hub-safe-search input',':where(input,textarea)::placeholder',
  '.hub-safe-subject small','.hub-safe-suggestions button','.bui-mobile-nav'
]) assert.ok(contrast.includes(marker),'UI-E9 high-risk contrast enforcement missing: '+marker);

function rgbFromHex(hex){
  const h=hex.replace('#','');
  const n=parseInt(h,16);
  return[(n>>16)&255,(n>>8)&255,n&255];
}
function luminance(hex){
  const weights=[.2126,.7152,.0722];
  return rgbFromHex(hex).map(v=>v/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4))
    .reduce((sum,v,i)=>sum+v*weights[i],0);
}
function contrastRatio(a,b){
  const x=luminance(a),y=luminance(b);
  return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function themeBlock(theme){
  const start='body[data-theme="'+theme+'"]{';
  const i=tokens.indexOf(start);
  assert.ok(i>=0,'UI-E9 theme token block missing: '+theme);
  const end=tokens.indexOf('}',i);
  return tokens.slice(i+start.length,end);
}
function themeToken(theme,name){
  const line=themeBlock(theme).split('\n').find(x=>x.trim().startsWith(name+':'));
  assert.ok(line,theme+' missing '+name);
  const value=line.slice(line.indexOf(':')+1).trim().replace(/;$/,'');
  assert.match(value,/^#[0-9a-fA-F]{6}$/,theme+' '+name+' must be a six-digit hex color for ratio gating');
  return value;
}
for(const theme of ['academic','night','mint','paper']){
  const surfaces=['--bui-hub-canvas','--bui-hub-surface-1','--bui-hub-surface-2','--bui-hub-surface-3'].map(x=>themeToken(theme,x));
  for(const role of ['--bui-hub-text-primary','--bui-hub-text-secondary','--bui-hub-text-muted','--bui-hub-text-subtle','--bui-hub-placeholder']){
    const fg=themeToken(theme,role);
    const minimum=Math.min(...surfaces.map(bg=>contrastRatio(fg,bg)));
    assert.ok(minimum>=4.5,theme+' '+role+' contrast below 4.5:1; got '+minimum.toFixed(2));
  }
  const border=themeToken(theme,'--bui-hub-border-strong');
  const borderMinimum=Math.min(...surfaces.map(bg=>contrastRatio(border,bg)));
  assert.ok(borderMinimum>=3,theme+' strong border contrast below 3:1; got '+borderMinimum.toFixed(2));
  const actionBg=themeToken(theme,'--bui-hub-action-bg');
  const actionText=themeToken(theme,'--bui-hub-action-text');
  assert.ok(contrastRatio(actionText,actionBg)>=4.5,theme+' primary action pair below 4.5:1');
}

for(const file of ['platform/ui/foundations.css','platform/ui/components.css','platform/ui/layouts.css','platform/ui/responsive.css','platform/ui/dashboard.css','platform/ui/device-responsive.css','platform/ui/compact-controls.css','platform/ui/contrast-system.css']){
  const c=fs.readFileSync(file,'utf8');
  const hex=[...c.matchAll(/#[0-9a-fA-F]{3,8}/g)].map(x=>x[0]);
  assert.equal(hex.length,0,file+' must consume semantic tokens instead of hard-coded colors: '+hex.join(','));
}

console.log('BAUMAN_FUTURE_INTERFACE_SYSTEM_STATIC_PASS',JSON.stringify({htmlSurfaces:html.length}));
