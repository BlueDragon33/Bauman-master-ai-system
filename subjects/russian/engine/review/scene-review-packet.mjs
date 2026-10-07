import {stableContentFingerprint} from '../content/promotion/promotion-registry.mjs';

const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export const SCENE_REVIEW_PACKET_SCHEMA='RUSSIAN_ENGINE_SCENE_REVIEW_PACKET_V1';

export function sceneReviewFingerprint(scene){
  return stableContentFingerprint({
    sceneId:clean(scene?.sceneId),
    revision:clean(scene?.revision),
    status:clean(scene?.status),
    setting:clean(scene?.setting),
    transferGroup:clean(scene?.transferGroup),
    targetCompetencies:arr(scene?.targetCompetencies),
    semanticTargets:arr(scene?.semanticTargets),
    stimulus:scene?.stimulus||null,
    world:scene?.world||null,
    expectedAction:scene?.expectedAction||null,
    successConsequence:scene?.successConsequence||null,
    supportPolicy:scene?.supportPolicy||null,
    requiredCapabilities:arr(scene?.requiredCapabilities)
  });
}

export function buildSceneReviewPacket(scene){
  const sceneId=clean(scene?.sceneId);
  const revision=clean(scene?.revision);
  if(!sceneId||!revision)throw new Error('sceneId and revision required');
  const fingerprint=sceneReviewFingerprint(scene);
  return Object.freeze({
    schemaVersion:SCENE_REVIEW_PACKET_SCHEMA,
    sceneId,
    revision,
    fingerprint,
    currentStatus:clean(scene?.status),
    setting:clean(scene?.setting),
    transferGroup:clean(scene?.transferGroup),
    exactRussian:clean(scene?.stimulus?.audioText),
    speechStyle:clean(scene?.stimulus?.speechStyle),
    semanticTargets:arr(scene?.semanticTargets).map(clean).filter(Boolean),
    targetCompetencies:arr(scene?.targetCompetencies).map(clean).filter(Boolean),
    expectedAction:copy(scene?.expectedAction||null),
    worldObjects:arr(scene?.world?.objects).map(item=>({
      id:clean(item?.id),
      accessibilityLabel:clean(item?.accessibilityLabel),
      visual:copy(item?.visual||null)
    })),
    requiredCapabilities:arr(scene?.requiredCapabilities).map(clean).filter(Boolean),
    provenance:{
      source:'subjects/russian/engine/content/fixtures/real-life-scenes.v1.json',
      status:clean(scene?.status)
    },
    proposedCanonicalRef:`RU03:SCENE:${sceneId}:${revision}`,
    reviewQuestions:[
      'Is the Russian utterance grammatically correct for the intended meaning?',
      'Is the utterance natural and appropriate for the stated setting/register?',
      'Does it unambiguously match the expected learner action and semantic target?',
      'Are spelling, punctuation, stress-sensitive wording and accepted variants acceptable?',
      'Should any wording/variant be changed before canonical publication?'
    ],
    linguisticCorrectness:'REVIEW_REQUIRED',
    reviewDecision:null
  });
}

export function buildCatalogReviewPackets(catalog){
  const scenes=arr(catalog?.scenes);
  return scenes.map(buildSceneReviewPacket);
}
