(function baumanDeviceAccessGate(global) {
  'use strict';

  const config = global.BAUMAN_RUNTIME_CONFIG && global.BAUMAN_RUNTIME_CONFIG.control;
  const ROOT_STATE = 'baumanDeviceAccess';
  const DB_NAME = 'bauman-device-identity-v4';
  const STORE_NAME = 'identity';
  const IDENTITY_KEY = 'primary';
  const SESSION_KEY = 'bauman-device-session-v4';
  const encoder = new TextEncoder();

  class ApiError extends Error {
    constructor(message, status, code, payload) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code || 'BAUMAN_DEVICE_API_ERROR';
      this.payload = payload || {};
    }
  }

  function setRootState(state) {
    document.documentElement.dataset[ROOT_STATE] = state;
  }

  function base64Url(bytes) {
    let binary = '';
    const view = new Uint8Array(bytes);
    for (let index = 0; index < view.length; index += 1) binary += String.fromCharCode(view[index]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function detectDeviceType() {
    const width = Math.max(global.innerWidth || 0, document.documentElement.clientWidth || 0);
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (navigator.maxTouchPoints > 1 && width >= 600 && width < 1200)) return 'tablet';
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 600) return 'phone';
    return 'desktop';
  }

  function deviceLabel() {
    const platform = navigator.userAgentData && navigator.userAgentData.platform
      ? navigator.userAgentData.platform
      : navigator.platform || 'Thiết bị';
    return `${platform} · ${detectDeviceType()}`.slice(0, 100);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Không mở được kho khóa thiết bị.'));
    });
  }

  async function readIdentity() {
    const database = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(IDENTITY_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Không đọc được khóa thiết bị.'));
      });
    } finally {
      database.close();
    }
  }

  async function writeIdentity(identity) {
    const database = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(identity, IDENTITY_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Không lưu được khóa thiết bị.'));
        tx.onabort = () => reject(tx.error || new Error('Kho khóa thiết bị đã hủy giao dịch.'));
      });
    } finally {
      database.close();
    }
  }

  async function createIdentity() {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign', 'verify'],
    );
    if (!pair.privateKey || pair.privateKey.extractable) throw new Error('Không tạo được private key P-256 non-extractable.');
    const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    const identity = {
      version: 4,
      privateKey: pair.privateKey,
      publicJwk,
      deviceId: '',
      deviceCode: '',
      lastKnownStatus: 'pending',
      lastVerifiedAt: 0,
      createdAt: Date.now(),
    };
    await writeIdentity(identity);
    return identity;
  }

  async function api(path, options) {
    if (!config || !config.baseUrl) throw new ApiError('Chưa cấu hình Bauman Control Service cho runtime này.', 503, 'BAUMAN_CONTROL_ORIGIN_NOT_CONFIGURED');
    const controller = new AbortController();
    const timeout = global.setTimeout(() => controller.abort(), Number(config.requestTimeoutMs) || 5000);
    try {
      const response = await fetch(`${config.baseUrl}${path}`, {
        method: options && options.method ? options.method : 'GET',
        headers: {
          ...(options && options.body ? { 'content-type': 'application/json' } : {}),
          ...(options && options.token ? { authorization: `Bearer ${options.token}` } : {}),
        },
        body: options && options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store',
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(payload.error || `Bauman Control trả HTTP ${response.status}.`, response.status, payload.code, payload);
      return payload;
    } finally {
      global.clearTimeout(timeout);
    }
  }

  function session() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.token !== 'string' || !parsed.token.startsWith('bm1.')) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function saveSession(value) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function connectivityFailure(error) {
    return error instanceof TypeError
      || (error && error.name === 'AbortError')
      || (error instanceof ApiError && error.status >= 500);
  }

  function withinOfflineGrace(identity) {
    const verifiedAt = Number(identity && identity.lastVerifiedAt || 0);
    const grace = Number(config && config.offlineGraceMs || 0);
    return verifiedAt > 0 && grace > 0 && Date.now() - verifiedAt <= grace && identity.lastKnownStatus === 'approved';
  }

  function gateElement() {
    let gate = document.getElementById('baumanDeviceGate');
    if (gate) return gate;
    gate = document.createElement('section');
    gate.id = 'baumanDeviceGate';
    gate.className = 'bauman-device-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML = [
      '<div class="bauman-device-card">',
      '<div class="bauman-device-mark">BM</div>',
      '<span class="bauman-device-kicker">BAUMAN · DEVICE ACCESS</span>',
      '<h1 id="baumanDeviceTitle">Đang xác minh thiết bị…</h1>',
      '<p id="baumanDeviceMessage">Thiết bị phải chứng minh quyền sở hữu khóa P-256 trước khi mở lộ trình học tập.</p>',
      '<div class="bauman-device-code hidden" id="baumanDeviceCodeWrap"><span>Mã thiết bị</span><strong id="baumanDeviceCode">—</strong><button type="button" id="baumanDeviceCopy">Sao chép</button></div>',
      '<div class="bauman-device-status"><i></i><span id="baumanDeviceStatus">Đang kiểm tra kết nối…</span></div>',
      '<button type="button" class="bauman-device-retry" id="baumanDeviceRetry">Kiểm tra lại</button>',
      '<small>Private key chỉ nằm trên thiết bị này. Application Management chỉ duyệt/khóa registry BM- qua Control API của Bauman.</small>',
      '</div>',
    ].join('');
    document.body.appendChild(gate);
    gate.querySelector('#baumanDeviceRetry').addEventListener('click', () => void reconcile(true));
    gate.querySelector('#baumanDeviceCopy').addEventListener('click', async () => {
      const code = gate.querySelector('#baumanDeviceCode').textContent || '';
      try { await navigator.clipboard.writeText(code); } catch { /* clipboard is convenience only */ }
    });
    return gate;
  }

  function render(state, title, message, statusText, identity) {
    const gate = gateElement();
    gate.dataset.state = state;
    gate.classList.remove('hidden');
    setRootState(state);
    gate.querySelector('#baumanDeviceTitle').textContent = title;
    gate.querySelector('#baumanDeviceMessage').textContent = message;
    gate.querySelector('#baumanDeviceStatus').textContent = statusText;
    const codeWrap = gate.querySelector('#baumanDeviceCodeWrap');
    const code = identity && identity.deviceCode ? identity.deviceCode : '';
    gate.querySelector('#baumanDeviceCode').textContent = code || '—';
    codeWrap.classList.toggle('hidden', !code);
  }

  function allow(state, message) {
    const gate = gateElement();
    gate.classList.add('hidden');
    setRootState(state);
    global.dispatchEvent(new CustomEvent('bauman-device-access', { detail: { state, message } }));
  }

  async function ensureRegistered(identity) {
    if (identity.deviceId && identity.deviceCode) return identity;
    const response = await api('/api/device/register', {
      method: 'POST',
      body: {
        publicJwk: identity.publicJwk,
        deviceType: detectDeviceType(),
        displayName: deviceLabel(),
        label: document.title || 'Bauman Master AI',
      },
    });
    const device = response.device || {};
    if (!/^[a-f0-9]{64}$/.test(device.deviceId || '') || !/^BM-[A-Z0-9-]+$/.test(device.deviceCode || '')) {
      throw new ApiError('Control Service chưa trả registry BM- hợp lệ.', 502, 'INVALID_DEVICE_REGISTRATION_RESPONSE');
    }
    const next = {
      ...identity,
      deviceId: device.deviceId,
      deviceCode: device.deviceCode,
      lastKnownStatus: device.status || 'pending',
    };
    await writeIdentity(next);
    return next;
  }

  async function reregister(identity) {
    const response = await api('/api/device/register', {
      method: 'POST',
      body: {
        publicJwk: identity.publicJwk,
        deviceType: detectDeviceType(),
        displayName: deviceLabel(),
        label: document.title || 'Bauman Master AI',
      },
    });
    const device = response.device || {};
    const next = { ...identity, deviceId: device.deviceId || identity.deviceId, deviceCode: device.deviceCode || identity.deviceCode, lastKnownStatus: device.status || 'pending' };
    await writeIdentity(next);
    return next;
  }

  async function readStatus(identity) {
    try {
      return await api(`/api/device/status?deviceId=${encodeURIComponent(identity.deviceId)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const next = await reregister(identity);
        return api(`/api/device/status?deviceId=${encodeURIComponent(next.deviceId)}`);
      }
      throw error;
    }
  }

  async function prove(identity) {
    const challenge = await api('/api/device/challenge', { method: 'POST', body: { deviceId: identity.deviceId } });
    if (!challenge.challengeId || !challenge.signingInput) throw new ApiError('Challenge Bauman không hợp lệ.', 502, 'INVALID_CHALLENGE_RESPONSE');
    const signed = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      identity.privateKey,
      encoder.encode(challenge.signingInput),
    );
    const verified = await api('/api/device/verify', {
      method: 'POST',
      body: {
        deviceId: identity.deviceId,
        challengeId: challenge.challengeId,
        signature: base64Url(signed),
      },
    });
    if (!verified.sessionToken || !String(verified.sessionToken).startsWith('bm1.')) {
      throw new ApiError('Bauman chưa cấp phiên thiết bị hợp lệ.', 502, 'INVALID_DEVICE_SESSION_RESPONSE');
    }
    saveSession({ token: verified.sessionToken, expiresAt: Number(verified.expiresAt || 0) });
    const next = { ...identity, lastKnownStatus: 'approved', lastVerifiedAt: Date.now() };
    await writeIdentity(next);
    return next;
  }

  async function heartbeat(identity, token) {
    const response = await api('/api/device/heartbeat', { method: 'POST', token });
    const device = response.device || {};
    const next = { ...identity, lastKnownStatus: device.status || 'approved', lastVerifiedAt: Date.now() };
    await writeIdentity(next);
    return next;
  }

  let pollingTimer = null;
  let heartbeatTimer = null;
  let running = false;

  function clearTimers() {
    if (pollingTimer) global.clearTimeout(pollingTimer);
    if (heartbeatTimer) global.clearTimeout(heartbeatTimer);
    pollingTimer = null;
    heartbeatTimer = null;
  }

  function schedulePending() {
    if (pollingTimer) global.clearTimeout(pollingTimer);
    pollingTimer = global.setTimeout(() => void reconcile(false), Number(config.pendingPollMs) || 15000);
  }

  function scheduleHeartbeat() {
    if (heartbeatTimer) global.clearTimeout(heartbeatTimer);
    heartbeatTimer = global.setTimeout(() => void backgroundHeartbeat(), Number(config.heartbeatMs) || 60000);
  }

  async function backgroundHeartbeat() {
    let identity = null;
    try {
      identity = await readIdentity();
      const current = session();
      if (!identity || !current || !current.token) return void reconcile(false);
      identity = await heartbeat(identity, current.token);
      allow('authorized', 'Thiết bị đã xác minh.');
      scheduleHeartbeat();
    } catch (error) {
      if (identity && connectivityFailure(error) && withinOfflineGrace(identity)) {
        allow('offline-grace', 'Đang dùng quyền đã xác minh gần nhất trong giới hạn offline.');
        scheduleHeartbeat();
        return;
      }
      clearSession();
      void reconcile(false);
    }
  }

  async function reconcile(forceVisible) {
    if (running) return;
    running = true;
    clearTimers();
    let identity = null;
    try {
      if (!global.crypto || !crypto.subtle || !global.indexedDB) throw new Error('Trình duyệt không hỗ trợ WebCrypto/IndexedDB cần cho Device Gate.');
      if (!config || config.deviceAccess !== true) throw new Error('Device Gate Bauman chưa được bật trong runtime config.');
      if (!config.baseUrl) {
        render('offline', 'Chưa cấu hình Control Service', 'Runtime production cần khai báo origin của Bauman Control Service trước khi có thể xác minh thiết bị.', 'Fail-closed · chưa có control origin', identity);
        return;
      }
      if (forceVisible) render('checking', 'Đang xác minh thiết bị…', 'Đang kiểm tra registry BM- và chứng minh khóa P-256.', 'Đang kết nối Control Service…', identity);

      identity = await readIdentity();
      if (!identity || identity.version !== 4 || !identity.privateKey || !identity.publicJwk) identity = await createIdentity();
      identity = await ensureRegistered(identity);

      const statusResponse = await readStatus(identity);
      const device = statusResponse.device || {};
      identity = { ...identity, deviceId: device.deviceId || identity.deviceId, deviceCode: device.deviceCode || identity.deviceCode, lastKnownStatus: device.status || identity.lastKnownStatus };
      await writeIdentity(identity);

      if (device.status === 'blocked') {
        clearSession();
        render('blocked', 'Thiết bị đã bị khóa', 'Application Management đã thu hồi quyền truy cập của thiết bị Bauman này. Registry BM- vẫn được giữ để audit.', 'Không có quyền truy cập', identity);
        return;
      }
      if (device.status !== 'approved') {
        clearSession();
        render('pending', 'Thiết bị đang chờ duyệt', 'Mở Application Management → Bauman Hub → Thiết bị và duyệt đúng mã BM- bên dưới.', 'Đang chờ Chủ hệ thống duyệt', identity);
        schedulePending();
        return;
      }

      const current = session();
      if (current && current.token) {
        try {
          identity = await heartbeat(identity, current.token);
          allow('authorized', 'Phiên thiết bị còn hiệu lực.');
          scheduleHeartbeat();
          return;
        } catch (error) {
          if (!(error instanceof ApiError) || (error.status !== 401 && error.status !== 403)) throw error;
          clearSession();
        }
      }

      identity = await prove(identity);
      allow('authorized', 'P-256 proof thành công.');
      scheduleHeartbeat();
    } catch (error) {
      if (identity && connectivityFailure(error) && withinOfflineGrace(identity)) {
        allow('offline-grace', 'Control Service tạm mất kết nối; dùng quyền đã xác minh gần nhất trong giới hạn offline.');
        scheduleHeartbeat();
        return;
      }
      const code = error instanceof ApiError ? error.code : '';
      if (code === 'DEVICE_BLOCKED') {
        clearSession();
        if (identity) identity = { ...identity, lastKnownStatus: 'blocked' };
        if (identity) await writeIdentity(identity).catch(() => {});
        render('blocked', 'Thiết bị đã bị khóa', error.message, 'Không có quyền truy cập', identity);
      } else if (code === 'DEVICE_PENDING') {
        clearSession();
        render('pending', 'Thiết bị đang chờ duyệt', error.message, 'Đang chờ Chủ hệ thống duyệt', identity);
        schedulePending();
      } else {
        render('offline', 'Không thể xác minh thiết bị', error && error.message ? error.message : 'Device Gate đang tạm gián đoạn.', 'Fail-closed · cần kết nối hoặc quyền offline còn hiệu lực', identity);
      }
    } finally {
      running = false;
    }
  }

  global.addEventListener('online', () => void reconcile(false));
  global.addEventListener('storage', (event) => {
    if (event.key === SESSION_KEY) void reconcile(false);
  });

  gateElement();
  void reconcile(true);
})(window);
