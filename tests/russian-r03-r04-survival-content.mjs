import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root='subjects/russian/';
const rows=JSON.parse(fs.readFileSync(root+'data/listen-write-lessons.json','utf8'));
const code=fs.readFileSync(root+'assets/learning-flow.js','utf8');
const start=code.indexOf('// R03–R04 CONTENT-FIRST · derived practice projection');
assert.ok(start>0,'Survival practice must extend the existing learning-flow owner');
const isolated=code.slice(start,code.lastIndexOf('})();'));
new vm.Script('(function(){'+isolated+'})()',{filename:'r03-r04-survival-isolated.js'});
assert.ok(!isolated.includes('localStorage.setItem(')&&!isolated.includes('touch('),
  'Candidate practice must never write official learner evidence/mastery');
const ids={
  R03:['LW_ITEM_R03_REG','LW_ITEM_R03_DOCS'],
  R04:['LW_ITEM_R04_METRO','LW_ITEM_R04_DOCTOR']
};
const contexts=[
  {lesson:'R03',voice:true},
  {lesson:'R04',voice:true},
  {lesson:'R03',voice:false},
  {lesson:'R04',missingSource:true},
  {lesson:'R03',view:'overview'}
];
const results=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const scenario of contexts){
  let panel=null,current=scenario.lesson,view=scenario.view||'learning',tts=0,recorded=0,lastRecord=null;
  const listeners={},windowEvents={},host={prepend(node){panel=node}};
  const document={
    getElementById(id){return id==='view'?host:id==='ruSurvivalPractice'?panel:null},
    createElement(){return {id:'',innerHTML:'',setAttribute(){},remove(){panel=null}}},
    addEventListener(event,cb){listeners[event]=cb},
    querySelector(){return null}
  };
  const window={
    speechSynthesis:{getVoices(){return scenario.voice===false?[]:[{lang:'ru-RU'}]}},
    addEventListener(event,cb){windowEvents[event]=cb},
    RussianAudioEngine:{
      speak(text,opts){assert.ok(rows.some(row=>row.items.some(it=>it.printSample===text)),'Only canonical source text may reach TTS');tts++;opts.onStart?.();return {started:true}},
      playSource(url){assert.equal(url,'blob:local-recording');return {started:true}}
    },
    RussianRecordingEngine:{
      async start(opts){recorded++;lastRecord=()=>opts.onStop?.({size:400,url:'blob:local-recording'});return {started:true}},
      stop(){lastRecord?.();return true},
      getLastRecording(){return {url:'blob:local-recording'}}
    }
  };
  const fetch=async requested=>{
    assert.equal(requested,'data/listen-write-lessons.json');
    if(scenario.missingSource)throw Error('SOURCE_BLOCKED_TEST');
    return {ok:true,json:async()=>rows};
  };
  vm.runInNewContext('(function(){'+isolated+'})()',{
    window,document,fetch,
    readCore:()=>({view,stage:'vn'}),
    activeLessonId:()=>current,
    preA0Esc:esc,
    preA0Voice:()=>scenario.voice!==false
  },{timeout:1500});
  windowEvents['russian:core-render']();
  for(let n=0;n<6;n++)await new Promise(resolve=>setImmediate(resolve));
  const status=()=>window.RussianSurvivalPracticeCandidate.status();
  const click=async(action,id)=>{
    const btn={dataset:{survival:action,id},closest(selector){return selector==='#ruSurvivalPractice [data-survival]'?this:null}};
    await listeners.click({target:btn,preventDefault(){},stopPropagation(){}});
  };
  if(view!=='learning'){
    assert.equal(panel,null);assert.equal(status().sourceReady,false);
    results.push({scenario,result:'NO_INJECTION_OUTSIDE_LEARNING'});continue;
  }
  if(scenario.missingSource){
    assert.match(panel.innerHTML,/SOURCE_BLOCKED_TEST/);
    assert.equal(status().sourceReady,false);
    results.push({scenario,result:'FAIL_CLOSED_ON_SOURCE_ERROR'});continue;
  }
  assert.equal(status().sourceReady,true);
  if(scenario.voice===false){
    assert.match(panel.innerHTML,/BLOCKED_AUDIO/);
    assert.equal(tts,0);
  }
  for(const id of ids[scenario.lesson]){
    await click('scenario',id);
    assert.equal(status().selectedItem,id);
    const item=rows.find(row=>row.lessonId===scenario.lesson).items.find(it=>it.id===id);
    await click('listen');await click('reveal');
    assert.ok(panel.innerHTML.includes(esc(item.printSample)),'Script should reveal only the real source sentence');
    await click('next');await click('record');await click('stop');
    assert.match(panel.innerHTML,/Bản ghi tạm thời đã có/);
    await click('replay');
    await click('next');
    const wrong=ids[scenario.lesson].find(x=>x!==id);
    await click('visual',wrong);
    assert.match(panel.innerHTML,/Thử lại/);
    await click('visual',id);
    assert.match(panel.innerHTML,/Đã ghép đúng câu/);
    await click('next');
    assert.match(panel.innerHTML,/Cyrillic/);
    await click('next');
    listeners.input({target:{id:'ruSurvivalReply',value:'KHÔNG PHẢI CÂU NGUỒN'}});
    await click('check');
    assert.match(panel.innerHTML,/Đối chiếu nguyên văn với nguồn/);
    listeners.input({target:{id:'ruSurvivalReply',value:item.printSample}});
    await click('check');await click('next');
    assert.match(panel.innerHTML,/HUMAN_RU03_REQUIRED/);
    assert.equal(status().step,5);
    assert.equal(status().masteryWrites,false);
    assert.equal(status().audioAuthority,'UNVERIFIED');
  }
  results.push({scenario,scenes:ids[scenario.lesson],step:status().step,tts,recorded,
    result:'TWO_CANONICAL_SCENES_SIX_STEPS'});
}
console.log('RUSSIAN_SURVIVAL_R03_R04_NODE_PASS',JSON.stringify(results));
