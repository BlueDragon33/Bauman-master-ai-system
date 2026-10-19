// R01 content-first lab: test all 33 existing letter owners, not a new font/audio authority.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root='subjects/russian/';
const letters=JSON.parse(fs.readFileSync(root+'data/handwriting-listen-write.json','utf8'));
const lessons=JSON.parse(fs.readFileSync(root+'data/listen-write-lessons.json','utf8'));
const code=fs.readFileSync(root+'assets/learning-flow.js','utf8');
const start=code.indexOf('// Pre-A0 first action: reuse R02/RHW canonical source paths');
const end=code.indexOf('// R03–R04 CONTENT-FIRST · derived practice projection',start);
assert.ok(start>0&&end>start,'R01 must extend, not replace the existing Pre-A0 owner');
const isolated=code.slice(start,end);
new vm.Script('(function(){'+isolated+'})()',{filename:'prea0-with-alphabet.js'});
assert.equal(letters.length,33);
assert.equal(new Set(letters.map(l=>l.letter)).size,33);
assert.ok(!isolated.includes('localStorage.setItem(')&&!isolated.includes('touch('),
  'R01 alphabet interactions must not grant official mastery or mutate learner data');
const textEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function simulate({voice=true,corrupt=false}={}){
  const src=corrupt?letters.slice(1):letters;
  const handlers={click:[],input:[],toggle:[]},winEvents={};
  let panel=null,tts=[];
  const view={prepend(x){panel=x}};
  const document={
    getElementById(id){return id==='view'?view:id==='ruPreA0'?panel:null},
    createElement(){return{id:'',innerHTML:'',setAttribute(){},remove(){panel=null}}},
    addEventListener(k,cb){(handlers[k]??=[]).push(cb)},
    querySelector(){return null}
  };
  const window={
    speechSynthesis:{getVoices:()=>voice?[{lang:'ru-RU'}]:[]},
    addEventListener(k,cb){(winEvents[k]??=[]).push(cb)},
    RussianAudioEngine:{speak(name,opts){
      assert.ok(src.some(row=>row.letterNameText===name),'Only canonical letter names may be synthesized');
      tts.push(name);opts.onStart?.();return{started:true};
    }}
  };
  vm.runInNewContext('(function(){'+isolated+'})()',{
    document,window,readCore:()=>({view:'learning',stage:'vn'}),
    activeLessonId:()=> 'R01',
    fetch:async p=>{
      assert.ok(['data/listen-write-lessons.json','data/handwriting-listen-write.json'].includes(p));
      return {ok:true,json:async()=>p.includes('handwriting')?src:lessons};
    }
  },{timeout:2000});
  for(const cb of winEvents['russian:core-render']||[])cb();
  for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));
  const click=async(act,choice)=>{
    const node={dataset:{alpha:act,choice},closest(selector){return selector==='#ruPreA0 [data-alpha]'?this:null}};
    for(const cb of handlers.click)await cb({target:node,preventDefault(){},stopPropagation(){}});
  };
  assert.match(panel.innerHTML,/Luyện 33 chữ Cyrillic/);
  await click('toggle');
  if(corrupt){
    assert.match(panel.innerHTML,/BLOCKED_LETTER_DATA/);
    return {blockedIncompleteSource:true,tts:tts.length};
  }
  if(!voice)assert.match(panel.innerHTML,/BLOCKED_AUDIO/);
  else{
    await click('hear');
    assert.deepEqual(tts,[letters[0].letterNameText]);
  }
  for(let i=0;i<letters.length;i++){
    const row=letters[i];
    assert.ok(panel.innerHTML.includes('Chữ '+(i+1)+'/33'),'Letter index mismatch '+i);
    if(row.soundKind==='sign')assert.match(panel.innerHTML,/DẤU — không có âm riêng/);
    const distractor=row.drills.find(d=>d.kind==='hear_select').choices.find(x=>x!==row.letter);
    await click('choose',distractor);
    assert.match(panel.innerHTML,/Chưa đúng/);
    await click('choose',row.letter);
    assert.match(panel.innerHTML,/Nhận mặt chữ đúng/);
    if(i<letters.length-1)await click('next');
  }
  assert.match(panel.innerHTML,/Đã chọn 33\/33 chữ trong phiên/);
  assert.match(panel.innerHTML,/mastery/);
  assert.match(panel.innerHTML,/data-route='\{"view":"writing","mode":"handwriting"\}'/);
  await click('restart');
  assert.match(panel.innerHTML,/Chữ 1\/33/);
  await click('toggle');
  assert.match(panel.innerHTML,/Nhại|Nghe mẫu|BLOCKED_AUDIO/);
  return {letters:33,signs:letters.filter(r=>r.soundKind==='sign').map(r=>r.letter),tts:tts.length,
    candidateOnly:true,masteryWrites:false,hasWritingHandoff:true};
}
const normal=await simulate(),noVoice=await simulate({voice:false}),broken=await simulate({corrupt:true});
assert.equal(noVoice.tts,0);
assert.equal(broken.blockedIncompleteSource,true);
console.log('RUSSIAN_R01_ALPHABET_CANDIDATE_PASS',JSON.stringify({normal,noVoice,broken}));
