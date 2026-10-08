import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {finalizeReviewItem,fingerprint,buildReadinessReport} from './re45-review-core.mjs';
import {loadReviewableCandidates,validateReviewableCandidates} from './re46-reviewable-candidate.mjs';

const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();

function worldIndex(spatial){
  return new Map(arr(spatial.worlds).map(w=>[w.worldId,{world:w,nodes:new Map(arr(w.nodes).map(n=>[n.nodeId,n]))}]));
}
function visual(ctx,id){
  const n=ctx?.nodes?.get(id);
  return n?{nodeId:n.nodeId,labelVi:n.labelVi,visualType:n.visualType}:null;
}
function normalizedAction(a={}){
  const out={kind:txt(a.kind)||null};
  for(const key of ['targetId','fromNodeId','toNodeId'])if(txt(a[key]))out[key]=txt(a[key]);
  return out;
}
function sampleAudio(){
  return {kind:'BROWSER_TTS_SAMPLE_ONLY',authority:'NONE',immutableAudioSha256:null};
}
function spatialSituation(scene){
  return {setting:scene.vn.setting,purpose:scene.vn.purpose,actionHint:scene.vn.actionHint};
}
function dialogueSituation(scene,field){
  const key={greet:'greeting',request:'request',reply:'reply',thanks:'thank',closing:'thank'}[field];
  return {setting:scene.vn.setting,purpose:scene.vn.purpose,turnHint:scene.vn[key]||scene.vn.purpose};
}
function dialogueAction(scene,field){
  if(field==='request')return {kind:'dialogue-intent',targetNodeId:scene.targetNodeId};
  if(field==='reply')return {kind:'listen-and-locate',targetNodeId:scene.targetNodeId};
  return {kind:field};
}
function loadAdvisory(){
  return JSON.parse(fs.readFileSync(new URL('../content/fixtures/re46-ai-editorial-advisory.v1.json',import.meta.url),'utf8'));
}

export function buildRe47ReviewInventory({resolved=loadReviewableCandidates(),advisory=loadAdvisory()}={}){
  const valid=validateReviewableCandidates(resolved);
  if(!valid.ok)throw new Error('RE47 resolved candidate invalid: '+valid.errors.join('; '));
  if(advisory?.schema!=='RUSSIAN_ENGINE_RE46_AI_EDITORIAL_ADVISORY_V1'||advisory?.status!=='AI_ADVISORY_ONLY'||advisory?.humanApproval!==false)throw new Error('RE47 advisory authority invalid');
  const wi=worldIndex(resolved.spatial),items=[];

  for(const scene of arr(resolved.spatial.scenes)){
    const ctx=wi.get(scene.worldId),a=normalizedAction(scene.expectedAction);
    const nodeId=a.kind==='handover-object'?a.fromNodeId:a.targetId;
    const advice=advisory.spatial?.[scene.sceneId];
    if(!advice)throw new Error('RE47 missing spatial advisory '+scene.sceneId);
    items.push(finalizeReviewItem({
      itemId:'spatial:'+scene.sceneId+':instruction',
      sourceCatalog:'RE46_RESOLVED_SPATIAL_V2',
      sourceRevision:resolved.spatial.revision,
      sourceSceneId:scene.sceneId,
      utteranceKind:'instruction',
      textRu:scene.russianDraft,
      worldId:scene.worldId,
      situationVi:spatialSituation(scene),
      speakerRole:scene.utteranceSpeakerRole,
      recipientRole:scene.utteranceRecipientRole,
      register:scene.register,
      expectedAction:a,
      expectedVisual:visual(ctx,nodeId),
      audio:sampleAudio(),
      advisory:advice,
      structuralIssues:Object.freeze(['NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
    }));
  }

  for(const scene of arr(resolved.dialogues.scenes)){
    const ctx=wi.get(scene.worldId),target=visual(ctx,scene.targetNodeId),review=advisory.dialogues?.[scene.sceneId];
    if(!review)throw new Error('RE47 missing dialogue advisory '+scene.sceneId);
    for(const field of ['greet','request','reply','thanks','closing']){
      const roles=scene.turnRoles[field],advice=review.turns?.[field];
      if(!advice)throw new Error('RE47 missing turn advisory '+scene.sceneId+' '+field);
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':'+field,
        sourceCatalog:'RE46_RESOLVED_DIALOGUES_V2',
        sourceRevision:resolved.dialogues.revision,
        sourceSceneId:scene.sceneId,
        utteranceKind:field,
        textRu:scene.surface[field],
        worldId:scene.worldId,
        situationVi:dialogueSituation(scene,field),
        speakerRole:roles.speakerRole,
        recipientRole:roles.recipientRole,
        register:scene.register,
        expectedAction:dialogueAction(scene,field),
        expectedVisual:target,
        audio:sampleAudio(),
        advisory:advice,
        structuralIssues:Object.freeze(['NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
      }));
    }
    for(const mode of ['repeat','slower']){
      const advice=advisory.repairs?.[mode];
      if(!advice)throw new Error('RE47 missing repair advisory '+mode);
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':repair-'+mode,
        sourceCatalog:'RE46_RESOLVED_DIALOGUES_V2',
        sourceRevision:resolved.dialogues.revision,
        sourceSceneId:scene.sceneId,
        utteranceKind:'repair-'+mode,
        textRu:resolved.dialogues.repair[mode],
        worldId:scene.worldId,
        situationVi:{setting:scene.vn.setting,purpose:scene.vn.purpose,turnHint:mode==='repeat'?'Yêu cầu nhắc lại khi chưa nghe rõ.':'Yêu cầu nói chậm hơn khi chưa nghe rõ.'},
        speakerRole:'learner',
        recipientRole:scene.interlocutorRole,
        register:'polite-stranger',
        expectedAction:{kind:'conversation-repair',mode},
        expectedVisual:target,
        audio:sampleAudio(),
        advisory:advice,
        structuralIssues:Object.freeze(['NO_IMMUTABLE_AUDIO','NO_HUMAN_REVIEW'])
      }));
    }
  }

  if(items.length!==43)throw new Error('RE47 expected 43 contextual review items, got '+items.length);
  if(new Set(items.map(x=>x.itemId)).size!==43)throw new Error('RE47 duplicate item id');
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE47_REVIEW_INVENTORY_V1',
    source:Object.freeze({
      spatialRevision:resolved.spatial.revision,
      dialogueRevision:resolved.dialogues.revision,
      spatialResolvedFingerprint:fingerprint(resolved.spatial),
      dialogueResolvedFingerprint:fingerprint(resolved.dialogues),
      advisoryFingerprint:fingerprint(advisory)
    }),
    itemCount:items.length,
    items:Object.freeze(items),
    structuralFindings:Object.freeze([]),
    canonicalPublicationReady:false
  });
}

export function buildRe47ReviewPackets(inventory){
  const packets=inventory.items.map(item=>Object.freeze({
    itemId:item.itemId,
    sourceSceneId:item.sourceSceneId,
    sourceRevision:item.sourceRevision,
    utteranceKind:item.utteranceKind,
    textRu:item.textRu,
    situationVi:item.situationVi,
    worldId:item.worldId,
    speakerRole:item.speakerRole,
    recipientRole:item.recipientRole,
    register:item.register,
    expectedAction:item.expectedAction,
    expectedVisual:item.expectedVisual,
    advisory:item.advisory,
    textFingerprint:item.textFingerprint,
    audioFingerprint:item.audioFingerprint,
    reviewFingerprint:item.reviewFingerprint,
    requiredReviews:['TEXT','AUDIO'],
    allowedDecisions:['APPROVE','CHANGES_REQUESTED','REJECT'],
    reviewerAuthorityRequired:'HUMAN_RU03',
    status:'PENDING_EXTERNAL_REVIEW'
  }));
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE47_REVIEW_PACKETS_V1',
    sourceInventoryFingerprint:fingerprint({source:inventory.source,itemFingerprints:inventory.items.map(x=>x.reviewFingerprint)}),
    packets:Object.freeze(packets),
    canonicalPublicationReady:false
  });
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function write(file,value){fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const inventory=buildRe47ReviewInventory();
  const packets=buildRe47ReviewPackets(inventory);
  const readiness=buildReadinessReport(inventory,[]);
  const io=arg('--inventory-out'),po=arg('--packets-out'),ro=arg('--readiness-out');
  if(io)write(io,inventory);if(po)write(po,packets);if(ro)write(ro,readiness);
  console.log(JSON.stringify({ok:true,items:inventory.itemCount,packets:packets.packets.length,structuralFindings:inventory.structuralFindings.length,promotionReady:readiness.promotionReady,canonicalPublicationReady:false}));
}
