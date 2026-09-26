import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/hub-readable-typography-v1.css','utf8');
const shell=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');

assert.ok(index.includes('assets/css/hub-readable-typography-v1.css?v=1'),'readable typography stylesheet missing');
assert.ok(index.indexOf('hub-readable-typography-v1.css?v=1')>index.indexOf('thesis-reference-v1.css?v=1'),'readable typography must load after tab-specific styles');
assert.ok(index.includes('ChatGPT · 16px'),'normal font-size label must explain the target');
assert.ok(index.includes('Lớn · 18px'),'large font-size label missing');
assert.ok(index.includes('Rất lớn · 20px'),'xlarge font-size label missing');
assert.ok(index.includes('data-hub-density="comfort"'),'default hub density must prefer readability');
assert.ok(index.includes('assets/js/hub-safe-shell.js?v=6'),'appearance shell cache version was not bumped');

for(const marker of [
  '--hub-readable-body:16px',
  '--hub-readable-control:14px',
  '--hub-readable-small:13px',
  '#page-subjects .subjects-page__course-name b',
  '#page-schedule .schedule-ref__event b',
  '#page-research .thesis-page__event b',
  'body[data-hub-reference-v5="1"] #appearanceBtn',
  '.appearance-menu .profile-line:has(#themeSelect)'
]) assert.ok(css.includes(marker),'missing readable typography rule: '+marker);

assert.ok(css.includes('display:inline-flex!important'),'Appearance button must be visible');
assert.ok(css.includes('font-size:var(--hub-readable-control)!important'),'Controls must use readable tokens');
assert.ok(css.includes('height:auto!important'),'Dense one-screen surfaces must be allowed to grow');
assert.ok(shell.includes("density:'comfort'"),'appearance presets must use comfortable density');
assert.ok(!shell.includes("focus:{theme:'night',font:'system',size:'compact'"),'Focus preset must not silently shrink text');
assert.ok(shell.includes('Night · 16px'),'focus preset copy must show actual readable size');

console.log('HUB_READABLE_TYPOGRAPHY_V1_STATIC_PASS');
