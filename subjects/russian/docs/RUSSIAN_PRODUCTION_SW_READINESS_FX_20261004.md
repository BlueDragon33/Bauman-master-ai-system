# Russian Production Service Worker Readiness Fx

Date: 2026-10-04
Branch: `fix/russian-production-sw-readiness-fx-20261004`
Base: `d572022ec452dc9dc9956dc216d68c7f7ecacbdc`

## Trigger

Production deploy for Math E170 reached successful preview identity, D1 backup/migration, Control deploy, Learning Runtime deploy, production smoke, RU08 learner acceptance and RU08 author acceptance, then failed twice at the Russian offline browser gate:

`Russian service-worker readiness timed out after 30000ms`.

## Fix

- Bump Russian app-shell cache from v8 to v9 so the hardened runtime is not hidden behind an old cache-first shell.
- Retry required shell precache up to three times; still fail installation if required assets cannot be cached.
- Add product-level `ensureServiceWorkerReady()` with:
  - bounded ready timeout,
  - three registration attempts,
  - `updateViaCache: 'none'`,
  - controller-change verification,
  - late-script boot support when DOMContentLoaded already fired.
- Browser acceptance now calls the product readiness API, requires an activated registration and a controlling service worker, then continues the existing offline cache/reload assertions.
- Offline static audit locks these resilience rules.

## Safety boundary

This does not waive offline verification. The release still fails unless the SW activates, controls the page, required data is cached, foundation identity survives offline reload, and browser errors remain zero.
