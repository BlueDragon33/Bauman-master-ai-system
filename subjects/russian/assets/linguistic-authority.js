'use strict';
(function(){
  const SCHEMA='RUSSIAN_LINGUISTIC_AUTHORITY_RUNTIME_V1';
  const VERIFIED=new Set(['VERIFIED','VERIFIED_WITH_VARIANTS']);
  let registry=null;
  let ready=false;
  let loadError=null;

  const clean=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const byId=id=>(registry?.datasets||[]).find(x=>clean(x?.id)===clean(id))||null;

  function normalizeStatus(v){
    const s=clean(v).toUpperCase();
    if(VERIFIED.has(s))return s;
    if(['SOURCE_ASSERTED','PARTIAL','UNVERIFIED','REJECTED','CONTEXT_DEPENDENT','DISPUTED','INCORRECT'].includes(s))return s;
    return 'UNKNOWN';
  }
  function datasetStatus(datasetId){
    const row=byId(datasetId);
    return {
      datasetId:clean(datasetId),
      status:normalizeStatus(row?.status),
      confidence:clean(row?.confidence)||'UNKNOWN',
      owner:row?.owner||null,
      knownGaps:Array.isArray(row?.knownGaps)?[...row.knownGaps]:[],
      sourceEvidence:Array.isArray(row?.sourceEvidence)?[...row.sourceEvidence]:[],
      rule:clean(row?.rule),
      authoritative:VERIFIED.has(normalizeStatus(row?.status)),
      known:Boolean(row)
    };
  }
  function itemStatus(datasetId,item){
    const ds=datasetStatus(datasetId);
    const explicit=normalizeStatus(item?.authorityStatus||item?.validationResult||item?.status);
    const status=explicit!=='UNKNOWN'?explicit:ds.status;
    const sourceRefs=Array.isArray(item?.sourceRefs)?item.sourceRefs.filter(Boolean):[];
    const authoritative=VERIFIED.has(status)&&sourceRefs.some(x=>!clean(x).startsWith('repo:'));
    return {...ds,status,sourceRefs,authoritative,itemId:clean(item?.id||item?.canonicalId||item?.key)};
  }
  function guard(datasetId,item,{authoritativeUse=false}={}){
    const result=item?itemStatus(datasetId,item):datasetStatus(datasetId);
    const allowed=!authoritativeUse||result.authoritative===true;
    return {
      ...result,
      allowed,
      mode:authoritativeUse?'AUTHORITATIVE':'PRACTICE',
      reason:allowed?'OK':`FAIL_CLOSED:${result.status}`,
      label:result.authoritative?'Đã xác minh nguồn':result.status==='UNKNOWN'?'Chưa có hồ sơ thẩm quyền':`Chưa đủ thẩm quyền (${result.status})`
    };
  }
  async function load(){
    if(ready)return clone(registry);
    try{
      const r=await fetch('data/provenance.json',{cache:'force-cache'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(data?.policy!=='FAIL_CLOSED'||!Array.isArray(data?.datasets))throw new Error('invalid provenance registry');
      registry=data;ready=true;loadError=null;
      window.dispatchEvent(new CustomEvent('russian:linguistic-authority-ready',{detail:{schema:SCHEMA}}));
      return clone(registry);
    }catch(error){
      ready=false;loadError=String(error?.message||error);
      return null;
    }
  }
  function status(){return {schema:SCHEMA,ready,error:loadError,policy:registry?.policy||'FAIL_CLOSED',datasets:(registry?.datasets||[]).length};}

  window.RussianLinguisticAuthority={schema:SCHEMA,load,status,datasetStatus,itemStatus,guard,registry:()=>clone(registry)};
  document.addEventListener('DOMContentLoaded',()=>{void load();});
})();