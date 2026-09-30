import fs from 'node:fs';
import crypto from 'node:crypto';

export const PATHS={
  owners:'subjects/russian/docs/p3/RUSSIAN_CONTENT_OWNER_REGISTRY.json',
  provenance:'subjects/russian/data/provenance.json',
  governance:'subjects/russian/data/authoring-governance.json'
};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stable=v=>{
  if(Array.isArray(v)) return '['+v.map(stable).join(',')+']';
  if(v&&typeof v==='object') return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  return JSON.stringify(v);
};
export const hashPayload=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
export function ownerMap(){
  const r=readJson(PATHS.owners);
  return new Map((r.owners||[]).map(x=>[x.responsibility,x]));
}
export function validateCandidate(candidate,{requirePromotion=false}={}){
  const gov=readJson(PATHS.governance);
  const owners=ownerMap();
  const errors=[];
  if(candidate?.schema!=='RUSSIAN_AUTHORING_CANDIDATE_V1') errors.push('candidate schema');
  for(const k of ['candidateId','responsibility','canonicalId','revision','rollbackNote','diffSummary']) if(!String(candidate?.[k]??'').trim()) errors.push('missing '+k);
  if(!('payload' in (candidate||{}))) errors.push('missing payload');
  const owner=owners.get(candidate?.responsibility);
  if(!owner?.canonicalOwner) errors.push('no canonical owner for responsibility');
  if(owner?.classification&&String(owner.classification).startsWith('DERIVED')) errors.push('derived responsibility cannot be authored directly');
  if(!gov.authorableResponsibilities.includes(candidate?.responsibility)) errors.push('responsibility not authorable');
  const states=gov.lifecycle.candidateStates;
  if(!states.includes(candidate?.state)) errors.push('invalid lifecycle state');
  const hash=candidate&&'payload' in candidate?hashPayload(candidate.payload):null;
  if(candidate?.contentHash&&candidate.contentHash!==hash) errors.push('contentHash mismatch');
  const promotionStates=new Set(['APPROVED','CANONICAL_PATCHED','PUBLISHED']);
  if((requirePromotion||promotionStates.has(candidate?.state))){
    if(!Array.isArray(candidate?.sourceRefs)||!candidate.sourceRefs.length) errors.push('sourceRefs required for promotion');
    if(!String(candidate?.reviewer??'').trim()) errors.push('reviewer required for promotion');
    if(!String(candidate?.reviewedAt??'').trim()) errors.push('reviewedAt required for promotion');
    if(candidate?.generated===true && String(candidate?.confidence??'')!=='VERIFIED') errors.push('generated promotion requires VERIFIED provenance');
  }
  if(candidate?.state==='PUBLISHED'&&!candidate?.canonicalPatched) errors.push('PUBLISHED requires canonicalPatched');
  return {ok:errors.length===0,errors,canonicalOwner:owner?.canonicalOwner||null,contentHash:hash};
}
export function reviewEnvelope(candidate){
  const out=validateCandidate(candidate);
  if(!out.ok) throw new Error(out.errors.join('; '));
  return {
    subjectId:'russian',
    resourceType:candidate.responsibility,
    resourceId:candidate.canonicalId,
    revision:candidate.revision,
    contentHash:out.contentHash,
    sourcePath:out.canonicalOwner,
    summary:candidate.diffSummary,
    metadataOnly:true,
    candidateId:candidate.candidateId
  };
}
function main(){
  const file=process.argv[2];
  if(!file) return;
  const raw=readJson(file);
  const items=Array.isArray(raw)?raw:[raw];
  if(items.length>500) throw new Error('bulk candidate limit exceeded');
  const result=items.map(candidate=>{
    const validation=validateCandidate(candidate);
    return {candidateId:candidate.candidateId,...validation,reviewEnvelope:validation.ok?reviewEnvelope(candidate):null};
  });
  if(result.some(x=>!x.ok)){console.error(JSON.stringify(result,null,2));process.exit(1)}
  console.log(JSON.stringify(result,null,2));
}
if(import.meta.url===new URL('file://'+process.argv[1]).href) main();
