const RUNTIME_SESSION_COOKIE = '__Host-bauman_session';
const PROTECTED_LEARNING_ROOTS = ['/subjects/', '/roadmap_v2/', '/foundation/'];
const PROTECTED_LEARNING_EXTENSIONS = /\.(?:json|md|txt|csv|tsv)$/i;

function safeOrigin(value) {
  const raw = typeof value === 'string' ? value.trim().replace(/\/$/, '') : '';
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function deployment(env) {
  return {
    ok: true,
    application: 'bauman-master-ai',
    runtime: 'learning-runtime',
    channel: env.BAUMAN_DEPLOYMENT_CHANNEL || 'unknown',
    revision: env.BAUMAN_BUILD_REVISION || 'unknown',
    controlOriginConfigured: Boolean(safeOrigin(env.BAUMAN_CONTROL_ORIGIN)),
    serverSideLearningGate: true,
    checkedAt: Date.now(),
  };
}

function securityHeaders(headers) {
  const next = new Headers(headers);
  next.set('x-content-type-options', 'nosniff');
  next.set('referrer-policy', 'strict-origin-when-cross-origin');
  next.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  next.set('content-security-policy', "frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  return next;
}

function cookieValue(request, name) {
  const source = request.headers.get('cookie') || '';
  for (const part of source.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return '';
}

function bearerToken(request) {
  const authorization = request.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

function runtimeCookie(token) {
  return `${RUNTIME_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;
}

function clearRuntimeCookie() {
  return `${RUNTIME_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function protectedLearningAsset(pathname) {
  return PROTECTED_LEARNING_ROOTS.some((root) => pathname.startsWith(root))
    && PROTECTED_LEARNING_EXTENSIONS.test(pathname);
}

async function validateDeviceSession(request, controlOrigin, token) {
  if (!/^bm1\.[A-Za-z0-9_-]{40,100}$/.test(token)) {
    return { ok: false, status: 401, code: 'DEVICE_SESSION_REQUIRED' };
  }
  const runtimeOrigin = new URL(request.url).origin;
  try {
    const response = await fetch(`${controlOrigin}/api/device/heartbeat`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        origin: runtimeOrigin,
      },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.device || payload.device.status !== 'approved') {
      return {
        ok: false,
        status: response.status === 401 ? 401 : 403,
        code: payload?.code || 'DEVICE_ACCESS_DENIED',
      };
    }
    return { ok: true, device: payload.device };
  } catch {
    return { ok: false, status: 503, code: 'BAUMAN_CONTROL_UNAVAILABLE' };
  }
}

function gateResponse(result, clearCookie = false) {
  const headers = new Headers({
    'cache-control': 'no-store, private',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  });
  if (clearCookie) headers.set('set-cookie', clearRuntimeCookie());
  return new Response(JSON.stringify({ ok: false, code: result.code }), {
    status: result.status,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/__deployment') {
      return Response.json(deployment(env), {
        headers: {
          'cache-control': 'no-store, private',
          'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
          'x-content-type-options': 'nosniff',
        },
      });
    }

    const controlOrigin = safeOrigin(env.BAUMAN_CONTROL_ORIGIN);
    if (!controlOrigin) {
      return Response.json(
        { ok: false, code: 'BAUMAN_CONTROL_ORIGIN_NOT_CONFIGURED' },
        { status: 503, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } },
      );
    }

    if (url.pathname === '/api/runtime/session') {
      if (request.method === 'DELETE') {
        return Response.json({ ok: true }, {
          headers: { 'cache-control': 'no-store', 'set-cookie': clearRuntimeCookie() },
        });
      }
      if (request.method !== 'POST') {
        return Response.json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
      }
      const token = bearerToken(request);
      const validation = await validateDeviceSession(request, controlOrigin, token);
      if (!validation.ok) return gateResponse(validation, true);
      return Response.json({ ok: true, device: validation.device }, {
        headers: {
          'cache-control': 'no-store, private',
          'set-cookie': runtimeCookie(token),
          'x-content-type-options': 'nosniff',
        },
      });
    }

    if (protectedLearningAsset(url.pathname)) {
      const token = cookieValue(request, RUNTIME_SESSION_COOKIE);
      const validation = await validateDeviceSession(request, controlOrigin, token);
      if (!validation.ok) return gateResponse(validation, true);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = securityHeaders(assetResponse.headers);
    const contentType = headers.get('content-type') || '';
    if (!assetResponse.ok || !contentType.includes('text/html')) {
      if (protectedLearningAsset(url.pathname)) headers.set('cache-control', 'private, no-store');
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    headers.set('cache-control', 'no-store');
    const rewritten = new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append(`<meta name="bauman-control-origin" content="${controlOrigin}">`, { html: true });
          element.append(`<meta name="bauman-deployment-channel" content="${env.BAUMAN_DEPLOYMENT_CHANNEL || 'unknown'}">`, { html: true });
          element.append(`<meta name="bauman-build-revision" content="${env.BAUMAN_BUILD_REVISION || 'unknown'}">`, { html: true });
        },
      })
      .transform(new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      }));

    return rewritten;
  },
};
