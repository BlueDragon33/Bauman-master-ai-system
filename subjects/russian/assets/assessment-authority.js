'use strict';
(function(){
  const SCHEMA='RUSSIAN_ASSESSMENT_AUTHORITY_V1';
  const VERIFIED=new Set(['VERIFIED','VERIFIED_WITH_VARIANTS']);
  let provenance=null,loadError=null,loaded=false;

  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const statusOf=v=>clean(v).toUpperCase();

  function recordsOf(source){
    if(!source||typeof source!=='object')return [];
    if(Array.isArray(source.records))return source.records;
    if(Array.isArray(source.sources))return source.sources;
    return [];
  }

  function assessmentRecord(source=provenance){
    return recordsOf(source).find(row=>{
      const id=clean(row?.id||row?.datasetId||row?.ownerId).toLowerCase();
      const path=clean(row?.path||row?.owner||row?.canonicalOwner).toLowerCase();
      return id==='assessment-bank'||path.endsWith('/tests.json')||path==='subjects/russian/data/tests.json';
    })||null;
  }

  function sourceRefsOf(value){
    const refs=value?.sourceRefs||value?.sources||value?.provenance?.sourceRefs||value?.provenance?.sources||[];
    return arr(refs).map(clean).filter(Boolean);
  }

  function reviewed(value){
    const reviewer=clean(value?.reviewer||value?.reviewedBy||value?.provenance?.reviewer||value?.provenance?.reviewedBy);
    const reviewedAt=clean(value?.reviewedAt||value?.validatedAt||value?.provenance?.reviewedAt||value?.provenance?.validatedAt);
    return Boolean(reviewer&&reviewedAt);
  }

  function itemAuthority(item,dataset){
    const itemStatus=statusOf(item?.authorityStatus||item?.validationStatus||item?.provenance?.status||item?.provenance?.validationResult);
    if(VERIFIED.has(itemStatus)){
      const ok=sourceRefsOf(item).length>0&&reviewed(item);
      return {eligible:ok,status:itemStatus,scope:'item',reason:ok?'item-verified':'item-verification-metadata-incomplete'};
    }

    const datasetStatus=statusOf(dataset?.validationStatus||dataset?.status||dataset?.validationResult);
    const datasetSources=sourceRefsOf(dataset);
    const datasetReviewed=reviewed(dataset);
    const itemExplicitlyUnsafe=['UNVERIFIED','INCORRECT','DISPUTED','CONTEXT_DEPENDENT'].includes(itemStatus);
    const datasetEligible=VERIFIED.has(datasetStatus)&&datasetSources.length>0&&datasetReviewed&&!itemExplicitlyUnsafe;
    return {
      eligible:datasetEligible,
      status:itemStatus||datasetStatus||'UNKNOWN',
      scope:datasetEligible?'dataset':'none',
      reason:datasetEligible?'dataset-verified':'missing-verified-answer-key-authority'
    };
  }

  function evaluateOfficialAssessment(input={}){
    const questions=arr(input.questions);
    const source=input.provenance||provenance;
    const dataset=assessmentRecord(source);
    if(!questions.length)return {schema:SCHEMA,officialEligible:false,reason:'empty-assessment',datasetStatus:statusOf(dataset?.validationStatus||dataset?.status)||'UNKNOWN',items:[]};
    if(!source)return {schema:SCHEMA,officialEligible:false,reason:loaded?'provenance-unavailable':'provenance-not-ready',datasetStatus:'UNKNOWN',items:[]};

    const items=questions.map((item,index)=>{
      const authority=itemAuthority(item,dataset);
      return {index,id:clean(item?.id||item?.itemId||item?.questionId)||'item-'+(index+1),...authority};
    });
    const officialEligible=items.every(x=>x.eligible);
    return {
      schema:SCHEMA,
      officialEligible,
      reason:officialEligible?'verified-answer-key-authority':'unverified-answer-key-authority',
      datasetStatus:statusOf(dataset?.validationStatus||dataset?.status||dataset?.validationResult)||'UNKNOWN',
      datasetId:clean(dataset?.id||dataset?.datasetId)||'assessment-bank',
      verifiedItems:items.filter(x=>x.eligible).length,
      totalItems:items.length,
      items
    };
  }

  async function load(){
    if(loaded)return provenance;
    try{
      const res=await fetch('data/provenance.json',{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      provenance=await res.json();
      loadError=null;
    }catch(error){
      provenance=null;
      loadError=String(error?.message||error);
    }finally{
      loaded=true;
      window.dispatchEvent(new CustomEvent('russian:assessment-authority',{detail:status()}));
    }
    return provenance;
  }

  function status(){
    const dataset=assessmentRecord();
    return {
      schema:SCHEMA,
      loaded,
      available:Boolean(provenance),
      error:loadError,
      datasetStatus:statusOf(dataset?.validationStatus||dataset?.status||dataset?.validationResult)||'UNKNOWN',
      failClosed:true
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{load();});
  window.RussianAssessmentAuthority={schema:SCHEMA,load,status,evaluateOfficialAssessment};
})();