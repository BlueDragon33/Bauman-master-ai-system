(function (global) {
  'use strict';

  const config = global.BAUMAN_RUNTIME_CONFIG || {};
  const repository = global.BaumanPersonalLearningRepository;
  if (!repository) throw new Error('BaumanPersonalLearningBootstrap requires BaumanPersonalLearningRepository');

  function status() {
    const enabled = config.features?.personalLearningShadow === true;
    const audit = repository.auditShadow();
    return {
      enabled,
      feature: 'personalLearningShadow',
      shadowKey: repository.shadowKey,
      shadowPresent: audit.present === true,
      shadowPassed: audit.passed === true,
      cutoverReady: audit.integrity?.cutoverReady === true,
      audit
    };
  }

  function refreshIfEnabled(metadata) {
    if (config.features?.personalLearningShadow !== true) {
      return {
        written: false,
        skipped: true,
        reason: 'feature-disabled',
        shadowKey: repository.shadowKey
      };
    }
    return repository.refreshShadow({
      source: 'personal-learning-bootstrap',
      ...(metadata || {})
    });
  }

  function audit() {
    const current = status();
    if (global.console) {
      const method = current.shadowPassed || !current.enabled ? 'info' : 'warn';
      global.console[method]('[BAUMAN_PERSONAL_LEARNING_AUDIT]', current);
    }
    return current;
  }

  global.BaumanPersonalLearning = Object.freeze({
    version: 1,
    status,
    refreshIfEnabled,
    audit
  });
  global.BAUMAN_PERSONAL_LEARNING_AUDIT = audit;
})(window);
