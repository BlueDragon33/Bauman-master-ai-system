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
assert.ok(runtime.includes('routeOwnership:false'),'Shared runtime must not own application routing');\nassert.ok(runtime.includes('installPrimaryNavigation'),'UI-E5 primary navigation architecture missing');\nassert.ok(runtime.includes("setAttribute('aria-current','page')"),'UI-E5 active-route accessibility state missing');\nassert.ok(runtime.includes('bui-mobile-nav'),'UI-E5 mobile navigation mirror missing');\nassert.ok(responsive.includes('.bui-mobile-nav'),'UI-E5 mobile navigation presentation missing');\nassert.ok(responsive.includes('safe-area-inset-bottom'),'UI-E5 mobile safe-area handling missing');
assert.ok(runtime.includes('BAUMAN_UI'),'Shared UI runtime API missing');

for(const file of ['platform/ui/foundations.css','platform/ui/components.css','platform/ui/layouts.css','platform/ui/responsive.css']){
  const c=fs.readFileSync(file,'utf8');
  const hex=[...c.matchAll(/#[0-9a-fA-F]{3,8}/g)].map(x=>x[0]);
  assert.equal(hex.length,0,file+' must consume semantic tokens instead of hard-coded colors: '+hex.join(','));
}

console.log('BAUMAN_FUTURE_INTERFACE_SYSTEM_STATIC_PASS',JSON.stringify({htmlSurfaces:html.length}));
