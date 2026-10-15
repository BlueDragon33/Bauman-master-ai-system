# Bauman Hub — Application Management SSO adapter (opt-in)

**Source:** `cloudflare/app-manager-sso.mjs`, `cloudflare/runtime-worker.mjs`, `cloudflare/runtime-worker-python.mjs`.

## Existing truth and authority

Bauman retains its own learning runtime, content, personal data, P-256 device registry, `/api/device/heartbeat`, managed/standalone access boundary, and separate Windows/phone/tablet UX. App-Manage **only** proves an authenticated account for browser navigation; no universal owner role or approval of a Bauman device is conferred. Never replace a Bauman device session with a browser SSO cookie.

## Enablement after separate Preview verification

The adapter is **disabled by default**. A reviewed Bauman **managed-mode Preview** must define:

- `BAUMAN_ACCESS_MODE=managed`.
- `BAUMAN_SSO_ENABLED=true`.
- `BAUMAN_SSO_CALLBACK_URL=https://<exact-registered-bauman-preview-origin>/__sso/callback`.
- `BAUMAN_SSO_SESSION_KEY`: strong random server-only secret (at least 32 characters), never checked into repository, not reused as an App-Manage secret.

The callback origin must exactly match the incoming HTTPS origin. No wildcard or temporary branch hostname is accepted.

App-Manage must first add the matching client record to `managed_browser_sso_clients`, with `client_id=bauman-master-ai`, the exact callback URL, `status=enabled` and `required_role=owner`. Do not register a dead endpoint or mark a client Connected before live callback, device and session tests pass.

The browser starts at `/__sso/start`: PKCE S256 and state → App-Manage V2 grant → backchannel token exchange → server-only HttpOnly cookie → `/`. Bauman's P-256 Device Gate continues to authorize protected assets and Python execution separately. `/__sso/status` only returns authenticated true/false, never credentials or personal profile. Logging out via same-origin POST to `/__sso/logout` clears only the Bauman SSO browser session.

## Fail-closed conditions

Unregistered client, invalid token signature, callback hostname drift, wrong audience, wrong verified login method, expired state, revoked App-Manage role, failed Device Gate, unavailable SSO gateway, or missing secret → deny, never grant Bauman owner permissions. Off-line/standalone mode remains available independently of App-Manage and the central gateway.

## Release evidence required

1. App-Manage #353 migration/CI and Cloudflare live readback.
2. Bauman target PR Fast CI (PKCE, mismatch, tamper, SSO status, Device Gate).
3. Real deployed managed-mode Preview and exact registered callback.
4. iPad/PC browser test: one-click access, refresh, expired session, signed-in device status, blocked device, logout, App-Manage revocation and network outage.
5. Release authority and independent Production gate: Preview success alone must not publish Production.

As long as steps 3–5 are not proven, status is `adapter implemented / SSO not connected`.
