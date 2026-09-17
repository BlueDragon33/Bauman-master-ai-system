import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const vocab=read('vocab');
const speaking=read('speaking');
const adapter=fs.readFileSync(path.join(root,'assets','subject-adapter.js'),'utf8');
const arr=v=>Array.isArray(v)?v:[];
const str=v=>String(v??'').trim();
const lower=v=>str(v).toLocaleLowerCase('ru-RU');
const cyr=/[А-Яа-яЁё]/;
const idOf=(v,i)=>str(v?.id||v?.source_id||`vocab_${i}`);
const termOf=v=>str(v?.ru||v?.phrase_ru||v?.front||v?.word||v?.term);
const exampleOf=v=>str(v?.example||v?.example_ru||'');
const voiceOf=v=>str(v?.voice_text||'');

const ids=new Set();let duplicateIds=0,example=0,exampleCyr=0,exampleDistinct=0,exampleContainsTerm=0,voice=0,voiceCyr=0,voiceDistinct=0,tags=0,stage=0;
const stageCounts={}, tagCounts={};
for(let i=0;i<vocab.length;i++){
  const v=vocab[i]||{}, id=idOf(v,i), term=termOf(v), ex=exampleOf(v), vo=voiceOf(v);
  if(ids.has(id))duplicateIds++;else ids.add(id);
  if(ex){example++;if(cyr.test(ex))exampleCyr++;if(lower(ex)!==lower(term))exampleDistinct++;if(term&&lower(ex).includes(lower(term)))exampleContainsTerm++;}
  if(vo){voice++;if(cyr.test(vo))voiceCyr++;if(lower(vo)!==lower(term))voiceDistinct++;}
  if(str(v.stage)){stage++;stageCounts[str(v.stage)]=(stageCounts[str(v.stage)]||0)+1;}
  if(arr(v.tags).length){tags++;for(const t of arr(v.tags)){const k=str(t);if(k)tagCounts[k]=(tagCounts[k]||0)+1;}}
}
const speakingKeys={};let speakingLesson=0,speakingSeed=0,speakingSeedItems=0;
const seedFields=['vocabulary_seed_ru','vocab_ru','vocabulary_ru','keywords_ru','vocab','vocabulary','keywords'];
const seedTerms=new Set();
for(const item of arr(speaking)){
  for(const key of Object.keys(item||{}))speakingKeys[key]=(speakingKeys[key]||0)+1;
  if(str(item?.lessonId||item?.lesson_id||item?.routeId||item?.chapterId))speakingLesson++;
  let had=false;
  for(const key of seedFields){const value=item?.[key];const values=Array.isArray(value)?value:(str(value)?[value]:[]);if(values.length){had=true;speakingSeed+=values.length;for(const x of values){const k=lower(x);if(k)seedTerms.add(k);}}}
  if(had)speakingSeedItems++;
}
let vocabSeedExact=0;
for(const item of vocab){const t=lower(termOf(item));if(t&&seedTerms.has(t))vocabSeedExact++;}
const reviewGaps=(adapter.match(/reviewGaps:\s*\[([^\]]+)\]/)||[])[1]||'';
const report={
 schema:'RUSSIAN_VOCAB_SRS_AUDIT_V1',
 counts:{vocab:vocab.length,speaking:arr(speaking).length,uniqueVocabIds:ids.size,duplicateIds},
 sourceSentence:{example,exampleCyr,exampleDistinct,exampleContainsTerm,voice,voiceCyr,voiceDistinct},
 metadata:{stage,tags,stageCounts,topTags:Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,20)},
 speakingLinkEvidence:{speakingLesson,speakingSeedItems,speakingSeedValues:speakingSeed,uniqueSeedTerms:seedTerms.size,vocabSeedExact},
 speakingTopKeys:Object.entries(speakingKeys).sort((a,b)=>b[1]-a[1]).slice(0,30),
 configuredReviewGaps:reviewGaps
};
console.log('RUSSIAN_VOCAB_SRS_AUDIT='+JSON.stringify(report));
if(!Array.isArray(vocab)||vocab.length!==8000)throw new Error('Expected canonical 8000 vocab items');
if(duplicateIds)throw new Error(`Duplicate vocab ids: ${duplicateIds}`);
if(example!==vocab.length)throw new Error(`Every vocab item must retain source example; found ${example}/${vocab.length}`);
if(stage!==vocab.length||tags!==vocab.length)throw new Error('Stage/tags coverage regressed');
console.log('RUSSIAN_VOCAB_SRS_AUDIT=PASS');
