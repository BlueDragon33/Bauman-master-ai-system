(function (global) {
  'use strict';

  const config = global.BAUMAN_RUNTIME_CONFIG || {};
  const storage = global.BaumanPlatformStorage;
  const mainRepository = global.BaumanMainStateRepository;
  const schema = global.BaumanPersonalLearningSchema;
  const migrator = global.BaumanPersonalLearningMigrator;

  if (!storage || !mainRepository || !schema || !migrator) {
    throw new Error('BaumanPersonalLearningRepository dependencies are incomplete');
  }

  const SHADOW_KEY = schema.shadowKey;

  function readShadow(fallback) {
    return storage.getJSON(SHADOW_KEY, fallback);
  }

  function removeShadow(metadata) {
    storage.removeItem(SHADOW_KEY, {
      kind: 'personal-learning-shadow',
      ...(metadata || {})
    });
  }

  function buildFromLegacy() {
    const legacyState = mainRepository.readMainState({}) || {};
    const currentUser = mainRepository.readCurrentUser(null);
    const personalState = migrator.fromLegacyMainState(legacyState, currentUser);
    const integrity = migrator.integrityReport(legacyState, personalState);
    return { legacyState, currentUser, personalState, integrity };
  }

  function writeShadow(personalState, integrity, metadata) {
    if (!schema.isPersonalLearningState(personalState)) {
      return { written: false, reason: 'invalid-schema', integrity: integrity || null };
    }
    if (!integrity || integrity.passed !== true) {
      return { written: false, reason: 'integrity-failed', integrity: integrity || null };
    }
    storage.setJSON(SHADOW_KEY, personalState, {
      kind: 'personal-learning-shadow',
      schemaVersion: schema.schemaVersion,
      ...(metadata || {})
    });
    return { written: true, key: SHADOW_KEY, integrity };
  }

  function refreshShadow(metadata) {
    const beforeRaw = storage.getItem(mainRepository.keys.mainState);
    const built = buildFromLegacy();
    const result = writeShadow(built.personalState, built.integrity, {
      source: 'legacy-main-state',
      ...(metadata || {})
    });
    const afterRaw = storage.getItem(mainRepository.keys.mainState);
    const legacyPreserved = beforeRaw === afterRaw;
    if (!legacyPreserved) {
      removeShadow({ reason: 'legacy-mutated-during-shadow-refresh' });
      return {
        written: false,
        reason: 'legacy-mutated',
        legacyPreserved: false,
        integrity: built.integrity
      };
    }
    return {
      ...result,
      legacyPreserved: true,
      personalState: built.personalState
    };
  }

  function auditShadow() {
    const legacyState = mainRepository.readMainState({}) || {};
    const shadow = readShadow(null);
    if (!shadow) return { present: false, passed: false, reason: 'missing-shadow' };
    const integrity = migrator.integrityReport(legacyState, shadow);
    return {
      present: true,
      passed: integrity.passed === true,
      integrity,
      key: SHADOW_KEY
    };
  }

  global.BaumanPersonalLearningRepository = Object.freeze({
    version: 1,
    shadowKey: SHADOW_KEY,
    featureEnabled: config.features?.personalLearningShadow === true,
    readShadow,
    removeShadow,
    buildFromLegacy,
    writeShadow,
    refreshShadow,
    auditShadow
  });
})(window);
