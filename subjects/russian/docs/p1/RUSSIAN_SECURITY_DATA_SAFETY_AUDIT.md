# Russian P1 Security & Data Safety Audit

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Static findings

### SAFE-S001 — No runtime eval / Function constructor in scanned primary runtime
The primary Russian runtime files scanned in P1 contain no `eval(...)` or `new Function(...)` use.

### SAFE-S002 — Dynamic HTML is common but usually escaped
`core.js`, Future UI and auxiliary renderers use `innerHTML`/HTML strings. The primary renderer exposes an `esc(...)` boundary and many user/content fields are escaped. This lowers injection risk but does not prove every path is safe.

### SAFE-S003 — JSON import is parsed before mutation
Storage editing/import paths use `JSON.parse` and reject invalid JSON. Schema-level validation remains inconsistent by dataset and requires P3 hardening.

### RISK-S001 — Oversize learner storage can be deleted without backup
`core.js:23–33` `safeLocalJson` removes a localStorage key when payload length exceeds the configured maximum.
For the core learner state, `loadState()` calls this with a 1,600,000-character limit.

Current behavior:
`oversize → console.warn → localStorage.removeItem(key) → fallback`.

Missing:
- raw backup;
- recovery fixture;
- user-visible recovery path;
- migration evidence.

Classification: **BLOCKER-candidate / learner-data-loss risk**.
P1 does not change the behavior; P4/P14 must harden it before any state/schema migration.

### RISK-S002 — Malformed JSON falls back silently
Malformed JSON catches to fallback. Unlike the oversize path it does not delete immediately, but runtime can continue on fallback state. Recovery semantics and preservation evidence are not explicit.

### RISK-S003 — Dynamic data rendering requires systematic sink audit
There are multiple `innerHTML` and `insertAdjacentHTML` sinks. Existing escaping is a positive control, but P1 has not proven sink coverage for every editable/imported field.

## Offline/data safety
Current offline audit passes:
- versioned cache;
- optional large data not precached;
- navigation-only HTML fallback;
- foundation/shared runtime coverage;
- user-initiated full-core caching;
- Save-Data guard.

## P1 conclusion
Security baseline is usable, but learner-state recovery is not strong enough for destructive schema work.
