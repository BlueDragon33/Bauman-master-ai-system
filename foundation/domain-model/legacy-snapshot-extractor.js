'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanLegacySnapshotExtractor=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clean=value=>String(value??'').trim();
  const ownKeys=value=>value&&typeof value==='object'&&!Array.isArray(value)?Object.keys(value):[];
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const ROUTE_FIELDS=['view','learnTab','lessonId','slide','exerciseIndex','reviewIndex','reviewPage','examIndex','examPage','dialogueId','dialogueLineIndex','practiceDialogueId','practiceLineIndex','deepSpeakingId','deepSpeakingStep','mediaId','vocabIndex','vocabPage','grammarIndex','handwritingIndex','handwritingStep','writingIndex'];
  const descriptor=(systemId,scope,legacyId)=>({systemId,scope,legacyId:clean(legacyId)});
  function coreRouteId(core){
    if(!core||typeof core!=='object')return '';
    const pairs=[];
    for(const key of ROUTE_FIELDS){const value=core[key];if(value===undefined||value===null||value==='')continue;pairs.push(`${key}=${String(value)}`);}
    return pairs.join('&');
  }
  function extractCore(value){
    if(!value||typeof value!=='object'||Array.isArray(value)||!ownKeys(value).length)return [];
    const out=[descriptor('russian-core-state','state','current')],route=coreRouteId(value);
    if(route)out.push(descriptor('russian-core-state','route',route));
    return out;
  }
  function extractLearning(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return [];
    const out=[];
    for(const id of ownKeys(value.items))out.push(descriptor('russian-learning-state','item',id));
    for(const id of ownKeys(value.reviewQueue))out.push(descriptor('russian-learning-state','review',id));
    if(value.resume&&typeof value.resume==='object')out.push(descriptor('russian-learning-state','resume','current'));
    return out;
  }
  function extractFlow(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return [];
    const out=[];
    for(const lessonId of ownKeys(value.lessons)){
      out.push(descriptor('russian-learning-flow','lesson',lessonId));
      const lesson=value.lessons[lessonId];
      for(const step of ownKeys(lesson?.steps))out.push(descriptor('russian-learning-flow','step',`${lessonId}:${step}`));
    }
    return out;
  }
  function extractVocab(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return [];
    return [
      ...ownKeys(value.cards).map(id=>descriptor('russian-vocab-srs','card',id)),
      ...ownKeys(value.sentences).map(id=>descriptor('russian-vocab-srs','sentence',id))
    ];
  }
  function extractAcademic(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return [];
    return [
      ...ownKeys(value.grammar).map(id=>descriptor('russian-academic-language','grammar',id)),
      ...ownKeys(value.reading).map(id=>descriptor('russian-academic-language','reading',id)),
      ...ownKeys(value.writing).map(id=>descriptor('russian-academic-language','writing',id))
    ];
  }
  function extractHost(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return [];
    const out=[];
    if(clean(value.subjectId))out.push(descriptor('bauman-subject-host','subject',value.subjectId));
    if(clean(value.courseId))out.push(descriptor('bauman-subject-host','course',value.courseId));
    if(clean(value.taskId))out.push(descriptor('bauman-subject-host','task',value.taskId));
    if(clean(value.missionId))out.push(descriptor('bauman-subject-host','mission',value.missionId));
    return out;
  }
  const EXTRACTORS=Object.freeze({
    'russian-core-state':extractCore,
    'russian-learning-state':extractLearning,
    'russian-learning-flow':extractFlow,
    'russian-vocab-srs':extractVocab,
    'russian-academic-language':extractAcademic,
    'bauman-subject-host':extractHost
  });
  function dedupeSort(rows){
    const seen=new Set(),out=[];
    for(const row of rows){
      if(!row?.systemId||!row?.scope||!row?.legacyId)continue;
      const key=`${row.systemId}|${row.scope}|${row.legacyId}`;
      if(seen.has(key))continue;seen.add(key);out.push({...row});
    }
    return out.sort((a,b)=>a.systemId.localeCompare(b.systemId)||a.scope.localeCompare(b.scope)||a.legacyId.localeCompare(b.legacyId));
  }
  function extractSystem(systemId,snapshot){const fn=EXTRACTORS[clean(systemId)];if(!fn)throw new Error(`LEGACY_SNAPSHOT_EXTRACTOR_UNKNOWN_SYSTEM:${clean(systemId)}`);return dedupeSort(fn(clone(snapshot)));}
  function extractAll(registry,snapshots){
    const source=snapshots&&typeof snapshots==='object'?snapshots:{};const out=[];
    for(const system of Array.isArray(registry?.systems)?registry.systems:[]){const fn=EXTRACTORS[system.systemId];if(!fn)throw new Error(`LEGACY_SNAPSHOT_EXTRACTOR_MISSING:${system.systemId}`);out.push(...fn(clone(source[system.systemId])));}
    return dedupeSort(out);
  }
  return Object.freeze({schema:'BAUMAN_LEGACY_SNAPSHOT_EXTRACTOR_V1',routeFields:Object.freeze([...ROUTE_FIELDS]),extractSystem,extractAll,coreRouteId});
});
