// Math UX root-cause regression contracts. Browser acceptance remains separate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const source=name=>readFileSync(fileURLToPath(new URL('../assets/'+name,import.meta.url)),'utf8');
const nav=source('math-navigation.js');
const dashboard=source('math-dashboard.js');
const flow=source('math-learning-flow.js');
for(const [name,text] of Object.entries({nav,dashboard,flow})){
  test(name+' is valid JavaScript',()=>assert.doesNotThrow(()=>new vm.Script(text)));
}
test('navigation retains DOM button identity during sync',()=>{
  assert.match(nav,/const matches=buttons\.length===PRIMARY_ITEMS\.length/);
  assert.match(nav,/if\(!matches\)\{/);
  assert.match(nav,/buttons\.forEach\(\(button,i\)=>/);
  assert.match(nav,/button\.getAttribute\('aria-current'\)!==current/);
});
test('overview does not churn identical dashboard markup and metrics',()=>{
  assert.match(dashboard,/function updateDashboardText\(selector,value\)/);
  assert.match(dashboard,/el\.textContent!==String\(value\)/);
  assert.match(dashboard,/if\(review\.innerHTML!==html\)review\.innerHTML=html/);
});
test('learning refresh does not remount the same progress and studybar',()=>{
  assert.match(flow,/if\(host\.__mathRenderedHtml!==html\|\|!host\.firstElementChild\)/);
  assert.match(flow,/if\(bar\.__mathRenderedHtml!==barHtml\|\|!bar\.firstElementChild\)/);
  assert.match(flow,/noteInput\.dataset\.mathLfNoteBound!=='1'/);
});
test('learner note focus survives a necessary rerender',()=>{
  assert.match(flow,/const noteFocus=document\.activeElement\?\.id==='mathLfNote'/);
  assert.match(flow,/input\?\.focus\(\{preventScroll:true\}\)/);
  assert.match(flow,/input\.setSelectionRange\(noteCaret\.start,noteCaret\.end\)/);
});
