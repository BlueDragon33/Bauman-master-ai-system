import {stableContentFingerprint} from '../content/promotion/promotion-registry.mjs';
import {validateSpatialCandidate} from '../world/spatial-candidate-runtime.mjs';
import {validateRepairDialogueCandidate} from '../conversation/repair-dialogue-candidate.mjs';

const clean=v=>String(v??'').trim();
const copy=v=>JSON.parse(JSON.stringify(v));
const QUESTION_SPATIAL=[
  'Does the exact Russian sentence naturally express the intended goal for this exact world location/action?',
  'Is the Russian grammar, spelling, word order, punctuation, native idiom and stress placement correct?',
  'Does the dialogue register match speaker role (peer vs staff/stranger) and Russian etiquette?',
  'Does the visual/map target refer to the right physical place or object, without room/door/map/card confusion?',
  'Is the Vietnamese learner orientation consistent with the Russian meaning without misleading a beginner?',
  'Has a qualified Russian speaker reviewed natural-speed and slowed audio, pronunciation and intonation?'
];
const QUESTION_DIALOGUE=[
  'Does each utterance (greeting, request, staff reply, repair, thank-you, closing) sound natural and correct in this stranger context?',
  'Are address/register politeness, imperative forms and cultural interaction appropriate?',
  'Is the staff response spatially coherent with this particular map and the indicated destination?',
  'Are the Russian repair requests idiomatic, and is the listener response natural when repeated or slowed?',
  'Does the Vietnamese scenario purpose and response hint faithfully support a learner with zero Russian?',
  'Has a qualified Russian speaker checked stress, reductions, connected speech, speaker roles and actual audio recordings?'
];
const RISKS=Object.freeze({
  'rl-01-room':['familiar-ты','request-vs-transfer'],
  'rl-02-room':['familiar-ты','dative-request'],
  'rl-03-room':['where-means-location-not-noun'],
  'rl-04-shop':['polite-stranger','bread-shelf'],
  'rl-05-shop':['polite-customer','bottled-water-not-abstract-water'],
  'rl-06-shop':['polite-stranger','refrigerator-location'],
  'rl-07-metro':['buy-ticket-not-lost-ticket'],
  'rl-08-metro':['metro-diagram-not-payment-card'],
  'rl-09-metro':['outside-station-entrance'],
  'rl-10-dorm':['key-position-vs-noun'],
  'rl-11-dorm':['room-number-12-not-generic-door'],
  'rl-12-dorm':['shower-room-not-shower-head'],
  'rl-13-university':['lecture-room-number-12-not-campus-building'],
  'rl-14-university':['library-location-vs-icon'],
  'rl-15-university':['peer-handover-politeness']
});
export function buildR2HumanReviewQueue(spatial,dialogues){
  const valid=validateSpatialCandidate(spatial);
  const validDialogue=validateRepairDialogueCandidate(dialogues,spatial);
  if(!valid.ok||!validDialogue.ok)throw new Error('candidate review input invalid: '+[...valid.errors,...validDialogue.errors].join('; '));
  const worlds=new Map(spatial.worlds.map(w=>[w.worldId,w]));
  const packets=[];
  for(const scene of spatial.scenes){
    const context=worlds.get(scene.worldId);
    const payload={kind:'spatial-scene',revision:scene.revision,scene,world:context};
    packets.push({
      schemaVersion:'RUSSIAN_ENGINE_R2_DRAFT_HUMAN_REVIEW_PACKET_V1',
      kind:payload.kind,sceneId:scene.sceneId,revision:scene.revision,
      fingerprint:stableContentFingerprint(payload),
      status:'HUMAN_REVIEW_REQUIRED',source:'subjects/russian/engine/content/fixtures/real-life-spatial.r2-ai-proposal.json',
      exactRussian:scene.russianDraft,exactRussianLines:null,
      sceneContext:{worldId:scene.worldId,speakerRole:scene.speakerRole,register:scene.register,expectedAction:copy(scene.expectedAction),world:copy(context)},
      vietnameseGuidance:null,advisoryRisks:RISKS[scene.sceneId]||[],
      audioStatus:'HUMAN_PHONETIC_AUDIO_REVIEW_REQUIRED',
      reviewQuestions:QUESTION_SPATIAL.slice(),
      linguisticCorrectness:'REVIEW_REQUIRED',reviewDecision:null,
      proposedCanonicalRef:'RU03:R2:SCENE:'+scene.sceneId+':'+scene.revision
    });
  }
  for(const scene of dialogues.scenes){
    const context=worlds.get(scene.worldId);
    const payload={kind:'repair-dialogue',revision:dialogues.revision,scene,repair:dialogues.repair,world:context};
    packets.push({
      schemaVersion:'RUSSIAN_ENGINE_R2_DRAFT_HUMAN_REVIEW_PACKET_V1',
      kind:payload.kind,sceneId:scene.sceneId,revision:dialogues.revision,
      fingerprint:stableContentFingerprint(payload),
      status:'HUMAN_REVIEW_REQUIRED',source:'subjects/russian/engine/content/fixtures/repair-dialogues.r1-ai-proposal.json',
      exactRussian:null,exactRussianLines:{...copy(scene.surface),repair:copy(dialogues.repair)},
      sceneContext:{worldId:scene.worldId,speakerRole:scene.speakerRole,register:scene.register,targetNodeId:scene.targetNodeId,world:copy(context)},
      vietnameseGuidance:copy(scene.vn),advisoryRisks:['stranger-register','repeat-slower-naturalness','spoken-dialogue-sequencing','direction-accuracy'],
      audioStatus:'HUMAN_PHONETIC_AUDIO_REVIEW_REQUIRED',
      reviewQuestions:QUESTION_DIALOGUE.slice(),
      linguisticCorrectness:'REVIEW_REQUIRED',reviewDecision:null,
      proposedCanonicalRef:'RU03:R2:DIALOGUE:'+scene.sceneId+':'+dialogues.revision
    });
  }
  if(packets.length!==19||new Set(packets.map(p=>p.sceneId)).size!==19)throw new Error('expected 19 non-overlapping pending packets');
  return {schema:'RUSSIAN_ENGINE_R2_HUMAN_REVIEW_QUEUE_V1',state:'HUMAN_REVIEW_REQUIRED',total:19,
    spatialScenes:15,dialogueScenes:4,autoApproved:0,canonicalPublicationReady:false,
    humanApprovalRequired:true,packets};
}
export function verifyR2HumanReviewQueue(queue){
  if(queue?.schema!=='RUSSIAN_ENGINE_R2_HUMAN_REVIEW_QUEUE_V1')return false;
  if(queue?.total!==19||queue?.autoApproved!==0||queue?.canonicalPublicationReady!==false||queue?.humanApprovalRequired!==true)return false;
  if(!Array.isArray(queue.packets)||queue.packets.length!==19)return false;
  const ids=new Set();
  for(const packet of queue.packets){
    if(ids.has(packet.sceneId))return false;ids.add(packet.sceneId);
    if(!clean(packet.revision)||!/^fnv1a32-[0-9a-f]{8}$/.test(packet.fingerprint))return false;
    if(packet.reviewDecision!==null||packet.linguisticCorrectness!=='REVIEW_REQUIRED'||packet.status!=='HUMAN_REVIEW_REQUIRED')return false;
    if(packet.audioStatus!=='HUMAN_PHONETIC_AUDIO_REVIEW_REQUIRED')return false;
  }
  return true;
}
