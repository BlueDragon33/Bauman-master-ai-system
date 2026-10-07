export const GROUNDED_SUPPORT_STEPS=Object.freeze([
  'none',
  'replay',
  'visual-focus',
  'slower-replay',
  'gesture',
  'semantic-contrast',
  'simpler-russian',
  'known-russian-paraphrase',
  'transcript',
  'explicit-explanation',
  'native-language-translation'
]);

const clean=value=>String(value??'').trim();
const clampSupport=value=>Math.max(0,Math.min(10,Number(value)||0));

export function evaluateGroundedSelection({scene,selectedObjectId,supportLevel=0,attemptId=''}={}){
  if(!scene?.sceneId)throw new Error('scene is required');
  const selected=clean(selectedObjectId);
  const expected=clean(scene?.expectedAction?.objectId);
  if(!expected)throw new Error('scene expectedAction.objectId is required');
  const before=clampSupport(supportLevel);
  const success=selected===expected;
  const after=success?before:Math.min(10,before+1);

  return Object.freeze({
    success,
    sceneId:scene.sceneId,
    selectedObjectId:selected,
    expectedObjectId:expected,
    supportLevelBefore:before,
    supportLevelAfter:after,
    supportStep:GROUNDED_SUPPORT_STEPS[after],
    transcriptVisible:after>=8,
    translationVisible:after>=10,
    consequence:success?{
      kind:'world-state-change',
      mutation:scene?.successConsequence?.mutation||'success',
      objectId:expected
    }:{
      kind:'no-success-mutation',
      mutation:null,
      objectId:selected
    },
    evidence:{
      schemaVersion:'RUSSIAN_ENGINE_BROWSER_OBSERVATION_V1',
      evidenceId:['RE09S1',clean(attemptId)||'ATT',scene.sceneId,String(Date.now())].join(':'),
      attemptId:clean(attemptId),
      experienceId:'RE02-EXP-'+scene.sceneId,
      competencyIds:Array.isArray(scene.targetCompetencies)?[...scene.targetCompetencies]:[],
      observationType:'grounded-semantic-comprehension',
      result:{success,selectedObjectId:selected,expectedObjectId:expected},
      supportLevel:before,
      authoritative:false,
      masteryMutation:false
    }
  });
}

export function nextTransferScene(scenes,currentScene){
  const group=clean(currentScene?.transferGroup);
  if(!group)return null;
  return (Array.isArray(scenes)?scenes:[]).find(
    item=>item?.sceneId!==currentScene?.sceneId&&clean(item?.transferGroup)===group
  )||null;
}

export function shouldEnableGroundedSlice(locationLike){
  try{
    const url=new URL(locationLike?.href||String(locationLike||''),'https://local.invalid/');
    return ['grounded-v1','beta-v1'].includes(url.searchParams.get('ruEngine'));
  }catch(_){
    return false;
  }
}
