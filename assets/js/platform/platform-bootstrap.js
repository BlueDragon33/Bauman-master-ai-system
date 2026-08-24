(function (global) {
  'use strict';

  const VERSION = 'Bauman Platform Bootstrap L2.1';
  const PROBE_KEY = '__bauman_platform_adapter_probe__';

  function getDependencies() {
    return {
      config: global.BAUMAN_RUNTIME_CONFIG || null,
      storage: global.BaumanPlatformStorage || null,
      schema: global.BaumanStateSchema || null
    };
  }

  function audit(options) {
    const opts = options || {};
    const deps = getDependencies();
    const issues = [];
    const warnings = [];
    const checks = {};

    checks.runtimeConfigLoaded = !!deps.config;
    checks.storageAdapterLoaded = !!deps.storage;
    checks.stateSchemaLoaded = !!deps.schema;

    if (!checks.runtimeConfigLoaded) issues.push('Thiếu BAUMAN_RUNTIME_CONFIG');
    if (!checks.storageAdapterLoaded) issues.push('Thiếu BaumanPlatformStorage');
    if (!checks.stateSchemaLoaded) issues.push('Thiếu BaumanStateSchema');

    if (deps.config) {
      checks.cloudSyncOff = deps.config.features?.cloudSync === false;
      checks.backendAuthOff = deps.config.features?.backendAuth === false;
      checks.aiProxyOff = deps.config.features?.aiServiceProxy === false;
      if (!checks.cloudSyncOff || !checks.backendAuthOff || !checks.aiProxyOff) {
        warnings.push('Có feature cloud/auth/AI đã bật trong Safety Platform Layer.');
      }
    }

    if (deps.storage && opts.storageProbe !== false) {
      try {
        const token = 'probe-' + Date.now();
        deps.storage.setItem(PROBE_KEY, token, { purpose: 'platform-audit' });
        checks.storageRoundTrip = deps.storage.getItem(PROBE_KEY) === token;
        deps.storage.removeItem(PROBE_KEY, { purpose: 'platform-audit-cleanup' });
        checks.storageProbeCleaned = deps.storage.getItem(PROBE_KEY) === null;
        if (!checks.storageRoundTrip) issues.push('Storage adapter round-trip thất bại');
        if (!checks.storageProbeCleaned) issues.push('Storage adapter không dọn được probe key');
      } catch (error) {
        checks.storageRoundTrip = false;
        issues.push('Storage adapter probe lỗi: ' + (error?.message || error));
      }
    }

    const compatibility = deps.config?.compatibility || {};
    const legacyKeys = [
      compatibility.legacyMainStateKey,
      compatibility.legacyUsersKey,
      compatibility.legacyCurrentUserKey
    ].filter(Boolean);

    checks.legacyKeysDeclared = legacyKeys.length === 3;
    checks.legacyPreservationEnabled = deps.config?.storage?.preserveLegacyKeys === true;
    if (!checks.legacyKeysDeclared) issues.push('Thiếu khai báo legacy key cấp main');
    if (!checks.legacyPreservationEnabled) issues.push('preserveLegacyKeys không được bật');

    const result = {
      version: VERSION,
      passed: issues.length === 0,
      checks,
      issues,
      warnings,
      storageMode: deps.storage?.mode || 'unavailable',
      schemaVersion: deps.schema?.schemaVersion || null,
      runtimeEnvironment: deps.config?.environment || 'unknown'
    };

    if (opts.log !== false && global.console) {
      const method = result.passed ? 'info' : 'error';
      global.console[method]('[BAUMAN_PLATFORM_AUDIT]', result);
    }
    return result;
  }

  const platform = {
    version: VERSION,
    get ready() {
      const deps = getDependencies();
      return !!(deps.config && deps.storage && deps.schema);
    },
    get dependencies() {
      return getDependencies();
    },
    audit
  };

  global.BaumanPlatform = Object.freeze(platform);
  global.BAUMAN_PLATFORM_AUDIT = audit;
})(window);
