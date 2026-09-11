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

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = securityHeaders(assetResponse.headers);
    const contentType = headers.get('content-type') || '';
    if (!assetResponse.ok || !contentType.includes('text/html')) {
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
