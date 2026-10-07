import {sceneReviewFingerprint} from '../review/scene-review-packet.mjs';

const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function compileCanonicalScene({scene,packet,decision}={}){
  if(!scene?.sceneId||!packet?.sceneId)throw new Error('scene and review packet required');
  if(scene.sceneId!==packet.sceneId)throw new Error('scene/packet identity mismatch');
  const fingerprint=sceneReviewFingerprint(scene);
  if(packet.fingerprint!==fingerprint)throw new Error('review packet fingerprint mismatch');
  if(!decision)throw new Error('human RU03 approval required');
  if(decision.authority!=='RU03'||decision.reviewerType!=='HUMAN'||decision.decision!=='APPROVE'){
    throw new Error('valid RU03 HUMAN APPROVE decision required');
  }
  if(decision.sceneId!==scene.sceneId)throw new Error('decision scene mismatch');
  if(decision.revision!==scene.revision)throw new Error('stale review revision');
  if(decision.fingerprint!==fingerprint)throw new Error('stale review fingerprint');

  const canonicalRef=clean(packet.proposedCanonicalRef);
  if(!canonicalRef)throw new Error('proposed canonical ref required');

  return Object.freeze({
    schemaVersion:'RUSSIAN_ENGINE_CANONICAL_SCENE_V1',
    canonicalRef,
    sceneId:scene.sceneId,
    revision:scene.revision,
    fingerprint,
    status:'RU03_APPROVED',
    sourceFixtureStatus:clean(scene.status),
    approvedBy:{
      authority:'RU03',
      reviewerType:'HUMAN',
      reviewerId:clean(decision.reviewerId),
      decisionId:clean(decision.decisionId),
      decidedAt:clean(decision.decidedAt)
    },
    acceptedVariants:Array.isArray(decision.acceptedVariants)?copy(decision.acceptedVariants):[],
    scene:copy({...scene,status:'RU03_APPROVED',canonicalRef})
  });
}

export function evaluateHumanReviewGate({packets=[],decisions=[]}={}){
  const latest=new Map();
  for(const decision of Array.isArray(decisions)?decisions:[])latest.set(clean(decision?.sceneId),decision);
  const summary={approved:[],pending:[],changesRequested:[],rejected:[]};

  for(const packet of Array.isArray(packets)?packets:[]){
    const decision=latest.get(packet.sceneId);
    if(!decision){summary.pending.push(packet.sceneId);continue;}
    if(decision.revision!==packet.revision||decision.fingerprint!==packet.fingerprint){
      summary.pending.push(packet.sceneId);
      continue;
    }
    if(decision.authority!=='RU03'||decision.reviewerType!=='HUMAN'){
      summary.pending.push(packet.sceneId);
      continue;
    }
    if(decision.decision==='APPROVE')summary.approved.push(packet.sceneId);
    else if(decision.decision==='CHANGES_REQUESTED')summary.changesRequested.push(packet.sceneId);
    else if(decision.decision==='REJECT')summary.rejected.push(packet.sceneId);
    else summary.pending.push(packet.sceneId);
  }

  return {
    schema:'RUSSIAN_ENGINE_PHASE7_HUMAN_REVIEW_GATE_V1',
    engineeringReady:true,
    humanReviewRequired:summary.pending.length>0||summary.changesRequested.length>0||summary.rejected.length>0,
    canonicalPublicationReady:summary.approved.length===packets.length&&packets.length>0,
    total:packets.length,
    ...summary
  };
}
