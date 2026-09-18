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
        route:canonicalFor('russian-core-state','route',routeLegacyId),
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
