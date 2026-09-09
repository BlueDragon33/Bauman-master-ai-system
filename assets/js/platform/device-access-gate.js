(function (global) {
  'use strict';

  const runtime = global.BAUMAN_RUNTIME_CONFIG || {};
  const control = runtime.control || {};
  const enabled = control.deviceAccess !== false;
  const baseUrl = String(control.baseUrl || 'https://learning-management.boiech-ai.workers.dev').replace(/\/$/, '');
  const endpoint = `${baseUrl}/api/bauman/device`;
  const OFFLINE_GRACE_MS = Number(control.offlineGraceMs || 24 * 60 * 60 * 1000);
  const HEARTBEAT_MS = Math.max(30_000, Number(control.heartbeatMs || 60_000));
  const POLL_MS = Math.max(10_000, Number(control.pendingPollMs || 15_000));
  const DB_NAME = 'bauman-device-access-v1';
  const STORE = 'credential';
  const KEY = 'primary';
  const LAST_APPROVED_KEY = 'bauman_device_last_verified_at_v1';

  const accessState = {
    enabled,
    status: enabled ? 'checking' : 'disabled',
    deviceId: null,
    deviceCode: null,
    verifiedAt: null,
    mode: enabled ? 'remote' : 'disabled'
  };
  global.BAUMAN_DEVICE_ACCESS = accessState;

  function base64Url(bytes) {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Không mở được kho khóa thiết bị.'));
    });
  }

  async function readCredential() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Không đọc được khóa thiết bị.'));
    });
  }

  async function writeCredential(value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error('Không lưu được khóa thiết bị.'));
    });
  }

  async function credentialForDevice() {
    const current = await readCredential();
    if (current && current.version === 1 && current.publicKey && current.privateKey) return current;
    const generated = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const publicKey = await crypto.subtle.exportKey('jwk', generated.publicKey);
    const privateJwk = await crypto.subtle.exportKey('jwk', generated.privateKey);
    const privateKey = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const credential = { version: 1, publicKey, privateKey };
    await writeCredential(credential);
    return credential;
  }

  function metadata() {
    const nav = navigator || {};
    const ua = String(nav.userAgent || '');
    const browser = /Edg\//.test(ua) ? 'Edge'
      : /Chrome\//.test(ua) ? 'Chrome'
        : /Firefox\//.test(ua) ? 'Firefox'
          : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return {
      platform: String(nav.userAgentData?.platform || nav.platform || '').slice(0, 120),
      browser,
      language: String(nav.language || '').slice(0, 40),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      screen: global.screen ? `${global.screen.width}x${global.screen.height}` : ''
    };
  }

  async function api(body) {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({ error: 'Phản hồi Trung tâm Quản trị không hợp lệ.' }));
    if (!response.ok) {
      const error = new Error(data.error || 'Không thể kiểm tra quyền thiết bị Bauman.');
      error.code = data.code || 'DEVICE_ACCESS_FAILED';
      error.data = data;
      throw error;
    }
    return data;
  }

  function gate() {
    let root = document.getElementById('baumanDeviceGate');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'baumanDeviceGate';
    root.className = 'bauman-device-gate';
    root.innerHTML = `
      <section class="bauman-device-card" role="status" aria-live="polite">
        <div class="bauman-device-mark">BM</div>
        <span class="bauman-device-kicker">BAUMAN · DEVICE ACCESS</span>
        <h1 id="baumanDeviceGateTitle">Đang xác minh thiết bị…</h1>
        <p id="baumanDeviceGateText">Thiết bị này đang kết nối với Trung tâm Quản trị.</p>
        <div class="bauman-device-code hidden" id="baumanDeviceCodeWrap"><span>Mã thiết bị</span><strong id="baumanDeviceCode">—</strong><button type="button" id="baumanDeviceCopy">Sao chép mã</button></div>
        <div class="bauman-device-status" id="baumanDeviceStatus"><i></i><span>Đang kiểm tra</span></div>
        <button type="button" class="bauman-device-retry" id="baumanDeviceRetry">Kiểm tra lại</button>
        <small>Quyền được xác minh bằng khóa P-256 lưu riêng trên thiết bị này.</small>
      </section>`;
    document.body.appendChild(root);
    root.querySelector('#baumanDeviceRetry').addEventListener('click', () => void run(true));
    root.querySelector('#baumanDeviceCopy').addEventListener('click', async () => {
      if (!accessState.deviceCode) return;
      try { await navigator.clipboard.writeText(accessState.deviceCode); }
      catch { /* Clipboard có thể bị chặn; mã vẫn hiển thị để sao chép thủ công. */ }
    });
    return root;
  }

  function setGate(kind, title, text, deviceCode) {
    const root = gate();
    root.dataset.state = kind;
    root.classList.remove('hidden');
    document.documentElement.dataset.baumanDeviceAccess = kind;
    const titleNode = root.querySelector('#baumanDeviceGateTitle');
    const textNode = root.querySelector('#baumanDeviceGateText');
    const statusNode = root.querySelector('#baumanDeviceStatus span');
    const codeWrap = root.querySelector('#baumanDeviceCodeWrap');
    const codeNode = root.querySelector('#baumanDeviceCode');
    titleNode.textContent = title;
    textNode.textContent = text;
    statusNode.textContent = kind === 'pending' ? 'Chờ quản trị viên duyệt'
      : kind === 'blocked' ? 'Đã bị khóa / loại bỏ'
        : kind === 'offline' ? 'Không kết nối được Trung tâm'
          : 'Đang kiểm tra';
    if (deviceCode) {
      codeWrap.classList.remove('hidden');
      codeNode.textContent = deviceCode;
    } else {
      codeWrap.classList.add('hidden');
    }
  }

  function allow(mode) {
    const root = document.getElementById('baumanDeviceGate');
    if (root) root.classList.add('hidden');
    document.documentElement.dataset.baumanDeviceAccess = 'approved';
    accessState.status = 'approved';
    accessState.mode = mode;
    accessState.verifiedAt = Date.now();
    try { localStorage.setItem(LAST_APPROVED_KEY, String(Date.now())); } catch { /* ignore */ }
    global.dispatchEvent(new CustomEvent('bauman-device-access', { detail: { ...accessState } }));
  }

  function offlineGraceAvailable() {
    try {
      const value = Number(localStorage.getItem(LAST_APPROVED_KEY) || 0);
      return Number.isFinite(value) && value > 0 && Date.now() - value <= OFFLINE_GRACE_MS;
    } catch { return false; }
  }

  async function verifyApproved(credential, device) {
    const challengeData = await api({ action: 'challenge', deviceId: device.deviceId });
    const message = new TextEncoder().encode(`bauman-runtime:${device.deviceId}:${challengeData.challenge}`);
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, credential.privateKey, message);
    const verified = await api({
      action: 'verify',
      deviceId: device.deviceId,
      challenge: challengeData.challenge,
      signature: base64Url(new Uint8Array(signature))
    });
    accessState.deviceId = verified.device.deviceId;
    accessState.deviceCode = verified.device.deviceCode;
    allow('remote');
    return verified.device;
  }

  let running = false;
  let pollTimer = null;
  let heartbeatTimer = null;

  function schedulePoll(delay) {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(() => void run(false), delay);
  }

  function startHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => void run(false), HEARTBEAT_MS);
  }

  async function run(manual) {
    if (!enabled || running) return;
    running = true;
    if (manual || accessState.status !== 'approved') setGate('checking', 'Đang xác minh thiết bị…', 'Thiết bị này đang kết nối với Trung tâm Quản trị.', accessState.deviceCode);
    try {
      const credential = await credentialForDevice();
      const registered = await api({ action: 'register', publicKey: credential.publicKey, metadata: metadata() });
      const device = registered.device;
      accessState.deviceId = device.deviceId;
      accessState.deviceCode = device.deviceCode;
      accessState.status = device.status;

      if (device.status === 'pending') {
        clearInterval(heartbeatTimer);
        setGate('pending', 'Thiết bị đang chờ duyệt', 'Mở Trung tâm Quản trị → Bauman → Thiết bị & truy cập, sau đó duyệt đúng mã BM bên dưới.', device.deviceCode);
        schedulePoll(POLL_MS);
        return;
      }
      if (device.status === 'blocked') {
        clearInterval(heartbeatTimer);
        setGate('blocked', 'Thiết bị chưa được phép truy cập', 'Yêu cầu đã bị loại bỏ hoặc quyền thiết bị đã bị khóa. Quản trị viên có thể mở lại để duyệt.', device.deviceCode);
        schedulePoll(Math.max(POLL_MS, 30_000));
        return;
      }

      await verifyApproved(credential, device);
      startHeartbeat();
    } catch (error) {
      const code = error && error.code;
      const device = error && error.data && error.data.device;
      if (device) {
        accessState.deviceId = device.deviceId || accessState.deviceId;
        accessState.deviceCode = device.deviceCode || accessState.deviceCode;
      }
      if (code === 'DEVICE_PENDING') {
        accessState.status = 'pending';
        setGate('pending', 'Thiết bị đang chờ duyệt', error.message, accessState.deviceCode);
        schedulePoll(POLL_MS);
      } else if (code === 'DEVICE_BLOCKED') {
        accessState.status = 'blocked';
        setGate('blocked', 'Thiết bị chưa được phép truy cập', error.message, accessState.deviceCode);
        schedulePoll(Math.max(POLL_MS, 30_000));
      } else if (offlineGraceAvailable()) {
        allow('offline-grace');
        startHeartbeat();
      } else {
        accessState.status = 'offline';
        setGate('offline', 'Chưa xác minh được quyền thiết bị', 'Không kết nối được Trung tâm Quản trị và thiết bị chưa có xác minh gần đây. Hãy kết nối mạng rồi kiểm tra lại.', accessState.deviceCode);
        schedulePoll(30_000);
      }
    } finally {
      running = false;
    }
  }

  if (!enabled) {
    document.documentElement.dataset.baumanDeviceAccess = 'disabled';
    return;
  }

  document.documentElement.dataset.baumanDeviceAccess = 'checking';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void run(false), { once: true });
  } else {
    void run(false);
  }
  global.addEventListener('online', () => void run(false));
})(window);