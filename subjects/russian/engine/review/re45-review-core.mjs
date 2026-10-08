import {createHash} from 'node:crypto';

const txt=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];

export function stableStringify(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';
}

export function fingerprint(value){
  return createHash('sha256').update(stableStringify(value),'utf8').digest('hex');
}

export function finalizeReviewItem(base){
  const reviewed={
    sourceCatalog:base.sourceCatalog,
    sourceRevision:base.sourceRevision,
    sourceSceneId:base.sourceSceneId,
    utteranceKind:base.utteranceKind,
    textRu:base.textRu,
    worldId:base.worldId,
    situationVi:base.situationVi,
    speakerRole:base.speakerRole,
    recipientRole:base.recipientRole,
    register:base.register,
    expectedAction:base.expectedAction,
    expectedVisual:base.expectedVisual,
    audio:base.audio
  };
  const textReviewed={...reviewed};
  delete textReviewed.audio;
  return Object.freeze({
    ...base,
    textFingerprint:fingerprint(textReviewed),
    audioFingerprint:base.audio?.immutableAudioSha256||null,
    reviewFingerprint:fingerprint(reviewed),
    requiredReviews:Object.freeze(['TEXT','AUDIO']),
    canonicalPublicationReady:false
  });
}

export function verifyReviewDecision(item,decision){
  const errors=[];
  if(decision?.reviewerAuthority!=='HUMAN_RU03')errors.push('HUMAN_RU03 authority required');
  if(!txt(decision?.reviewerId))errors.push('reviewer id required');
  if(!['TEXT','AUDIO'].includes(decision?.scope))errors.push('invalid scope');
  if(!['APPROVE','CHANGES_REQUESTED','REJECT'].includes(decision?.decision))errors.push('invalid decision');
  if(decision?.itemId!==item?.itemId)errors.push('item mismatch');
  if(decision?.reviewFingerprint!==item?.reviewFingerprint)errors.push('stale review fingerprint');
  if(decision?.scope==='TEXT'&&decision?.textFingerprint!==item?.textFingerprint)errors.push('stale text fingerprint');
  if(decision?.scope==='AUDIO'){
    if(!item?.audioFingerprint)errors.push('immutable audio missing');
    if(decision?.audioFingerprint!==item?.audioFingerprint)errors.push('stale audio fingerprint');
  }
  return Object.freeze({ok:errors.length===0,errors});
}

export function buildReadinessReport(inventory,decisions=[]){
  const entries=inventory.items.map(item=>{
    const related=arr(decisions).filter(d=>d?.itemId===item.itemId);
    const checked=related.map(decision=>({decision,result:verifyReviewDecision(item,decision)}));
    const valid=checked.filter(x=>x.result.ok).map(x=>x.decision);
    const stale=checked.filter(x=>!x.result.ok).length;
    const rejected=valid.some(x=>x.decision!=='APPROVE');
    const textApproved=valid.some(x=>x.scope==='TEXT'&&x.decision==='APPROVE');
    const audioApproved=valid.some(x=>x.scope==='AUDIO'&&x.decision==='APPROVE');
    let status='linguistic_review_pending';
    if(rejected)status='rejected';
    else if(textApproved&&!audioApproved)status='audio_review_pending';
    else if(textApproved&&audioApproved)status='approved';
    else if(stale)status='stale';
    return Object.freeze({itemId:item.itemId,status,textApproved,audioApproved,staleDecisionCount:stale,canonicalPublicationReady:status==='approved'});
  });
  const counts=entries.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
  const promotionReady=entries.length>0&&entries.every(x=>x.canonicalPublicationReady);
  return Object.freeze({schema:'RUSSIAN_ENGINE_RE45_READINESS_V1',itemCount:entries.length,counts:Object.freeze(counts),entries:Object.freeze(entries),promotionReady,canonicalPublicationReady:promotionReady});
}
