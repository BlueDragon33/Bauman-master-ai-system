import assert from 'node:assert/strict';
import fs from 'node:fs';

const facade='assets/js/platform/hub-personal-store.js';
assert.ok(fs.existsSync(facade),'Hub must have one shared personal-data facade');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.indexOf(facade)<html.indexOf('assets/js/main.js'),'Store must load before canonical Hub owner');
const owners=['main','academic-main','academic-scheduler-preview','academic-scheduler-apply','app-manager-managed-access','schedule-reference-v1','subjects-reference-v1','thesis-reference-v1'];
const preferences={main:[], 'academic-main':[], 'academic-scheduler-preview':[], 'academic-scheduler-apply':[], 'app-manager-managed-access':[], 'schedule-reference-v1':['VIEW_KEY','SUGGESTION_KEY'], 'subjects-reference-v1':['UI_KEY'], 'thesis-reference-v1':['UI_KEY']};
for(const owner of owners){
  const source=fs.readFileSync(`assets/js/${owner}.js`,'utf8');
  for(const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*([^,)]+)/g))assert.ok(preferences[owner].includes(match[1].trim()),`${owner}: direct personal-data storage owner ${match[1]}`);
  assert.ok(source.includes('BAUMAN_HUB_PERSONAL_STORE'),`${owner} must use the shared personal-data boundary`);
}
console.log('HUB_PERSONAL_STORAGE_STATIC_PASS');
