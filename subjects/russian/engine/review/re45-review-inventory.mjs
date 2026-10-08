import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateSpatialCandidate} from '../world/spatial-candidate-runtime.mjs';
import {validateRepairDialogueCandidate} from '../conversation/repair-dialogue-candidate.mjs';
import {finalizeReviewItem,fingerprint,buildReadinessReport} from './re45-review-core.mjs';

const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();
const rawSha=v=>createHash('sha256').update(String(v),'utf8').digest('hex');

function worlds(pack){
  return new Map(arr(pack.worlds).map(w=>[w.worldId,{world:w,nodes:new Map(arr(w.nodes).map(n=>[n.nodeId,n]))}]));
}
function visual(ctx,id){
  const n=ctx?.nodes?.get(id);
  return n?{nodeId:n.nodeId,labelVi:n.labelVi,visualType:n.visualType}:null;
}
function action(a={}){
  return {kind:txt(a.kind)||null,targetId:txt(a.targetId)||null,fromNodeId:txt(a.fromNodeId)||null,toNodeId:txt(a.toNodeId)||null};
}
function audio(authority){
  return {kind:'BROWSER_TTS_SAMPLE_ONLY',authority:authority||'NONE',immutableAudioSha256:null};
}
function spatialRoles(scene){
  const declared=txt(scene.speakerRole)||'unknown';
  if(scene.register==='polite-stranger'&&/^Подскажите\b/u.test(txt(scene.russianDraft))&&!/^learner(?:-|$)/.test(declared)){
    return {speakerRole:'learner',recipientRole:declared,roleResolution:'inferred-from-utterance-and-register',issues:['ROLE_FIELD_SEMANTICS_CONFLICT']};
  }
  if(scene.expectedAction?.kind==='dialogue-intent'&&/^learner(?:-|$)/.test(declared)){
    return {speakerRole:declared,recipientRole:'shop-staff',roleResolution:'declared-learner-dialogue',issues:[]};
  }
  return {speakerRole:declared,recipientRole:'learner',roleResolution:'declared-speaker',issues:[]};
}
function spatialItems(pack){
  const wi=worlds(pack);
  return arr(pack.scenes).map(scene=>{
    const a=action(scene.expectedAction),ctx=wi.get(scene.worldId),roles=spatialRoles(scene);
    const target=a.kind==='handover-object'?a.fromNodeId:a.targetId;
    return finalizeReviewItem({
      itemId:'spatial:'+scene.sceneId+':instruction',
      sourceCatalog:'real-life-spatial.r2-ai-proposal.json',sourceRevision:pack.revision,sourceSceneId:scene.sceneId,
      utteranceKind:'instruction',textRu:scene.russianDraft,worldId:scene.worldId,worldLabelVi:ctx?.world?.nameVi||null,situationVi:null,
      declaredSpeakerRole:scene.speakerRole,speakerRole:roles.speakerRole,recipientRole:roles.recipientRole,roleResolution:roles.roleResolution,
      register:scene.register,expectedAction:a,expectedVisual:visual(ctx,target),audio:audio(scene.audioAuthority),
      structuralIssues:Object.freeze([...roles.issues,'NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
    });
  });
}
function dialogueItems(pack,spatial){
  const wi=worlds(spatial),items=[];
  const viField={greet:'greeting',request:'request',reply:'reply',thanks:'thank',closing:'thank'};
  for(const scene of arr(pack.scenes)){
    const ctx=wi.get(scene.worldId),target=visual(ctx,scene.targetNodeId);
    for(const field of ['greet','request','reply','thanks','closing']){
      const learner=['greet','request','thanks'].includes(field);
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':'+field,
        sourceCatalog:'repair-dialogues.r1-ai-proposal.json',sourceRevision:pack.revision,sourceSceneId:scene.sceneId,
        utteranceKind:field,textRu:scene.surface[field],worldId:scene.worldId,worldLabelVi:ctx?.world?.nameVi||null,
        situationVi:scene.vn?.[viField[field]]||scene.vn?.purpose||null,declaredSpeakerRole:scene.speakerRole,
        speakerRole:learner?'learner':scene.speakerRole,recipientRole:learner?scene.speakerRole:'learner',roleResolution:'dialogue-turn-semantics',
        register:scene.register,expectedAction:{kind:field==='reply'?'listen':field==='request'?'dialogue-intent':field},
        expectedVisual:target,audio:audio(pack.audioAuthority),structuralIssues:Object.freeze(['NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
      }));
    }
    for(const mode of ['repeat','slower']){
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':repair-'+mode,
        sourceCatalog:'repair-dialogues.r1-ai-proposal.json',sourceRevision:pack.revision,sourceSceneId:scene.sceneId,
        utteranceKind:'repair-'+mode,textRu:pack.repair[mode],worldId:scene.worldId,worldLabelVi:ctx?.world?.nameVi||null,
        situationVi:mode==='repeat'?'Yêu cầu nhắc lại khi chưa nghe rõ.':'Yêu cầu nói chậm hơn khi chưa nghe rõ.',
        declaredSpeakerRole:scene.speakerRole,speakerRole:'learner',recipientRole:scene.speakerRole,roleResolution:'repair-turn-semantics',
        register:'polite-stranger',expectedAction:{kind:'conversation-repair',mode},expectedVisual:target,
        audio:audio(pack.audioAuthority),structuralIssues:Object.freeze(['NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
      }));
    }
  }
  return items;
}
function duplicates(items){
  const m=new Map();
  for(const x of items){if(!m.has(x.textRu))m.set(x.textRu,[]);m.get(x.textRu).push(x.itemId)}
  return [...m.entries()].filter(([,ids])=>ids.length>1).map(([textRu,itemIds])=>({textRu,itemIds})).sort((a,b)=>a.textRu.localeCompare(b.textRu,'ru'));
}

export function buildReviewInventory({spatial,dialogues,spatialRaw='',dialoguesRaw=''}){
  const a=validateSpatialCandidate(spatial),b=validateRepairDialogueCandidate(dialogues,spatial);
  if(!a.ok)throw new Error('spatial invalid: '+a.errors.join('; '));
  if(!b.ok)throw new Error('dialogue invalid: '+b.errors.join('; '));
  const items=[...spatialItems(spatial),...dialogueItems(dialogues,spatial)];
  if(new Set(items.map(x=>x.itemId)).size!==items.length)throw new Error('duplicate RE45 item id');
  const structuralFindings=items.flatMap(x=>(x.structuralIssues||[]).filter(c=>c!=='NO_IMMUTABLE_AUDIO'&&c!=='NO_HUMAN_REVIEW').map(code=>({code,itemId:x.itemId,textRu:x.textRu,declaredSpeakerRole:x.declaredSpeakerRole,speakerRole:x.speakerRole,recipientRole:x.recipientRole})));
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE45_REVIEW_INVENTORY_V1',
    source:Object.freeze({spatial:{revision:spatial.revision,rawSha256:spatialRaw?rawSha(spatialRaw):null},dialogues:{revision:dialogues.revision,rawSha256:dialoguesRaw?rawSha(dialoguesRaw):null}}),
    itemCount:items.length,items:Object.freeze(items),duplicateTextGroups:Object.freeze(duplicates(items)),
    structuralFindings:Object.freeze(structuralFindings),canonicalPublicationReady:false
  });
}
export function buildReviewPackets(inventory){
  const packets=inventory.items.map(x=>Object.freeze({
    itemId:x.itemId,sourceSceneId:x.sourceSceneId,sourceRevision:x.sourceRevision,utteranceKind:x.utteranceKind,textRu:x.textRu,situationVi:x.situationVi,
    worldId:x.worldId,speakerRole:x.speakerRole,recipientRole:x.recipientRole,register:x.register,expectedAction:x.expectedAction,expectedVisual:x.expectedVisual,
    textFingerprint:x.textFingerprint,audioFingerprint:x.audioFingerprint,reviewFingerprint:x.reviewFingerprint,
    requiredReviews:['TEXT','AUDIO'],allowedDecisions:['APPROVE','CHANGES_REQUESTED','REJECT'],reviewerAuthorityRequired:'HUMAN_RU03',status:'PENDING_EXTERNAL_REVIEW'
  }));
  return Object.freeze({schema:'RUSSIAN_ENGINE_RE45_REVIEW_PACKETS_V1',sourceInventoryFingerprint:fingerprint({source:inventory.source,itemFingerprints:inventory.items.map(x=>x.reviewFingerprint)}),packets:Object.freeze(packets),canonicalPublicationReady:false});
}
export function loadCurrentCandidateInventory(){
  const sUrl=new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url);
  const dUrl=new URL('../content/fixtures/repair-dialogues.r1-ai-proposal.json',import.meta.url);
  const spatialRaw=fs.readFileSync(sUrl,'utf8'),dialoguesRaw=fs.readFileSync(dUrl,'utf8');
  return buildReviewInventory({spatial:JSON.parse(spatialRaw),dialogues:JSON.parse(dialoguesRaw),spatialRaw,dialoguesRaw});
}
function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function write(file,value){fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const inventory=loadCurrentCandidateInventory(),packets=buildReviewPackets(inventory),readiness=buildReadinessReport(inventory,[]);
  const io=arg('--inventory-out'),po=arg('--packets-out'),ro=arg('--readiness-out');
  if(io)write(io,inventory);if(po)write(po,packets);if(ro)write(ro,readiness);
  console.log(JSON.stringify({ok:true,items:inventory.itemCount,duplicateTextGroups:inventory.duplicateTextGroups.length,structuralFindings:inventory.structuralFindings.length,promotionReady:readiness.promotionReady}));
}
