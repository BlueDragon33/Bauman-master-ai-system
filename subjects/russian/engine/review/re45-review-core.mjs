import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

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


/**
 * Structure checks alone are NEVER human authorization.
 * This guard is used by readiness/promotion, not by the older structural-only
 * verifyReviewDecision() compatibility tests.
 */
export function verifyAuthorizedReviewDecision(item,decision,registry){
  const errors=[...verifyReviewDecision(item,decision).errors];
  if(registry?.schema!=='RUSSIAN_ENGINE_RU03_REVIEWERS_V1')errors.push('authorized reviewer registry required');
  if(decision?.reviewerType!=='HUMAN')errors.push('human reviewer type required');
  if(!txt(decision?.decisionId))errors.push('decision ID required');
  const at=txt(decision?.decidedAt);
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(at)||Number.isNaN(Date.parse(at)))errors.push('valid UTC decision timestamp required');
  const matches=arr(registry?.reviewers).filter(r=>r?.reviewerId===decision?.reviewerId);
  if(matches.length!==1)errors.push('registered unique reviewer required');
  if(decision?.scope==='AUDIO'){
    const assetFile=txt(item?.audio?.assetFile);
    // A string that looks like SHA-256 is not evidence that any audio exists.
    if(item?.audio?.kind!=='RECORDED'||!/^[a-f0-9]{64}$/.test(item?.audioFingerprint||'')||
       !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:wav|mp3|ogg)$/.test(assetFile)){
      errors.push('recorded, immutable audio asset with safe filename required');
    }else{
      try{
        const bytes=readFileSync(new URL('../content/audio/'+assetFile,import.meta.url));
        const actual=createHash('sha256').update(bytes).digest('hex');
        if(actual!==item.audioFingerprint)errors.push('audio asset SHA-256 mismatch');
      }catch{
        errors.push('immutable audio asset missing or unreadable');
      }
    }
  }
  const r=matches[0];
  if(r){
    if(r.authority!=='HUMAN_RU03'||r.reviewerType!=='HUMAN'||r.status!=='ACTIVE')errors.push('active HUMAN_RU03 reviewer required');
    const qual=decision?.scope==='TEXT'?'RUSSIAN_TEXT':decision?.scope==='AUDIO'?'RUSSIAN_AUDIO':null;
    if(!qual||!arr(r.qualifications).includes(qual))errors.push('reviewer scope qualification required');
    if(r.authorizationEvidence?.status!=='VERIFIED'||!txt(r.authorizationEvidence?.reference)||!txt(r.authorizationEvidence?.verifiedBy)||!txt(r.authorizationEvidence?.verifiedAt)){
      errors.push('independent reviewer credential evidence required');
    }
  }
  return Object.freeze({ok:errors.length===0,errors});
}

export function loadAuthorizedReviewerRegistry(){
  return JSON.parse(readFileSync(new URL('../content/review/ru03-reviewers.v1.json',import.meta.url),'utf8'));
}

export function buildReadinessReport(inventory,decisions=[],{reviewerRegistry=loadAuthorizedReviewerRegistry()}={}){
  const entries=inventory.items.map(item=>{
    const related=arr(decisions).filter(d=>d?.itemId===item.itemId);
    // RE51: an exact hash and a HUMAN_RU03 string are not credentials.
    // A decision without an explicitly authorized qualified human is ignored.
    const checked=related.map(decision=>({decision,result:verifyAuthorizedReviewDecision(item,decision,reviewerRegistry)}));
    const valid=checked.filter(x=>x.result.ok).map(x=>x.decision);
    const stale=checked.filter(x=>!x.result.ok&&x.result.errors.some(e=>/stale|mismatch/i.test(e))).length;
    const unauthorized=checked.filter(x=>!x.result.ok&&!x.result.errors.some(e=>/stale|mismatch/i.test(e))).length;
    const rejected=valid.some(x=>x.decision!=='APPROVE');
    const textApproved=valid.some(x=>x.scope==='TEXT'&&x.decision==='APPROVE');
    const audioApproved=valid.some(x=>x.scope==='AUDIO'&&x.decision==='APPROVE');
    let status='linguistic_review_pending';
    if(rejected)status='rejected';
    else if(textApproved&&!audioApproved)status='audio_review_pending';
    else if(textApproved&&audioApproved)status='approved';
    else if(stale)status='stale';
    return Object.freeze({itemId:item.itemId,status,textApproved,audioApproved,staleDecisionCount:stale,unauthorizedDecisionCount:unauthorized,canonicalPublicationReady:status==='approved'});
  });
  const counts=entries.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
  const promotionReady=entries.length>0&&entries.every(x=>x.canonicalPublicationReady);
  return Object.freeze({schema:'RUSSIAN_ENGINE_RE51_AUTHORIZED_READINESS_V2',itemCount:entries.length,counts:Object.freeze(counts),entries:Object.freeze(entries),promotionReady,canonicalPublicationReady:promotionReady});
}
