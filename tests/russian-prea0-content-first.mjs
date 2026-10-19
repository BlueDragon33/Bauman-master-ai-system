import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root='subjects/russian/';
const json=name=>JSON.parse(fs.readFileSync(root+'data/'+name+'.json','utf8'));
const curriculum=json('curriculum');
const lessons=json('listen-write-lessons');
const letters=json('handwriting-listen-write');
const provenance=json('provenance');
const videos=json('videos');
const ids=curriculum.modules.find(m=>m.stage==='vn')?.lessonIds;
assert.deepEqual(ids,['R01','R02','R03','R04','R05','R06']);
const audit=ids.map(id=>{
  const row=lessons.find(x=>x.lessonId===id);
  assert.ok(row?.items?.length>=2,id+' needs two real source-bound items');
  const drills=row.items.reduce((n,item)=>n+(item.drills?.length||0),0);
  assert.ok(drills>=2,id+' has no usable listen-write drills');
  return {id,items:row.items.length,drills};
});
assert.equal(letters.length,33);
assert.equal(new Set(letters.map(x=>x.letter)).size,33);
assert.equal(videos.length,24);
assert.ok(videos.every(x=>x.offlineMapping===false&&x.sourceStatus==='suggestion'));
assert.equal(provenance.datasets.filter(x=>x.status==='VERIFIED').length,0);
assert.equal(provenance.datasets.filter(x=>x.status==='UNVERIFIED').length,5);
assert.equal(provenance.datasets.filter(x=>x.status==='PARTIAL').length,7);
const reg=JSON.parse(fs.readFileSync(root+'engine/content/review/ru03-reviewers.v1.json','utf8'));
assert.equal(reg.reviewers.length,0);
const glyph=fs.readFileSync(root+'assets/handwriting-glyph-authority.js','utf8');
assert.match(glyph,/status:'blocked'/);

const code=fs.readFileSync(root+'assets/learning-flow.js','utf8');
const index=code.indexOf('// Pre-A0 first action: reuse R02/RHW canonical source paths');
assert.ok(index>0,'Pre-A0 module must be integrated in existing learning flow');
const isolated=code.slice(index,code.lastIndexOf('})();'));
assert.ok(!isolated.includes('localStorage.setItem('),'Pre-A0 must not create a second learner storage writer');
assert.ok(!isolated.includes("touch('"),'Pre-A0 candidate must not record canonical mastery');
assert.ok(!isolated.includes('Romanization'),'Pre-A0 should not substitute transliteration for RU source');
new vm.Script('(function(){'+isolated+'})()',{filename:'prea0-isolated.js'});

function harness({voice=true,failSource=false}={}){
  let panel=null,playCount=0,recordCount=0,stopped=false;
  const events={};
  const docEvents={};
  const view={prepend(node){panel=node;}};
  const document={
    getElementById(id){return id==='view'?view:(id==='ruPreA0'?panel:null)},
    createElement(){return {id:'',innerHTML:'',className:'',setAttribute(){},remove(){panel=null}}},
    addEventListener(name,fn){docEvents[name]=fn},
    querySelector(){return null}
  };
  const window={
    speechSynthesis:{getVoices:()=>voice?[{lang:'ru-RU'}]:[]},
    RussianAudioEngine:{
      speak(_value,opts){playCount++;opts.onStart?.();return {started:true}},
      playSource(){return {started:true}}
    },
    RussianRecordingEngine:{
      async start(opts){recordCount++;this.stopHandler=()=>opts.onStop?.({size:133,url:'blob:local'});return {started:true}},
      stop(){this.stopHandler?.();return true},
      getLastRecording(){return {url:'blob:local'}}
    },
    addEventListener(name,fn){events[name]=fn}
  };
  const fetch=async uri=>{
    if(failSource)throw Error('SOURCE_BLOCKED');
    assert.ok(uri==='data/listen-write-lessons.json'||uri==='data/handwriting-listen-write.json');
    return {ok:true,json:async()=>json(uri.includes('handwriting-')?'handwriting-listen-write':'listen-write-lessons')};
  };
  vm.runInNewContext('(function(){'+isolated+'})()',{
    document,window,fetch,readCore:()=>({view:'learning',stage:'vn'}),
    activeLessonId:()=> 'R01',console
  },{timeout:1500});
  async function click(action,answer){
    const btn={dataset:{prea0:action,answer},closest:s=>s==='#ruPreA0 [data-prea0]'?btn:null};
    assert.ok(docEvents.click,'Missing click binding');
    await docEvents.click({target:btn,preventDefault(){},stopPropagation(){}});
  }
  const input=value=>docEvents.input({target:{id:'ruPreA0Reply',value}});
  return {window,events,click,input,get html(){return panel?.innerHTML||''},
    get audio(){return playCount},get recordings(){return recordCount}};
}
async function drive(h){
  h.events['russian:core-render']();
  for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.window.RussianPreA0Candidate.status().loaded,true);
  assert.match(h.html,/PRE-A0.*nguồn R02/);
  await h.click('speak');
  await h.click('reveal');
  assert.match(h.html,/Здравствуйте/);
  await h.click('next');
  await h.click('record');await h.click('stop');
  assert.match(h.html,/bản ghi tạm/);
  await h.click('next');await h.click('visual','hello');
  assert.match(h.html,/Đúng tình huống/);
  await h.click('next');await h.click('letter','А');
  assert.match(h.html,/Đúng chữ А/);
  await h.click('next');h.input('Здравствуйте.');await h.click('check');
  assert.match(h.html,/Khớp câu mẫu nguồn R02/);
  await h.click('next');assert.match(h.html,/UNVERIFIED/);
  const status=h.window.RussianPreA0Candidate.status();
  assert.equal(status.masteryWrites,false);
  assert.equal(status.audioAuthority,'UNVERIFIED');
  assert.equal(status.step,5);
}
const online=harness();
await drive(online);
assert.equal(online.audio,1);
assert.equal(online.recordings,1);
const noVoice=harness({voice:false});
noVoice.events['russian:core-render']();
for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
assert.match(noVoice.html,/BLOCKED_AUDIO/);
await noVoice.click('speak');assert.equal(noVoice.audio,0);
const bad=harness({failSource:true});
bad.events['russian:core-render']();
for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
assert.match(bad.html,/SOURCE_BLOCKED/);
assert.equal(bad.window.RussianPreA0Candidate.status().loaded,false);
console.log('PREA0_CONTENT_FIRST_NODE_PASS',JSON.stringify({
  sourceAudit:audit,uniqueCyrillic:letters.length,videosOffline:0,ru03VerifiedDatasets:0,
  interactiveSteps:6,ttsFailClosed:true,sourceFailClosed:true,masteryWrites:false
}));
