import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const speaking=read('speaking');
const lessons=read('lessons');
const arr=v=>Array.isArray(v)?v:[];
const str=v=>String(v??'').trim();
const lessonIds=new Set(arr(lessons).map(x=>str(x?.id)).filter(Boolean));
const keyCount={};
const utteranceKeyCount={};
let linked=0,unknown=0,withUtterances=0,totalUtterances=0,withTurns=0,withViTurns=0,withSeed=0;
let withAudioField=0,withScoreField=0,withTranscriptField=0;
const samples=[];
for(const item of arr(speaking)){
  for(const k of Object.keys(item||{}))keyCount[k]=(keyCount[k]||0)+1;
  const lessonId=str(item?.lessonId||item?.lesson_id||item?.routeId||item?.chapterId);
  if(lessonId){linked++;if(!lessonIds.has(lessonId))unknown++;}
  const utterances=arr(item?.utterances);
  if(utterances.length){withUtterances++;totalUtterances+=utterances.length;}
  if(arr(item?.turns).length)withTurns++;
  if(arr(item?.vi_turns).length)withViTurns++;
  if(arr(item?.vocabulary_seed_ru).length)withSeed++;
  for(const u of utterances){
    for(const k of Object.keys(u||{}))utteranceKeyCount[k]=(utteranceKeyCount[k]||0)+1;
    const keys=Object.keys(u||{}).map(x=>x.toLowerCase());
    if(keys.some(k=>k.includes('audio')||k.includes('voice')))withAudioField++;
    if(keys.some(k=>k.includes('score')||k.includes('similarity')))withScoreField++;
    if(keys.some(k=>k.includes('transcript')||k.includes('recognized')))withTranscriptField++;
  }
  if(samples.length<5)samples.push({id:str(item?.id),lessonId,title:str(item?.title||item?.context_title_vi),utteranceCount:utterances.length,utteranceKeys:Object.keys(utterances[0]||{}).slice(0,20)});
}
const report={
  schema:'RUSSIAN_SPEAKING_COACH_AUDIT_V1',
  counts:{speaking:arr(speaking).length,lessons:arr(lessons).length,linked,unknown,withUtterances,totalUtterances,withTurns,withViTurns,withSeed},
  evidenceFields:{withAudioField,withScoreField,withTranscriptField},
  topItemKeys:Object.entries(keyCount).sort((a,b)=>b[1]-a[1]).slice(0,35),
  topUtteranceKeys:Object.entries(utteranceKeyCount).sort((a,b)=>b[1]-a[1]).slice(0,35),
  samples
};
console.log('RUSSIAN_SPEAKING_COACH_AUDIT='+JSON.stringify(report));
if(!Array.isArray(speaking)||speaking.length!==1220)throw new Error(`Expected 1220 speaking items, found ${arr(speaking).length}`);
if(linked!==speaking.length||unknown)throw new Error(`Speaking lesson linkage regressed: linked=${linked}, unknown=${unknown}`);
if(!withUtterances||!totalUtterances)throw new Error('Speaking utterance source is empty');
console.log('RUSSIAN_SPEAKING_COACH_AUDIT=PASS');
