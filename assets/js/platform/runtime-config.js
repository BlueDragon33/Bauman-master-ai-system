(function (global) {
  'use strict';

  const config = {
    schemaVersion: 1,
    environment: 'local',
    api: {
      enabled: false,
      baseUrl: ''
    },
    control: {
      deviceAccess: true,
      baseUrl: 'https://learning-management.boiech-ai.workers.dev',
      pendingPollMs: 15000,
      heartbeatMs: 60000,
      offlineGraceMs: 86400000
    },
    features: {
      cloudSync: false,
      backendAuth: false,
      aiServiceProxy: false,
      personalLearningShadow: false,
      siteRuntime: true,
      offlineLibrary: true,
      localFileLibrary: true,
      serviceWorkerCache: false,
      deviceAccessControl: true
    },
    storage: {
      mode: 'local-compatible',
      preserveLegacyKeys: true,
      crossTabEvents: true
    },
    compatibility: {
      legacyMainStateKey: 'bauman_main_all_phases_subjects_v1',
      legacyUsersKey: 'bauman_main_users_fullcode_v1',
      legacyCurrentUserKey: 'bauman_current_user_fullcode_v1',
      legacyAuthIsUiGateOnly: true
    }
  };

  global.BAUMAN_RUNTIME_CONFIG = Object.freeze(config);
})(window);