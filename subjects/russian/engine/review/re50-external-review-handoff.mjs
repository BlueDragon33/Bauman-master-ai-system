import fs from 'node:fs';
import {buildRe49ReviewInventory,buildRe49ReviewPackets} from './re49-review-packets-r4.mjs';
import {verifyAuthorizedReviewDecision} from './re45-review-core.mjs';

const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();

export function loadReviewerRegistry(){
  return JSON.parse(fs.readFileSync(new URL('../content/review/ru03-reviewers.v1.json',import.meta.url),'utf8'));
}

export function validateReviewerRegistry(registry){
  const errors=[];
  if(registry?.schema!=='RUSSIAN_ENGINE_RU03_REVIEWERS_V1')errors.push('registry schema');
  const ids=new Set();
  for(const reviewer of arr(registry?.reviewers)){
    const id=txt(reviewer?.reviewerId);
    if(!id)errors.push('reviewerId required');
    if(ids.has(id))errors.push('duplicate reviewer '+id); else ids.add(id);
    if(reviewer?.authority!=='HUMAN_RU03')errors.push(id+': authority');
    if(reviewer?.reviewerType!=='HUMAN')errors.push(id+': reviewerType');
    if(reviewer?.status!=='ACTIVE')errors.push(id+': status');
    const q=new Set(arr(reviewer?.qualifications));
    if(!q.has('RUSSIAN_TEXT')&&!q.has('RUSSIAN_AUDIO'))errors.push(id+': qualification');
    if(reviewer?.authorizationEvidence?.status!=='VERIFIED'||!txt(reviewer?.authorizationEvidence?.reference)||!txt(reviewer?.authorizationEvidence?.verifiedBy)||!txt(reviewer?.authorizationEvidence?.verifiedAt))errors.push(id+': independent credential evidence');
  }
  return Object.freeze({ok:errors.length===0,errors,reviewerCount:arr(registry?.reviewers).length});
}

function reviewerFor(registry,id){
  return arr(registry?.reviewers).find(x=>x?.reviewerId===id)||null;
}

export function validateExternalReviewDecision(item,decision,{registry=loadReviewerRegistry()}={}){
  const validation=validateReviewerRegistry(registry);
  const authorized=verifyAuthorizedReviewDecision(item,decision,registry);
  const errors=[...validation.errors,...authorized.errors];
  return Object.freeze({ok:errors.length===0,errors});
}

export function buildExternalReviewHandoff({inventory=buildRe49ReviewInventory(),packets=buildRe49ReviewPackets(inventory),registry=loadReviewerRegistry()}={}){
  const reg=validateReviewerRegistry(registry);
  if(!reg.ok)throw new Error('RE50 reviewer registry invalid: '+reg.errors.join('; '));
  const byId=new Map(packets.packets.map(x=>[x.itemId,x]));
  const entries=inventory.items.map(item=>{
    const packet=byId.get(item.itemId);
    if(!packet)throw new Error('RE50 packet missing '+item.itemId);
    return Object.freeze({
      itemId:item.itemId,
      sourceSceneId:item.sourceSceneId,
      sourceRevision:item.sourceRevision,
      textRu:item.textRu,
      situationVi:item.situationVi,
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
      reviewQuestions:Object.freeze([
        'TEXT: Is the exact Russian natural, grammatical, pragmatically appropriate and semantically matched to this scene?',
        'TEXT: Is this suitable as a safe beginner default for the specified speaker/recipient/register?',
        'AUDIO: Does the immutable audio exactly match the approved text with correct stress, reduction, palatalization, rhythm and intonation?',
        'AUDIO: Is the voice/register natural for the specified social role and intelligible for Pre-A0 training?'
      ]),
      decisionTemplate:Object.freeze({
        decisionId:'',
        itemId:item.itemId,
        scope:'TEXT',
        decision:null,
        reviewerAuthority:'HUMAN_RU03',
        reviewerType:'HUMAN',
        reviewerId:'',
        decidedAt:'',
        reviewFingerprint:item.reviewFingerprint,
        textFingerprint:item.textFingerprint,
        audioFingerprint:item.audioFingerprint,
        notes:''
      }),
      status:'PENDING_EXTERNAL_REVIEW'
    });
  });
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE50_EXTERNAL_REVIEW_HANDOFF_V1',
    state:reg.reviewerCount?'AUTHORIZED_REVIEWER_AVAILABLE':'EXTERNAL_REVIEWER_REQUIRED',
    reviewerRegistrySchema:registry.schema,
    reviewerCount:reg.reviewerCount,
    itemCount:entries.length,
    entries:Object.freeze(entries),
    audioReady:entries.every(x=>Boolean(x.audioFingerprint)),
    canonicalPublicationReady:false
  });
}
