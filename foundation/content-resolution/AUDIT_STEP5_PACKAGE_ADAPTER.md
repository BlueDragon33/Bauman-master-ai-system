# Bauman Foundation — Content Resolution & Runtime Delivery — Step 5 Package-Relative Fetch Adapter Audit

## Goal

Add the first environment-specific delivery adapter without changing any existing application loader.

## Adapter

`package-relative-fetch-adapter.js` implements only the `package-relative-resource` adapter.

It requires:

- explicit HTTP/HTTPS base URL;
- no credentials embedded in base URL;
- repository-relative resource path;
- same-origin URL resolution;
- GET only;
- `credentials: same-origin`;
- `redirect: error`;
- `cache: no-cache`.

Traversal, absolute paths, backslashes, query strings and fragments are rejected.

## Integrity boundary

The adapter does not decide whether bytes are trusted.

It returns bytes to the injected delivery executor, which verifies SHA-256 digest and byte length before the consumer receives them.

Therefore HTTP 200 alone is never treated as content integrity.

## Authority boundary

The adapter does not:

- read or mutate registry records;
- evaluate access;
- mutate learner state;
- change routes;
- bypass checksum verification;
- permit cross-origin redirects.

## Integration status

Step 5 does not replace an existing Hub, Academic, subject, or packaging loader.

It proves the adapter in isolation through the resolver → delivery plan → executor → adapter chain.

## Gate

Step 5 requires:

- Steps 1–4 PASS;
- same-origin URL materialization PASS;
- exact fetch options PASS;
- executor integrity verification before consumer PASS;
- invalid base protocol/credentials/path/query/fragment/HTTP/body failures PASS.

A later step may integrate this adapter in shadow mode with one existing loader before any authority switch.


## Repair 5.1 — Explicit fetch injection semantics

The first Step 5 CI run exposed an ambiguity under Node 22, where a caller that explicitly passed `fetchFn: null` silently fell back to the environment's global `fetch`.

The adapter now distinguishes:

- `fetchFn` omitted → environment fetch may be used;
- `fetchFn` explicitly supplied → it must be a function;
- `fetchFn: null` or another invalid explicit value → fail closed with `FETCH_UNAVAILABLE`.

This prevents caller configuration errors from silently changing transport authority.
