'use strict';

const fs = require('fs');
const vm = require('vm');

function read(file){return fs.readFileSync(file,'utf8');}
function assert(condition,message){if(!condition)throw new Error(message);console.log('PASS:',message);}
function makeLocalStorage(seed){
  const map=new Map(Object.entries(seed||{}));
  return {
    getItem(k){return map.has(k)?map.get(k):null;},
    setItem(k,v){map.set(k,String(v));},
    removeItem(k){map.delete(k);}
  };
}

const mainKey='bauman_main_all_phases_subjects_v1';
const storage=makeLocalStorage({
  [mainKey]:JSON.stringify({progress:{},schedule:{entries:{}},subjectReports:{},reviewQueue:[],activity:[],researchChecks:{},researchFiles:{},subjects:{}})
});
const window={localStorage:storage,console,addEventListener(){},removeEventListener(){}};
const context=vm.createContext({window,console,Date,Map,Set,Object,Array,JSON,String,Number,Math,TypeError});

for(const file of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/storage-adapter.js',
  'assets/js/platform/main-state-repository.js',
  'assets/js/platform/personal-learning-schema.js',
  'assets/js/platform/personal-learning-migrator.js',
  'assets/js/platform/personal-learning-repository.js',
  'assets/js/platform/personal-learning-bootstrap.js'
])new vm.Script(read(file),{filename:file}).runInContext(context);

const feature=window.BaumanPersonalLearning;
const schema=window.BaumanPersonalLearningSchema;
assert(!!feature,'Personal Learning bootstrap is available');
assert(feature.status().enabled===false,'Personal Learning shadow feature is OFF by default');
assert(storage.getItem(schema.shadowKey)===null,'loading bootstrap does not create shadow storage');
const skipped=feature.refreshIfEnabled({test:true});
assert(skipped.skipped===true&&skipped.reason==='feature-disabled','disabled bootstrap refuses automatic shadow refresh');
assert(storage.getItem(schema.shadowKey)===null,'disabled refresh leaves storage untouched');
assert(storage.getItem(mainKey)!==null,'legacy main state remains present');
console.log('L4 BOOTSTRAP REGRESSION: ALL CHECKS PASSED');
