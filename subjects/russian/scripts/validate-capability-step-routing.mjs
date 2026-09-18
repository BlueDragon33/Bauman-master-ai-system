import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js=fs.readFileSync('subjects/russian/assets/capability-progression.js','utf8');
let domReady=null;
let flow={
  lessons:{
    R01:{steps:{theory:{ok:true},speaking:{ok:false},check:{ok:false}}},
    R02:{steps:{theory:{ok:false},speaking:{ok:false},check:{ok:false}}},
    R03:{steps:{theory:{ok:false},speaking:{ok:false},check:{ok:false}}},
    R04:{steps:{theory:{ok:false},speaking:{ok:false},check:{ok:false}}}
  }
};
const storage=new Map([['core',JSON.stringify({stage:'vn'})]]);
const context={
  console,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},
  document:{
    addEventListener:(type,fn)=>{if(type==='DOMContentLoaded')domReady=fn;},
    getElementById:()=>null
  },
  requestAnimationFrame:fn=>{fn();return 1;},
  MutationObserver:class{observe(){} disconnect(){}},
  CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}},
  setTimeout,
  clearTimeout,
  fetch:async url=>({ok:true,json:async()=>String(url).includes('curriculum.json')
    ?{stages:[{id:'vn'}],modules:[{stage:'vn',lessonIds:['R01','R02','R03','R04']}]}
    :[]}),
  SUBJECT_ADAPTER:{id:'russian',storageKey:'core'},
  RussianLearningFlow:{
    get:()=>flow,
    hasMeaningfulEvidence:(_step,row)=>!!row?.ok
  },
  RussianLearningState:{dueReviews:()=>[]},
  RussianAcademicLanguage:{get:()=>({writing:{}})},
  BaumanSubjectHost:{send:()=>true,trusted:()=>true},
  addEventListener:()=>{},
  dispatchEvent:()=>{}
};
context.window=context;context.globalThis=context;
vm.runInNewContext(js,context,{filename:'capability-progression.js'});
assert.equal(typeof domReady,'function','DOMContentLoaded initializer missing');
await domReady();

const api=context.RussianCapabilityProgression;
assert.ok(api,'Capability runtime missing');
let band=api.currentBand();
assert.equal(band.id,'R0');
assert.equal(band.missingLesson,'R01');
assert.equal(band.missingStep,'speaking');
assert.deepEqual(JSON.parse(JSON.stringify(band.missingRoute)),{view:'learning',learnTab:'practice',lessonId:'R01'});
let payload=api.bridgePayload();
assert.equal(payload.nextGap.step,'speaking');
assert.deepEqual(JSON.parse(JSON.stringify(payload.nextGap.route)),{view:'learning',learnTab:'practice',lessonId:'R01'});

flow.lessons.R01.steps.speaking.ok=true;
band=api.currentBand();
assert.equal(band.missingStep,'check');
assert.deepEqual(JSON.parse(JSON.stringify(band.missingRoute)),{view:'learning',learnTab:'review',lessonId:'R01'});
payload=api.bridgePayload();
assert.equal(payload.nextGap.step,'check');
assert.equal(payload.nextGap.route.learnTab,'review');

flow.lessons.R01.steps.check.ok=true;
band=api.currentBand();
assert.equal(band.missingLesson,'R02');
assert.equal(band.missingStep,'theory');
assert.deepEqual(JSON.parse(JSON.stringify(band.missingRoute)),{view:'learning',learnTab:'theory',lessonId:'R02'});

console.log('RUSSIAN_CAPABILITY_STEP_ROUTING_GATE=PASS');
console.log('Checks: theory evidence -> speaking/practice; speaking evidence -> check/review; completed lesson -> next lesson/theory.');
