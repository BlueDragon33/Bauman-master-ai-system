export const RUSSIAN_ENGINE_API_VERSION = '1.0.0';

export const SCHEMAS = Object.freeze({
  experience: 'RUSSIAN_ENGINE_EXPERIENCE_V1',
  interaction: 'RUSSIAN_ENGINE_INTERACTION_V1',
  evidence: 'RUSSIAN_ENGINE_EVIDENCE_V1',
  learnerSnapshot: 'RUSSIAN_ENGINE_LEARNER_SNAPSHOT_V1'
});

const EXPERIENCE_TYPES = new Set([
  'observe','identify','discriminate','act','listen-act','listen-choose',
  'shadow','repeat','answer','describe','narrate','clarify','roleplay',
  'conversation','read','write','technical-explain','research-defense'
]);

const clean = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const plainObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export class RussianEngineContractError extends Error {
  constructor(contract, errors) {
    super(`${contract} contract invalid: ${errors.join('; ')}`);
    this.name = 'RussianEngineContractError';
    this.contract = contract;
    this.errors = [...errors];
  }
}

function assertObject(value, contract) {
  if (!plainObject(value)) throw new RussianEngineContractError(contract, ['expected object']);
}

function requireText(errors, value, field) {
  if (!clean(value)) errors.push(`${field} is required`);
}

function requireArray(errors, value, field, {nonEmpty=false}={}) {
  if (!Array.isArray(value)) errors.push(`${field} must be an array`);
  else if (nonEmpty && value.length === 0) errors.push(`${field} must not be empty`);
}

function requireObject(errors, value, field) {
  if (!plainObject(value)) errors.push(`${field} must be an object`);
}

function rejectMasteryMutation(errors, value) {
  const forbidden = [
    'mastery','mastered','masteryDecision','masteryGranted','officialScore',
    'stageUnlocked','levelGranted','credentialGranted'
  ];
  for (const key of forbidden) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      errors.push(`${key} is forbidden in Engine evidence; RU04/C4 own learning judgment`);
    }
  }
  if (value.authoritative === true) {
    errors.push('authoritative=true is forbidden for Russian Engine observation evidence');
  }
}

export function validateExperience(input) {
  assertObject(input, 'Experience');
  const errors = [];
  if (input.schemaVersion !== SCHEMAS.experience) errors.push(`schemaVersion must be ${SCHEMAS.experience}`);
  requireText(errors, input.experienceId, 'experienceId');
  requireText(errors, input.type, 'type');
  if (clean(input.type) && !EXPERIENCE_TYPES.has(clean(input.type))) errors.push(`unsupported experience type: ${clean(input.type)}`);
  requireArray(errors, input.targetCompetencies, 'targetCompetencies', {nonEmpty:true});
  requireText(errors, input.contentRevision, 'contentRevision');
  requireObject(errors, input.stimulus, 'stimulus');
  requireObject(errors, input.action, 'action');
  requireObject(errors, input.supportPolicy, 'supportPolicy');
  requireObject(errors, input.evidencePolicy, 'evidencePolicy');
  requireObject(errors, input.difficulty, 'difficulty');
  if (plainObject(input.supportPolicy)) {
    const ceiling = Number(input.supportPolicy.maxLevel ?? 10);
    if (!Number.isInteger(ceiling) || ceiling < 0 || ceiling > 10) errors.push('supportPolicy.maxLevel must be an integer from 0 to 10');
  }
  if (errors.length) throw new RussianEngineContractError('Experience', errors);
  return copy(input);
}

export function validateInteraction(input) {
  assertObject(input, 'Interaction');
  const errors = [];
  if (input.schemaVersion !== SCHEMAS.interaction) errors.push(`schemaVersion must be ${SCHEMAS.interaction}`);
  requireText(errors, input.interactionId, 'interactionId');
  requireText(errors, input.attemptId, 'attemptId');
  requireText(errors, input.experienceId, 'experienceId');
  requireText(errors, input.actionType, 'actionType');
  requireObject(errors, input.payload, 'payload');
  requireObject(errors, input.support, 'support');
  requireObject(errors, input.timing, 'timing');
  if (plainObject(input.support)) {
    const level = Number(input.support.level ?? 0);
    if (!Number.isInteger(level) || level < 0 || level > 10) errors.push('support.level must be an integer from 0 to 10');
  }
  if (plainObject(input.timing) && input.timing.responseMs != null) {
    const ms = Number(input.timing.responseMs);
    if (!Number.isFinite(ms) || ms < 0) errors.push('timing.responseMs must be a non-negative finite number');
  }
  if (errors.length) throw new RussianEngineContractError('Interaction', errors);
  return copy(input);
}

export function validateEvidence(input) {
  assertObject(input, 'Evidence');
  const errors = [];
  if (input.schemaVersion !== SCHEMAS.evidence) errors.push(`schemaVersion must be ${SCHEMAS.evidence}`);
  requireText(errors, input.evidenceId, 'evidenceId');
  requireText(errors, input.attemptId, 'attemptId');
  requireText(errors, input.experienceId, 'experienceId');
  requireArray(errors, input.competencyIds, 'competencyIds', {nonEmpty:true});
  requireText(errors, input.observationType, 'observationType');
  requireObject(errors, input.result, 'result');
  requireObject(errors, input.provider, 'provider');
  const supportLevel = Number(input.supportLevel ?? 0);
  if (!Number.isInteger(supportLevel) || supportLevel < 0 || supportLevel > 10) errors.push('supportLevel must be an integer from 0 to 10');
  rejectMasteryMutation(errors, input);
  if (errors.length) throw new RussianEngineContractError('Evidence', errors);
  return copy({...input, authoritative:false});
}

export function validateLearnerSnapshot(input) {
  assertObject(input, 'LearnerSnapshot');
  const errors = [];
  if (input.schemaVersion !== SCHEMAS.learnerSnapshot) errors.push(`schemaVersion must be ${SCHEMAS.learnerSnapshot}`);
  requireText(errors, input.profileId, 'profileId');
  requireObject(errors, input.capabilities, 'capabilities');
  requireArray(errors, input.reviewDue, 'reviewDue');
  requireObject(errors, input.progression, 'progression');
  if (input.progression?.internalLevel != null) {
    const level = Number(input.progression.internalLevel);
    if (!Number.isInteger(level) || level < 1 || level > 100) errors.push('progression.internalLevel must be an integer from 1 to 100');
  }
  if (errors.length) throw new RussianEngineContractError('LearnerSnapshot', errors);
  return copy(input);
}

export function createAttemptId(experienceId, clock=Date.now) {
  const safe = clean(experienceId).replace(/[^A-Za-z0-9:_-]+/g, '-');
  if (!safe) throw new RussianEngineContractError('AttemptIdentity', ['experienceId is required']);
  return `RE-ATT-${safe}-${clock()}`;
}

export function createInteractionId(attemptId, sequence=1) {
  const safe = clean(attemptId).replace(/[^A-Za-z0-9:_-]+/g, '-');
  const n = Number(sequence);
  if (!safe) throw new RussianEngineContractError('InteractionIdentity', ['attemptId is required']);
  if (!Number.isInteger(n) || n < 1) throw new RussianEngineContractError('InteractionIdentity', ['sequence must be a positive integer']);
  return `RE-INT-${safe}-${n}`;
}

export function cloneContract(value) {
  return copy(value);
}
