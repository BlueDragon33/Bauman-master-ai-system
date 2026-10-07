import {
  SCHEMAS,
  validateExperience,
  validateInteraction,
  validateEvidence
} from '../public/contracts.mjs';

export const SUPPORT_LADDER = Object.freeze([
  {level:0, kind:'none'},
  {level:1, kind:'replay'},
  {level:2, kind:'visual-focus'},
  {level:3, kind:'slower-replay'},
  {level:4, kind:'gesture-or-animation'},
  {level:5, kind:'semantic-contrast'},
  {level:6, kind:'simpler-russian'},
  {level:7, kind:'known-russian-paraphrase'},
  {level:8, kind:'partial-model'},
  {level:9, kind:'explicit-explanation'},
  {level:10, kind:'native-language-translation-available'}
]);

const clean = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

function validateScene(scene) {
  const errors = [];
  if (!clean(scene?.sceneId)) errors.push('sceneId is required');
  if (!clean(scene?.contentRevision)) errors.push('contentRevision is required');
  if (!arr(scene?.targetCompetencies).length) errors.push('targetCompetencies are required');
  if (scene?.stimulus?.language !== 'ru') errors.push('stimulus.language must be ru');
  if (!clean(scene?.stimulus?.audioText)) errors.push('stimulus.audioText is required');
  if (!arr(scene?.world?.objects).length) errors.push('world.objects are required');
  if (scene?.expectedAction?.kind !== 'select-object') errors.push('RE02 fixture supports select-object only');
  if (!clean(scene?.expectedAction?.objectId)) errors.push('expectedAction.objectId is required');
  if (!arr(scene?.world?.objects).some(x => x?.id === scene?.expectedAction?.objectId)) errors.push('expected object must exist in world.objects');
  if (scene?.supportPolicy?.translationDefault !== 'hidden') errors.push('translationDefault must be hidden');
  if (errors.length) throw new Error(`Grounded scene invalid: ${errors.join('; ')}`);
  return copy(scene);
}

function experienceId(sceneId) {
  return `RE02-EXP-${clean(sceneId)}`;
}

function evidenceId(attemptId, sequence) {
  return `RE02-EVID-${clean(attemptId)}-${sequence}`;
}

export function createGroundedSceneRuntime({scenes=[], clock=Date.now}={}) {
  const sceneList = arr(scenes).map(validateScene);
  const byScene = new Map(sceneList.map(scene => [scene.sceneId, scene]));
  const byExperience = new Map(sceneList.map(scene => [experienceId(scene.sceneId), scene]));
  let evidenceSequence = 0;

  function supportStep(level=0) {
    const normalized = Math.max(0, Math.min(10, Number(level) || 0));
    return SUPPORT_LADDER[normalized];
  }

  function getExperience(sceneId, options={}) {
    const scene = byScene.get(clean(sceneId));
    if (!scene) throw new Error(`Unknown grounded scene: ${clean(sceneId)}`);
    const supportLevel = Math.max(0, Math.min(Number(scene.supportPolicy?.maxLevel ?? 10), Number(options.supportLevel) || 0));
    return validateExperience({
      schemaVersion: SCHEMAS.experience,
      experienceId: experienceId(scene.sceneId),
      type: 'listen-act',
      targetCompetencies: [...scene.targetCompetencies],
      contentRevision: scene.contentRevision,
      stimulus: {
        modality: 'audio+scene',
        language: 'ru',
        audioText: scene.stimulus.audioText,
        speechStyle: scene.stimulus.speechStyle || 'careful-native',
        scene: {
          sceneId: scene.sceneId,
          speakerRole: scene.world.speakerRole || '',
          recipientRole: scene.world.recipientRole || '',
          objects: copy(scene.world.objects)
        }
      },
      action: {
        kind: scene.expectedAction.kind,
        availableObjectIds: scene.world.objects.map(x => x.id)
      },
      supportPolicy: {
        maxLevel: Number(scene.supportPolicy?.maxLevel ?? 10),
        currentLevel: supportLevel,
        currentStep: supportStep(supportLevel),
        translationDefault: 'hidden'
      },
      evidencePolicy: {
        observationType: 'grounded-semantic-comprehension',
        masteryAuthority: 'RU04/C4'
      },
      difficulty: {
        semanticNovelty: Number(options.semanticNovelty ?? 1),
        acousticRate: scene.stimulus.speechStyle || 'careful-native',
        visualGrounding: true,
        distractorCount: Math.max(0, scene.world.objects.length - 1)
      }
    });
  }

  function findTransfer(scene) {
    const candidates = sceneList.filter(x => x.sceneId !== scene.sceneId && clean(x.transferGroup) && x.transferGroup === scene.transferGroup);
    return candidates.length ? candidates[0].sceneId : null;
  }

  function submitInteraction(rawInteraction) {
    const interaction = validateInteraction(rawInteraction);
    const scene = byExperience.get(interaction.experienceId);
    if (!scene) throw new Error(`Unknown experienceId: ${interaction.experienceId}`);
    if (interaction.actionType !== scene.expectedAction.kind) throw new Error(`Unexpected actionType: ${interaction.actionType}`);

    const selectedObjectId = clean(interaction.payload?.objectId);
    const success = selectedObjectId === scene.expectedAction.objectId;
    const supportLevel = Math.max(0, Math.min(10, Number(interaction.support?.level) || 0));
    const nextSupportLevel = success ? supportLevel : Math.min(Number(scene.supportPolicy?.maxLevel ?? 10), supportLevel + 1);
    const sequence = ++evidenceSequence;

    const evidence = validateEvidence({
      schemaVersion: SCHEMAS.evidence,
      evidenceId: evidenceId(interaction.attemptId, sequence),
      attemptId: interaction.attemptId,
      experienceId: interaction.experienceId,
      competencyIds: [...scene.targetCompetencies],
      observationType: 'grounded-semantic-comprehension',
      result: {
        success,
        selectedObjectId,
        expectedObjectId: scene.expectedAction.objectId,
        semanticRelation: scene.expectedAction.semanticRelation || ''
      },
      provider: {
        kind: 'deterministic-grounded-scene-runtime',
        confidence: 1,
        infrastructureFailure: false
      },
      supportLevel,
      authoritative: false,
      observedAtMs: Number(clock())
    });

    return {
      accepted: true,
      evidence: [evidence],
      consequence: success
        ? copy(scene.successConsequence)
        : {kind:'no-success-mutation', mutation:null, objectId:selectedObjectId},
      nextHint: success
        ? null
        : {
            supportLevel: nextSupportLevel,
            step: supportStep(nextSupportLevel),
            translationVisible: nextSupportLevel >= 10
          },
      transferSceneId: success ? findTransfer(scene) : null
    };
  }

  return Object.freeze({
    schema: 'RUSSIAN_ENGINE_GROUNDED_SCENE_RUNTIME_V1',
    sceneCount: sceneList.length,
    supportLadder: SUPPORT_LADDER,
    getExperience,
    submitInteraction,
    getTransferSceneId(sceneId) {
      const scene = byScene.get(clean(sceneId));
      return scene ? findTransfer(scene) : null;
    }
  });
}
