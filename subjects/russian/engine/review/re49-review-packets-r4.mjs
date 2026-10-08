import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {finalizeReviewItem,fingerprint,buildReadinessReport} from './re45-review-core.mjs';
import {buildRe48Candidate,validateRe48Candidate} from './re48-linguistic-redteam.mjs';
import {buildRe47ReviewInventory} from './re47-review-packets-r3.mjs';

const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();
const clone=v=>structuredClone(v);

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
function loadAdvisoryBase(){
  return JSON.parse(fs.readFileSync(new URL('../content/fixtures/re46-ai-editorial-advisory.v1.json',import.meta.url),'utf8'));
}
export function buildRe49Advisory({base=loadAdvisoryBase(),candidate=buildRe48Candidate()}={}){
  if(base?.schema!=='RUSSIAN_ENGINE_RE46_AI_EDITORIAL_ADVISORY_V1'||base?.humanApproval!==false)throw new Error('RE49 advisory base invalid');
  const out=clone(base);
  out.schema='RUSSIAN_ENGINE_RE49_AI_EDITORIAL_ADVISORY_V1';
  out.status='AI_ADVISORY_ONLY';
  out.humanApproval=false;
  out.requiresHumanRU03=true;
  out.sourceCandidate={
    spatialRevision:candidate.spatial.revision,
    dialogueRevision:candidate.dialogues.revision,
    candidateFingerprint:fingerprint(candidate)
  };
  const spatialFix=candidate.corrections.spatial.find(x=>x.sceneId==='rl-15-university');
  const dialogueFix=candidate.corrections.dialogues.find(x=>x.sceneId==='repair-dorm-shower');
  out.spatial['rl-15-university']={
    decision:'REVISED_CANDIDATE',
    severity:'LOW',
    acceptedDraft:spatialFix.to,
    rationaleVi:spatialFix.rationaleVi
  };
  out.dialogues['repair-dorm-shower'].turns.reply={
    decision:'REVISED_CANDIDATE',
    severity:'MEDIUM',
    acceptedDraft:dialogueFix.to,
    rationaleVi:dialogueFix.rationaleVi
  };
  return Object.freeze(out);
}

export function buildRe49ReviewInventory({candidate=buildRe48Candidate(),advisory=buildRe49Advisory({candidate})}={}){
  const valid=validateRe48Candidate(candidate);
  if(!valid.ok)throw new Error('RE49 candidate invalid: '+valid.errors.join('; '));
  if(advisory?.schema!=='RUSSIAN_ENGINE_RE49_AI_EDITORIAL_ADVISORY_V1'||advisory?.status!=='AI_ADVISORY_ONLY'||advisory?.humanApproval!==false)throw new Error('RE49 advisory authority invalid');
  const wi=worldIndex(candidate.spatial),items=[];

  for(const scene of arr(candidate.spatial.scenes)){
    const ctx=wi.get(scene.worldId),a=normalizedAction(scene.expectedAction);
    const nodeId=a.kind==='handover-object'?a.fromNodeId:a.targetId;
    const advice=advisory.spatial?.[scene.sceneId];
    if(!advice)throw new Error('RE49 missing spatial advisory '+scene.sceneId);
    items.push(finalizeReviewItem({
      itemId:'spatial:'+scene.sceneId+':instruction',
      sourceCatalog:'RE48_RESOLVED_SPATIAL_V3',
      sourceRevision:candidate.spatial.revision,
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

  for(const scene of arr(candidate.dialogues.scenes)){
    const ctx=wi.get(scene.worldId),target=visual(ctx,scene.targetNodeId),review=advisory.dialogues?.[scene.sceneId];
    if(!review)throw new Error('RE49 missing dialogue advisory '+scene.sceneId);
    for(const field of ['greet','request','reply','thanks','closing']){
      const roles=scene.turnRoles[field],advice=review.turns?.[field];
      if(!advice)throw new Error('RE49 missing turn advisory '+scene.sceneId+' '+field);
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':'+field,
        sourceCatalog:'RE48_RESOLVED_DIALOGUES_V3',
        sourceRevision:candidate.dialogues.revision,
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
      if(!advice)throw new Error('RE49 missing repair advisory '+mode);
      items.push(finalizeReviewItem({
        itemId:'dialogue:'+scene.sceneId+':repair-'+mode,
        sourceCatalog:'RE48_RESOLVED_DIALOGUES_V3',
        sourceRevision:candidate.dialogues.revision,
        sourceSceneId:scene.sceneId,
        utteranceKind:'repair-'+mode,
        textRu:candidate.dialogues.repair[mode],
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

  if(items.length!==43)throw new Error('RE49 expected 43 review items, got '+items.length);
  if(new Set(items.map(x=>x.itemId)).size!==43)throw new Error('RE49 duplicate item id');
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE49_REVIEW_INVENTORY_V1',
    source:Object.freeze({
      spatialRevision:candidate.spatial.revision,
      dialogueRevision:candidate.dialogues.revision,
      candidateFingerprint:fingerprint(candidate),
      advisoryFingerprint:fingerprint(advisory)
    }),
    itemCount:items.length,
    items:Object.freeze(items),
    structuralFindings:Object.freeze([]),
    canonicalPublicationReady:false
  });
}

export function buildRe49ReviewPackets(inventory=buildRe49ReviewInventory()){
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
    schema:'RUSSIAN_ENGINE_RE49_REVIEW_PACKETS_V1',
    sourceInventoryFingerprint:fingerprint({source:inventory.source,itemFingerprints:inventory.items.map(x=>x.reviewFingerprint)}),
    packets:Object.freeze(packets),
    canonicalPublicationReady:false
  });
}

export function compareRe47ToRe49(){
  const oldInv=buildRe47ReviewInventory(),next=buildRe49ReviewInventory();
  const oldById=new Map(oldInv.items.map(x=>[x.itemId,x]));
  const changed=next.items.filter(x=>oldById.get(x.itemId)?.reviewFingerprint!==x.reviewFingerprint);
  return Object.freeze({oldCount:oldInv.itemCount,newCount:next.itemCount,changedReviewFingerprints:changed.length});
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function write(file,value){fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const inventory=buildRe49ReviewInventory();
  const packets=buildRe49ReviewPackets(inventory);
  const readiness=buildReadinessReport(inventory,[]);
  const delta=compareRe47ToRe49();
  const io=arg('--inventory-out'),po=arg('--packets-out'),ro=arg('--readiness-out');
  if(io)write(io,inventory);if(po)write(po,packets);if(ro)write(ro,readiness);
  console.log(JSON.stringify({ok:true,items:inventory.itemCount,packets:packets.packets.length,changedReviewFingerprints:delta.changedReviewFingerprints,promotionReady:readiness.promotionReady,canonicalPublicationReady:false}));
}
