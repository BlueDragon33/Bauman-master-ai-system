import {
  RUSSIAN_ENGINE_API_VERSION,
  validateExperience,
  validateInteraction,
  validateEvidence,
  validateLearnerSnapshot
} from './contracts.mjs';

const callable = (value, name) => {
  if (typeof value !== 'function') throw new TypeError(`Russian Engine port ${name} must be a function`);
  return value;
};

const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function createRussianEngineFacade(ports={}) {
  const experienceNext = callable(ports.experience?.next, 'experience.next');
  const interactionSubmit = callable(ports.interaction?.submit, 'interaction.submit');
  const learnerSnapshot = callable(ports.learner?.snapshot, 'learner.snapshot');
  const capabilityStatus = typeof ports.capabilities?.status === 'function'
    ? ports.capabilities.status
    : () => ({});

  return Object.freeze({
    apiVersion: RUSSIAN_ENGINE_API_VERSION,

    async getNextExperience(request={}) {
      const experience = await experienceNext(copy(request));
      return validateExperience(experience);
    },

    async submitInteraction(interaction) {
      const validInteraction = validateInteraction(interaction);
      const output = await interactionSubmit(validInteraction);
      const evidence = Array.isArray(output?.evidence) ? output.evidence.map(validateEvidence) : [];
      return Object.freeze({
        accepted: output?.accepted !== false,
        evidence,
        nextHint: output?.nextHint ? copy(output.nextHint) : null,
        consequence: output?.consequence ? copy(output.consequence) : null
      });
    },

    async getLearnerSnapshot(request={}) {
      return validateLearnerSnapshot(await learnerSnapshot(copy(request)));
    },

    getCapabilities() {
      const status = capabilityStatus();
      return copy(status && typeof status === 'object' ? status : {});
    }
  });
}
