(function (global) {
  'use strict';

  const config = {
    schemaVersion: 1,
    environment: 'local',
    api: {
      enabled: false,
      baseUrl: ''
    },
    features: {
      cloudSync: false,
      backendAuth: false,
      aiServiceProxy: false
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
