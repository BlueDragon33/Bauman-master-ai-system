'use strict';
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BaumanFoundationCanonicalContext=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  const SCHEMA='BAUMAN_FOUNDATION_CANONICAL_CONTEXT_V1';
  const clean=value=>String(value??'').trim();
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const item of Object.values(value))deepFreeze(item);
    return value;
  }
  function projection(){return root.BaumanFoundationIdentityProjection||null;}
  function durable(){return root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.status==='ready'&&root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.durable===true;}
  function canonicalFor(systemId,scope,legacyId){
    const id=clean(legacyId),api=projection();
    if(!durable()||!id||typeof api?.canonicalFor!=='function')return null;
    return api.canonicalFor(systemId,scope,id)||null;
  }
  function routeId(route){
    const extractor=root.BaumanLegacySnapshotExtractor;
    if(!route||typeof route!=='object'||typeof extractor?.coreRouteId!=='function')return '';
    return clean(extractor.coreRouteId(route));
  }
  function routePairs(value){
    const out=new Map();
    for(const part of clean(value).split('&')){
      if(!part)continue;
      const at=part.indexOf('=');
      const key=at>=0?part.slice(0,at):part;
      const val=at>=0?part.slice(at+1):'';
      if(key)out.set(key,val);
    }
    return out;
  }
  function compatibleRouteScore(leftId,rightId){
    const left=routePairs(leftId),right=routePairs(rightId);
    if(!left.size||!right.size)return -1;
    for(const key of ['view','learnTab','lessonId']){
      if(left.has(key)&&right.has(key)&&left.get(key)!==right.get(key))return -1;
    }
    let common=0,conflicts=0;
    for(const [key,value] of left){
      if(!right.has(key))continue;
      if(right.get(key)!==value)conflicts++;else common++;
    }
    if(conflicts||!common)return -1;
    return common*100-Math.abs(left.size-right.size);
  }
  function canonicalRouteFor(routeLegacyId){
    const exact=canonicalFor('russian-core-state','route',routeLegacyId);
    if(exact||!durable()||!routeLegacyId)return exact;
    const api=projection();
    if(typeof api?.list!=='function')return null;
    const matches=api.list({systemId:'russian-core-state',scope:'route'})
      .map(row=>({row,score:compatibleRouteScore(routeLegacyId,row?.legacy?.id)}))
      .filter(item=>item.score>=0)
      .sort((a,b)=>b.score-a.score);
    if(!matches.length)return null;
    if(matches.length>1&&matches[0].score===matches[1].score)return null;
    return clean(matches[0].row?.canonicalId)||null;
  }
  function hostCanonical(task){
    const t=task&&typeof task==='object'?task:{};
    return {
      subject:canonicalFor('bauman-subject-host','subject',t.subjectId),
      course:canonicalFor('bauman-subject-host','course',t.courseId),
      task:canonicalFor('bauman-subject-host','task',t.taskId),
      mission:canonicalFor('bauman-subject-host','mission',t.missionId)
    };
  }
  function reviewCanonical(reviewIds){
    const ids=Array.isArray(reviewIds)?reviewIds:[];
    return ids.map(id=>({legacyId:clean(id),canonicalId:canonicalFor('russian-learning-state','review',id)})).filter(row=>row.legacyId);
  }
  function capture(input={}){
    const source=input&&typeof input==='object'?input:{};
    const route=clone(source.route||null);
    const resume=clone(source.resume||null);
    const hostTask=clone(source.hostTask||null);
    const lessonId=clean(source.lessonId)||clean(route?.lessonId);
    const routeLegacyId=routeId(route);
    const context={
      schema:SCHEMA,
      status:durable()?'ready':'blocked',
      durable:durable(),
      projectionChecksum:durable()?clean(root.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.checksum)||null:null,
      legacy:{
        subjectId:clean(source.subjectId)||clean(hostTask?.subjectId)||null,
        lessonId:lessonId||null,
        routeId:routeLegacyId||null,
        hasResume:!!resume
      },
      canonical:{
        subject:canonicalFor('bauman-subject-host','subject',clean(source.subjectId)||clean(hostTask?.subjectId)),
        lesson:canonicalFor('russian-learning-flow','lesson',lessonId),
        route:canonicalRouteFor(routeLegacyId),
        resume:resume?canonicalFor('russian-learning-state','resume','current'):null,
        review:reviewCanonical(source.reviewIds),
        host:hostCanonical(hostTask)
      },
      policy:{readOnly:true,legacyAuthoritative:true,mayWriteLegacy:false,mayWriteOverlay:false,mayModifyMastery:false}
    };
    return deepFreeze(context);
  }
  function current(input={}){
    const hostTask=input.hostTask||root.BaumanSubjectHost?.getTask?.()||root.BAUMAN_HOST_TASK||null;
    return capture({...input,hostTask});
  }
  return Object.freeze({schema:SCHEMA,capture,current,canonicalFor,routeId});
});
