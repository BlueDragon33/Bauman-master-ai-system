'use strict';

const fs = require('fs');
const vm = require('vm');

function read(file){return fs.readFileSync(file,'utf8');}
function assert(condition,message){if(!condition)throw new Error(message);console.log('PASS:',message);}
function makeLocalStorage(seed){
  const map=new Map(Object.entries(seed));
  return {
    getItem(k){return map.has(k)?map.get(k):null;},
    setItem(k,v){map.set(k,String(v));},
    removeItem(k){map.delete(k);},
    snapshot(){return Object.fromEntries(map.entries());}
  };
}

const legacySeed={
  bauman_main_all_phases_subjects_v1:JSON.stringify({page:'home',progress:{math:7}}),
  bauman_main_users_fullcode_v1:JSON.stringify([{email:'legacy@example.test',password:'legacy-placeholder',role:'user'}]),
  bauman_current_user_fullcode_v1:JSON.stringify({email:'legacy@example.test',role:'user'}),
  bauman_math_final_release:JSON.stringify({legacy:'math-final'}),
  bauman_math_content_system_final_v32:JSON.stringify({legacy:'math-v32'}),
  bauman_math_roadmap_v9_simulation_tabs_lab:JSON.stringify({legacy:'math-v9'}),
  bauman_math_roadmap_v6_new_russian_ui_root:JSON.stringify({legacy:'math-v6'}),
  bauman_math_roadmap_v5_new_russian_ui_root:JSON.stringify({legacy:'math-v5'}),
  bauman_math_responsive_v3:JSON.stringify({legacy:'math-responsive'}),
  bauman_universal_core_v1_russian:JSON.stringify({legacy:'ru-universal'}),
  bauman_subject_core_v5_russian:JSON.stringify({legacy:'ru-v5'}),
  ru_clean_controller_v4:JSON.stringify({legacy:'ru-clean-v4'}),
  ru_clean_controller_v3:JSON.stringify({legacy:'ru-clean-v3'}),
  ru_clean_controller_v2:JSON.stringify({legacy:'ru-clean-v2'}),
  ru_clean_controller_v1:JSON.stringify({legacy:'ru-clean-v1'})
};

const localStorage=makeLocalStorage(legacySeed);
const window={localStorage,console,addEventListener(){},removeEventListener(){}};
const context=vm.createContext({window,console,Date,Map,Set,Object,Array,JSON,String,TypeError});

for(const file of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/storage-adapter.js',
  'assets/js/platform/state-schema.js',
  'assets/js/platform/main-state-repository.js',
  'assets/js/platform/subject-storage.js'
]){
  new vm.Script(read(file),{filename:file}).runInContext(context);
}

const before={...legacySeed};
const repo=window.BaumanMainStateRepository;
const subjectStorage=window.BaumanSubjectStorage.forSubject('math');

assert(repo.readMainState({}).progress.math===7,'main repository can read legacy main state in place');
assert(repo.readUsers([])[0].email==='legacy@example.test','main repository can read legacy users cache in place');
assert(repo.readCurrentUser(null).email==='legacy@example.test','main repository can read legacy session cache in place');

const copyTarget='__l3_legacy_copy_target__';
const copy=subjectStorage.copyLegacyJSON(copyTarget,['bauman_math_final_release','bauman_math_content_system_final_v32'],{test:true});
assert(copy.copied===true,'legacy copy helper can copy first available Math key');
assert(copy.sourceKey==='bauman_math_final_release','legacy copy helper preserves deterministic priority');
subjectStorage.removeItem(copyTarget,{testCleanup:true});

for(const [key,value] of Object.entries(before)){
  assert(localStorage.getItem(key)===value,`legacy payload preserved byte-for-byte: ${key}`);
}

const snapshot=localStorage.snapshot();
assert(!Object.keys(snapshot).some((key)=>key.startsWith('__l3_legacy_copy_target__')),'temporary migration copy key cleaned');
console.log('L3 LEGACY PRESERVATION: ALL CHECKS PASSED');
