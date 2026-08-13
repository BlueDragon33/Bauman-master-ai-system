'use strict';

const fs=require('fs');
function assert(condition,message){if(!condition)throw new Error(message);console.log('PASS:',message);}
const index=fs.readFileSync('index.html','utf8');
const scripts=[
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/storage-adapter.js',
  'assets/js/platform/state-schema.js',
  'assets/js/platform/main-state-repository.js',
  'assets/js/platform/personal-learning-schema.js',
  'assets/js/platform/personal-learning-migrator.js',
  'assets/js/platform/personal-learning-repository.js',
  'assets/js/platform/personal-learning-bootstrap.js',
  'assets/js/platform/platform-bootstrap.js',
  'assets/js/data.js',
  'assets/js/main.js',
  'assets/js/planning-main.js'
];
let last=-1;
for(const src of scripts){
  const pos=index.indexOf(`src="${src}"`);
  assert(pos>=0,`index loads ${src}`);
  assert(pos>last,`index script order is safe for ${src}`);
  last=pos;
}
const config=fs.readFileSync('assets/js/platform/runtime-config.js','utf8');
assert(/personalLearningShadow:\s*false/.test(config),'Personal Learning shadow remains explicitly OFF in runtime config');
console.log('L4 INDEX REGRESSION: ALL CHECKS PASSED');
