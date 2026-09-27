import assert from 'node:assert/strict';
import fs from 'node:fs';

const required=[
  'platform/ui/index.css',
  'platform/ui/tokens.css',
  'platform/ui/components.css',
  'platform/ui/layouts.css',
  'platform/ui/patterns.css',
  'platform/ui/motion.css',
  'platform/ui/utilities.css',
  'platform/ui/app-shell.css',
  'platform/ui/legacy-adapters.css',
  'platform/ui/runtime.js',
  'docs/future-interface/MASTER_EXECUTION.md',
  'docs/future-interface/UI-E1_AUDIT.md'
];
for(const p of required) assert.ok(fs.existsSync(p),'Missing future UI artifact: '+p);

const index=fs.readFileSync('index.html','utf8');
const tokens=fs.readFileSync('platform/ui/tokens.css','utf8');
const shell=fs.readFileSync('platform/ui/app-shell.css','utf8');
const runtime=fs.readFileSync('platform/ui/runtime.js','utf8');
const main=fs.readFileSync('assets/css/main.css','utf8');
const safe=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const ux=fs.readFileSync('assets/js/hub-safe-ux.js','utf8');
const precision=fs.readFileSync('assets/js/hub-reference-precision-v5.js','utf8');
const roadmapCss=fs.readFileSync('assets/css/hub-roadmap-comprehensive-v2.css','utf8');

for(const href of ['platform/ui/tokens.css?v=1','platform/ui/components.css?v=1','platform/ui/layouts.css?v=1','platform/ui/patterns.css?v=1','platform/ui/motion.css?v=1','platform/ui/utilities.css?v=1','platform/ui/app-shell.css?v=1','platform/ui/legacy-adapters.css?v=1']) assert.ok(index.includes(href),'Future UI stylesheet missing: '+href);
assert.ok(index.includes('platform/ui/runtime.js?v=1'),'Future UI runtime is not activated');
assert.ok(index.indexOf('platform/ui/app-shell.css?v=1')>index.indexOf('hub-readable-typography-v1.css?v=2'),'Canonical App Shell must load after legacy styles during migration');
assert.ok(index.includes('data-hub-wallpaper="plain"'),'Default product surface must not depend on decorative wallpaper');
assert.ok(!index.includes('canva-main-v1 canva-main-v2'),'Legacy Canva body generations must not own the canonical shell');

for(const marker of [
  '--ui-surface-primary',
  '--ui-space-4:16px',
  '--ui-radius-md:12px',
  '--ui-motion-normal:180ms',
  '--ui-touch:44px',
  '--ui-reading-max:78ch'
]) assert.ok(tokens.includes(marker),'Missing token: '+marker);

assert.ok(tokens.includes('body[data-theme="night"]'),'Dark mode token scale missing');
assert.ok(shell.includes('.ui-mobile-nav'),'Mobile navigation contract missing');
assert.ok(shell.includes('body[data-ui-focus-mode="true"]'),'Focus mode shell contract missing');
assert.ok(runtime.includes("e.key.toLowerCase()==='k'"),'Ctrl/Cmd+K command palette binding missing');
assert.ok(runtime.includes('data-ui-page="schedule"'),'Mobile schedule navigation missing');
assert.ok(runtime.includes('setFocus'),'Focus mode runtime missing');
assert.ok(!main.startsWith(':root{'),'Legacy main.css still owns root tokens');
assert.ok(safe.includes("wallpaper:'plain'"),'Safe shell still defaults to decorative wallpaper');
assert.ok(!safe.includes("e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'"),'Legacy Ctrl/Cmd+K listener still conflicts with command palette');
assert.ok(!ux.includes('hub-safe-motto'),'Legacy motto must not clutter the canonical topbar');
assert.ok(!ux.includes('data-safe-ux="appearance"'),'Appearance duplicate must not be injected into the topbar');
assert.ok(precision.includes("dataset.hubReferenceV5='retired'"),'Legacy precision orchestrator must be retired');
assert.ok(!precision.includes("dataset.hubReferenceV5='1'"),'Legacy precision shell must not reactivate');
const roadmapShellPrefix=roadmapCss.split('/* Page geometry */')[0];
assert.ok(!roadmapShellPrefix.includes('data-hub-roadmap-v4="1"'),'Roadmap must not own the global App Shell');

const platformFiles=required.filter(p=>p.startsWith('platform/ui/')&&p.endsWith('.css'));
for(const p of platformFiles){
  const c=fs.readFileSync(p,'utf8');
  assert.ok(!/z-index:\s*9999/i.test(c),p+' uses forbidden extreme z-index');
}
console.log('BAUMAN_FUTURE_UI_STATIC_PASS');
