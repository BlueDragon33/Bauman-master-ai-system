const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

export const PROMOTION_STATES=Object.freeze([
  'DRAFT',
  'GENERATED_UNREVIEWED',
  'FIXTURE_NONCANONICAL',
  'REVIEW_CANDIDATE',
  'RU03_APPROVED',
  'PUBLISHED_REFERENCE',
  'SUPERSEDED',
  'ARCHIVED'
]);

const ALLOWED=Object.freeze({
  DRAFT:new Set(['REVIEW_CANDIDATE','ARCHIVED']),
  GENERATED_UNREVIEWED:new Set(['REVIEW_CANDIDATE','ARCHIVED']),
  FIXTURE_NONCANONICAL:new Set(['REVIEW_CANDIDATE','ARCHIVED']),
  REVIEW_CANDIDATE:new Set(['RU03_APPROVED','ARCHIVED']),
  RU03_APPROVED:new Set(['PUBLISHED_REFERENCE','ARCHIVED']),
  PUBLISHED_REFERENCE:new Set(['SUPERSEDED','ARCHIVED']),
  SUPERSEDED:new Set(['ARCHIVED']),
  ARCHIVED:new Set()
});

function stableString(value){
  if(Array.isArray(value))return '['+value.map(stableString).join(',')+']';
  if(value&&typeof value==='object'){
    return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableString(value[k])).join(',')+'}';
  }
  return JSON.stringify(value);
}

export function stableContentFingerprint(value){
  const text=stableString(value);
  let h=2166136261;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return 'fnv1a32-'+(h>>>0).toString(16).padStart(8,'0');
}

export function validatePromotionCandidate(candidate){
  const errors=[];
  if(!clean(candidate?.contentId))errors.push('contentId required');
  if(!clean(candidate?.revision))errors.push('revision required');
  if(!PROMOTION_STATES.includes(candidate?.state))errors.push('invalid promotion state');
  if(!clean(candidate?.provenance?.status))errors.push('provenance.status required');
  if(!clean(candidate?.semanticTarget))errors.push('semanticTarget required');
  if(!arr(candidate?.competencies).length)errors.push('competencies required');
  if(!clean(candidate?.linguisticPayload?.language)||candidate?.linguisticPayload?.language!=='ru')errors.push('linguisticPayload.language must be ru');
  if(!clean(candidate?.linguisticPayload?.text)&&!clean(candidate?.canonicalRef))errors.push('text or canonicalRef required');
  if(candidate?.state==='RU03_APPROVED'||candidate?.state==='PUBLISHED_REFERENCE'){
    if(!clean(candidate?.review?.authority)||candidate.review.authority!=='RU03')errors.push('RU03 approval authority required');
    if(candidate?.review?.decision!=='APPROVE')errors.push('RU03 approve decision required');
    if(!clean(candidate?.review?.reviewerId))errors.push('reviewerId required');
    if(!clean(candidate?.review?.reviewedRevision)||candidate.review.reviewedRevision!==candidate.revision)errors.push('reviewedRevision must match revision');
  }
  return {ok:errors.length===0,errors};
}

export function createPromotionRegistry(){
  const records=new Map();
  const history=[];

  function key(contentId,revision){return clean(contentId)+'@'+clean(revision);}

  function register(candidate){
    const valid=validatePromotionCandidate(candidate);
    if(!valid.ok)throw new Error('Promotion candidate invalid: '+valid.errors.join('; '));
    const k=key(candidate.contentId,candidate.revision);
    const fingerprint=stableContentFingerprint({
      provenance:candidate.provenance,
      semanticTarget:candidate.semanticTarget,
      competencies:candidate.competencies,
      linguisticPayload:candidate.linguisticPayload,
      canonicalRef:candidate.canonicalRef||null
    });
    const existing=records.get(k);
    if(existing){
      if(existing.fingerprint!==fingerprint)throw new Error('immutable revision conflict '+k);
      return {created:false,record:copy(existing)};
    }
    const record={...copy(candidate),fingerprint};
    records.set(k,record);
    history.push({type:'register',contentId:record.contentId,revision:record.revision,state:record.state,fingerprint});
    return {created:true,record:copy(record)};
  }

  function transition({contentId,revision,to,review=null,canonicalRef=null}={}){
    const k=key(contentId,revision);
    const current=records.get(k);
    if(!current)throw new Error('unknown promotion record '+k);
    if(!PROMOTION_STATES.includes(to))throw new Error('invalid target state '+to);
    if(!ALLOWED[current.state]?.has(to))throw new Error('illegal promotion transition '+current.state+' -> '+to);

    const next=copy(current);
    next.state=to;
    if(review)next.review=copy(review);
    if(canonicalRef)next.canonicalRef=clean(canonicalRef);

    if(to==='RU03_APPROVED'||to==='PUBLISHED_REFERENCE'){
      const valid=validatePromotionCandidate(next);
      if(!valid.ok)throw new Error('approval validation failed: '+valid.errors.join('; '));
    }
    if(to==='PUBLISHED_REFERENCE'&&!clean(next.canonicalRef))throw new Error('canonicalRef required for publication');

    records.set(k,next);
    history.push({type:'transition',contentId:next.contentId,revision:next.revision,from:current.state,to});
    return copy(next);
  }

  function supersede({contentId,revision,replacedByRevision}={}){
    const next=transition({contentId,revision,to:'SUPERSEDED'});
    history.push({type:'superseded-by',contentId:clean(contentId),revision:clean(revision),replacedByRevision:clean(replacedByRevision)});
    return next;
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_PROMOTION_REGISTRY_V1',
    register,transition,supersede,
    get(contentId,revision){const r=records.get(key(contentId,revision));return r?copy(r):null;},
    history(){return copy(history);}
  });
}
