(function configureBaumanRuntime(global) {
  'use strict';

  const host = global.location && global.location.hostname ? global.location.hostname.toLowerCase() : '';
  const local = host === '127.0.0.1' || host === 'localhost' || host === '::1';
  const meta = document.querySelector('meta[name="bauman-control-origin"]');
  const declared = meta && typeof meta.content === 'string' ? meta.content.trim().replace(/\/$/, '') : '';
  const injected = typeof global.BAUMAN_CONTROL_BASE_URL === 'string'
    ? global.BAUMAN_CONTROL_BASE_URL.trim().replace(/\/$/, '')
    : '';

  const config = {
    runtime: 'bauman-master-ai',
    control: {
      protocol: 'bauman-control-v4',
      deviceAccess: true,
      baseUrl: local ? 'http://127.0.0.1:3003' : (injected || declared),
      pendingPollMs: 15000,
      heartbeatMs: 60000,
      requestTimeoutMs: 5000,
      offlineGraceMs: 86400000,
    },
    features: {
      deviceAccessControl: true,
      offlineGrace: true,
    },
  };

  global.BAUMAN_RUNTIME_CONFIG = Object.freeze(config);
})(window);
