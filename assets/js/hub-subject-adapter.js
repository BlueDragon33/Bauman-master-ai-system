/* Hub descriptors, public summaries and legacy launch compatibility. No subject internals. */
(()=>{
  'use strict';
  const STATES=Object.freeze({CURRENT:'CURRENT',STALE:'STALE',UNAVAILABLE:'UNAVAILABLE',LOCAL_HUB:'LOCAL_HUB'});
  const own=(o,k)=>Boolean(o&&Object.prototype.hasOwnProperty.call(o,k));
  const valid=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
  const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v))));
  const field=(value,{status=value==null?'UNAVAILABLE':'CURRENT',source='hub',asOf=null,reason=''}={})=>({status,value:status==='UNAVAILABLE'?null:value,source,asOf,reason});
  const unavailable=(source,reason)=>field(null,{status:'UNAVAILABLE',source,reason});
  function normalizedProgress(map,id,{source='hub.state.progress',status='CURRENT',asOf=null}={}){
    return own(map,id)&&valid(map[id])?field(clamp(map[id]),{source,status,asOf}):unavailable(source,'progress_missing');
  }
  function summary(s,id){
    const contract=s.subjectContracts?.[id],exported=s.subjectSummaries?.[id]?.progressSummary;
    if(contract&&contract.status!=='registered')return unavailable('subject.contract:'+id,'contract_unavailable');
    const capability=contract?.readCapabilities?.find(x=>x.capability==='progressSummary');
    if(contract&&!capability)return unavailable('subject.contract:'+id,'progress_capability_unregistered');
    if(capability){
      if(exported?.status!=null&&!['CURRENT','STALE','UNAVAILABLE'].includes(exported.status))return unavailable('subject.contract:'+id,'invalid_summary_status');
      if(!exported||exported.status==='UNAVAILABLE'||!valid(exported.value))return unavailable('subject.contract:'+id,'summary_unavailable');
      const stamp=Date.parse(exported.asOf),ttl=Number(capability.ttlSeconds);
      const fresh=Number.isFinite(stamp)&&stamp<=Date.now()&&Number.isFinite(ttl)&&ttl>0&&Date.now()-stamp<=ttl*1000&&exported.status!=='STALE';
      return field(clamp(exported.value),{status:fresh?'CURRENT':'STALE',source:exported.source||'subject.contract:'+id,asOf:exported.asOf||null,reason:fresh?'':'summary_not_fresh'});
    }
    // Existing Hub progress is produced by the approved public progress-message receiver.
    // Unregistered subjectSummaries are deliberately ignored.
    return normalizedProgress(s.progress||{},id);
  }
  function progress(map,id,options={}){
    const s=window.state;
    return s&&map===s.progress?summary(s,id):normalizedProgress(map,id,options);
  }
  function averageProgress(map,ids,{source='hub.state.progress'}={}){
    const unique=[...new Set(ids||[])],rows=unique.map(id=>progress(map,id,{source})),known=rows.filter(x=>Number.isFinite(x.value));
    const complete=known.length===rows.length&&known.every(x=>x.status==='CURRENT');
    const result=known.length?field(Math.round(known.reduce((a,b)=>a+b.value,0)/known.length),{status:complete?'CURRENT':'STALE',source,reason:complete?'':'partial_or_stale_progress'}):unavailable(source,'progress_missing');
    return {...result,knownCount:known.length,totalCount:rows.length};
  }
  function safePath(path){
    const value=String(path||'');
    return /^subjects\/[a-z0-9_-]+\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.html(?:[?#][^\s<>"']*)?$/i.test(value)?value:null;
  }
  function resolveLaunch(s,id,mode='learning'){
    const descriptor=s.subjects?.[id],contract=s.subjectContracts?.[id];
    if(!descriptor||contract&&contract.status!=='registered')return unavailable('hub.launch-adapter','launch_unavailable');
    if(mode!=='learning'&&mode!=='authoring')return unavailable('hub.launch-adapter','capability_unavailable');
    const authoring=mode==='authoring';
    if(authoring&&!contract?.sendCapabilities?.some(x=>x.capability==='authoring'))return unavailable('hub.launch-adapter','authoring_unregistered');
    const target=authoring?contract.authoringLaunchDescriptor?.path:contract?.launchDescriptor?.path||descriptor.mainPath;
    const path=safePath(target);
    return path?{...field(path,{source:contract?'subject.contract:'+id:'hub.legacy-launch-adapter'}),subjectId:id,contractVersion:contract?.contractVersion||'legacy-launch-v1'}:unavailable('hub.launch-adapter','unsafe_or_missing_launch');
  }
  function read(s,id){
    const d=s.subjects?.[id];
    if(!d)return null;
    return {subjectId:id,displayName:d.name||id,icon:d.icon||'•',stage:d.stage||null,progressSummary:summary(s,id),launchDescriptor:resolveLaunch(s,id)};
  }
  const label=(x,{suffix='',unavailable='Chưa có dữ liệu',stalePrefix='Chưa đồng bộ · '}={})=>!x||x.status==='UNAVAILABLE'?unavailable:(x.status==='STALE'?stalePrefix:'')+String(x.value??'')+suffix;
  const numericLabel=(x,suffix='%')=>Number.isFinite(x?.value)?String(x.value)+suffix:'—';
  const cssPercent=x=>Number.isFinite(x?.value)?clamp(x.value):0;
  window.BAUMAN_HUB_SUBJECTS={STATES,field,progress,averageProgress,read,resolveLaunch,label,numericLabel,cssPercent,local:(value,options={})=>field(value,{...options,status:'LOCAL_HUB'})};
})();
