import fs from 'node:fs';
import crypto from 'node:crypto';

export const PATHS={
  owners:'subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json',
  governance:'subjects/russian/data/authoring-governance.json'
};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stable=v=>{
  if(Array.isArray(v)) return '['+v.map(stable).join(',')+']';
  if(v&&typeof v==='object') return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  return JSON.stringify(v);
};
export const hashProposal=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
export function ownerMap(){
  const r=read(PATHS.owners);
  return new Map((r.owners||[]).map(([entityType,canonicalOwner,status])=>[entityType,{entityType,canonicalOwner,status}]));
}
export function validateCandidate(candidate,{requirePromotion=false}={}){
  const gov=read(PATHS.governance), owners=ownerMap(), errors=[];
  if(candidate?.schema!=='RUSSIAN_RU08_AUTHORING_CANDIDATE_V1') errors.push('candidate schema');
  for(const k of ['candidateId','entityType','canonicalId','revision','rollbackNote','diffSummary']) if(!String(candidate?.[k]??'').trim()) errors.push('missing '+k);
  if(!('proposal' in (candidate||{}))) errors.push('missing proposal');
  const owner=owners.get(candidate?.entityType);
  if(!owner?.canonicalOwner) errors.push('no canonical owner for entity type');
  if(owner?.status?.startsWith('PLANNED')) errors.push('planned owner cannot be browser-promoted until materialized');
  if(!gov.authorableEntityTypes.includes(candidate?.entityType)) errors.push('entity type not authorable');
  if(!gov.lifecycle.candidateStates.includes(candidate?.state)) errors.push('invalid lifecycle state');
  const hash=candidate&&'proposal' in candidate?hashProposal(candidate.proposal):null;
  if(candidate?.contentHash&&candidate.contentHash!==hash) errors.push('contentHash mismatch');
  const promotionStates=new Set(['APPROVED','CANONICAL_PATCHED','PUBLISHED','SUPERSEDED','ARCHIVED']);
  if(requirePromotion||promotionStates.has(candidate?.state)){
    if(!Array.isArray(candidate?.sourceRefs)||!candidate.sourceRefs.length) errors.push('sourceRefs required for promotion');
    if(!String(candidate?.reviewer??'').trim()) errors.push('reviewer required for promotion');
    if(!String(candidate?.reviewedAt??'').trim()) errors.push('reviewedAt required for promotion');
    if(candidate?.generated===true && !['VERIFIED','VERIFIED_WITH_VARIANTS'].includes(String(candidate?.linguisticStatus||''))) errors.push('generated promotion requires RU03 verified status');
  }
  if(candidate?.state==='PUBLISHED'&&!candidate?.canonicalPatched) errors.push('PUBLISHED requires canonicalPatched');
  return {ok:errors.length===0,errors,canonicalOwner:owner?.canonicalOwner||null,ownerStatus:owner?.status||null,contentHash:hash};
}
export function reviewEnvelope(candidate){
  const out=validateCandidate(candidate);
  if(!out.ok) throw new Error(out.errors.join('; '));
  return {
    subjectId:'russian',resourceType:candidate.entityType,resourceId:candidate.canonicalId,
    revision:candidate.revision,contentHash:out.contentHash,sourcePath:out.canonicalOwner,
    summary:candidate.diffSummary,metadataOnly:true,candidateId:candidate.candidateId
  };
}
function main(){
  const file=process.argv[2]; if(!file) return;
  const raw=read(file), items=Array.isArray(raw)?raw:[raw];
  if(items.length>500) throw new Error('bulk candidate limit exceeded');
  const result=items.map(candidate=>{const v=validateCandidate(candidate);return {candidateId:candidate.candidateId,...v,reviewEnvelope:v.ok?reviewEnvelope(candidate):null}});
  if(result.some(x=>!x.ok)){console.error(JSON.stringify(result,null,2));process.exit(1)}
  console.log(JSON.stringify(result,null,2));
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href) main();
