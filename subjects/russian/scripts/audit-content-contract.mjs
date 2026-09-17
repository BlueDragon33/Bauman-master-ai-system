import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const vocab=read('vocab');
const lessons=read('lessons');
const speaking=read('speaking');

const arr=v=>Array.isArray(v)?v:[];
const str=v=>String(v??'').trim();
const candidates={
 term:['ru','phrase_ru','front','word','term'],
 stress:['stressed_ru','stressed','accented_ru','accented','stress','stress_mark','stressIndex','stress_index','accent'],
 pronunciation:['pronunciation','pron','transcription','ipa','phonetic'],
 audio:['audio','audio_url','audioUrl','voice_url','voice','tts'],
 meaningVi:['meaning_vi','vi_vi','vi','meaning_vietnamese'],
 meaningRu:['meaning_ru','meaning','definition'],
 english:['clue_en','en'],
 partOfSpeech:['part_of_speech','partOfSpeech','pos','word_type'],
 forms:['forms','inflections','declension','conjugation'],
 example:['example','voice_text','usage','example_ru'],
 lesson:['lessonId','lesson_id','routeId','chapterId'],
 stage:['stage'],
 tags:['tags']
};
function first(item,keys){for(const key of keys){const value=item?.[key];if(value!==undefined&&value!==null&&value!==''&&(Array.isArray(value)?value.length:true))return {key,value};}return null;}
const acute=/\u0301/;
const cyr=/[А-Яа-яЁё]/;
const vowel=/[АЕЁИОУЫЭЮЯаеёиоуыэюя]/g;
const keyFrequency={};
for(const item of vocab){for(const key of Object.keys(item||{}))keyFrequency[key]=(keyFrequency[key]||0)+1;}
const coverage={};
for(const [name,keys] of Object.entries(candidates)){
 let count=0;const keyCounts={};
 for(const item of vocab){const found=first(item,keys);if(found){count++;keyCounts[found.key]=(keyCounts[found.key]||0)+1;}}
 coverage[name]={count,total:vocab.length,percent:Number((100*count/Math.max(1,vocab.length)).toFixed(2)),keys:keyCounts};
}
let terms=0,withAcute=0,withYo=0,singleVowel=0,multiVowelNoStress=0,cyrTerms=0;
let pronIpaStress=0,pronAcute=0,pronApostrophe=0,pronUppercaseHint=0;
const stressSamples=[];
const pronunciationSamples=[];
for(const item of vocab){
 const termHit=first(item,candidates.term);const term=str(termHit?.value);if(!term)continue;terms++;
 if(cyr.test(term))cyrTerms++;
 const vowels=term.match(vowel)||[];
 const stressHit=first(item,candidates.stress);
 const explicit=stressHit?str(stressHit.value):'';
 const pron=str(first(item,candidates.pronunciation)?.value);
 if(acute.test(term)||acute.test(explicit))withAcute++;
 if(/[Ёё]/.test(term))withYo++;
 if(vowels.length===1)singleVowel++;
 if(vowels.length>1&&!acute.test(term)&&!/[Ёё]/.test(term)&&!explicit)multiVowelNoStress++;
 if(/[ˈˌ]/.test(pron))pronIpaStress++;
 if(acute.test(pron))pronAcute++;
 if(/[’'`´]/.test(pron))pronApostrophe++;
 if(/[A-ZА-ЯЁ]{2,}/.test(pron))pronUppercaseHint++;
 if(pronunciationSamples.length<18)pronunciationSamples.push({term,pron,meaning:first(item,candidates.meaningVi)?.value||'',stage:item?.stage||''});
 if(stressHit&&stressSamples.length<12)stressSamples.push({term,field:stressHit.key,value:stressHit.value,pron});
}
const topKeys=Object.entries(keyFrequency).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([key,count])=>({key,count,percent:Number((100*count/Math.max(1,vocab.length)).toFixed(2))}));
const lessonIds=new Set(arr(lessons).map(x=>str(x?.id||x?.lessonId)).filter(Boolean));
let vocabLessonLinked=0,vocabLessonUnknown=0;
for(const item of vocab){const hit=first(item,candidates.lesson);if(!hit)continue;vocabLessonLinked++;if(!lessonIds.has(str(hit.value)))vocabLessonUnknown++;}
let speakingLessonLinked=0,speakingLessonUnknown=0;
for(const item of arr(speaking)){const id=str(item?.lessonId||item?.lesson_id||item?.routeId||item?.chapterId);if(!id)continue;speakingLessonLinked++;if(!lessonIds.has(id))speakingLessonUnknown++;}
const report={
 schema:'RUSSIAN_CONTENT_CONTRACT_AUDIT_V1',
 counts:{vocab:vocab.length,lessons:arr(lessons).length,speaking:arr(speaking).length},
 coverage,
 stressEvidence:{terms,cyrTerms,withAcute,withYo,singleVowel,multiVowelNoStress,explicitStressField:coverage.stress.count},
 pronunciationEvidence:{ipaStress:pronIpaStress,acute:pronAcute,apostrophe:pronApostrophe,uppercaseHint:pronUppercaseHint},
 links:{vocabLessonLinked,vocabLessonUnknown,speakingLessonLinked,speakingLessonUnknown},
 topKeys,
 stressSamples,
 pronunciationSamples
};
console.log('RUSSIAN_CONTENT_CONTRACT_AUDIT='+JSON.stringify(report));
console.log('RUSSIAN_CONTENT_CONTRACT_SUMMARY='+JSON.stringify({coverage,stressEvidence:report.stressEvidence,pronunciationEvidence:report.pronunciationEvidence,links:report.links,pronunciationSamples}));
if(!Array.isArray(vocab)||!vocab.length)throw new Error('Vocabulary dataset missing/empty');
if(!coverage.term.count)throw new Error('Vocabulary has no detectable Russian term field');
if(!coverage.meaningVi.count&&!coverage.english.count&&!coverage.meaningRu.count)throw new Error('Vocabulary has no detectable meaning field');
console.log('RUSSIAN_CONTENT_CONTRACT_AUDIT=PASS');
