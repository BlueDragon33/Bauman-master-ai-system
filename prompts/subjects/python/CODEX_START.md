# PYTHON04 CODEX START — BROWSER/WASM PROVIDER ONLY

Repository: `BlueDragon33/Bauman-master-ai-system`

Branch: `python/local-first-browser-provider-20261007`

Baseline main SHA: `63566556b8cfbec41957a25607b0c49dba1a6037`

Primary work package:

`prompts/subjects/python/CURRENT_WORK_PACKET.json`

Active owner:

`prompts/subjects/python/PYTHON04_RUNTIME_TOOLCHAIN_DATA_AI_INTELLIGENCE.md`

Canonical provider decision:

`prompts/subjects/python/evidence/PYTHON04_LOCAL_FIRST_PROVIDER_DECISION.md`

## ROLE

You are the deep runtime specialist for one narrowly scoped task.

Chat Orchestrator owns architecture, project state, CI review, merge and release.

Do not broaden the task.

## GOAL

Implement the smallest real self-hosted browser/WASM Python provider behind the existing `BAUMAN_PYTHON_PRODUCT` facade so supported learner `Run` and public `Test` practice can work locally/offline without paid cloud credentials.

Preserve the existing Cloudflare Container CPython provider as an optional high-fidelity/trusted provider.

## BEFORE EDITING

1. Resolve the current branch SHA and compare it with the work-package baseline.
2. Read only:
   - `CURRENT_WORK_PACKET.json`
   - PYTHON04 active prompt
   - local-first provider decision
   - `subjects/programming/assets/python-product-integration.js`
   - `subjects/programming/assets/python-lab.js`
   - relevant manifest/service-worker/tests.
3. Reconfirm the existing Cloudflare provider is not being replaced/deleted.
4. Reproduce the current network-only behavior.

## REQUIRED ARCHITECTURE

Provider order:

`browser/WASM local practice → local desktop CPython contract → optional managed Cloudflare container`

For this work package implement only the **browser/WASM local-practice provider** and the minimum provider-neutral routing needed to use it.

### Browser provider requirements

- real Python runtime, not fake parsing/eval;
- self-hosted runtime assets or deterministic vendoring into repo/build artifacts;
- no mandatory public CDN at runtime;
- Web Worker isolation;
- exact runtime/provider identity;
- bounded execution time;
- bounded stdout/stderr;
- cancel terminates/recycles execution;
- deterministic normalized result envelope;
- honest capability/package support;
- unsupported capabilities fail explicitly;
- no hidden-test material in browser.

### Routing

`BAUMAN_PYTHON_PRODUCT.invoke` remains the single learner-facing facade.

- `runtime`: report selected local/browser provider when available, including exact profile/capability limits.
- `run`: browser provider for supported practice.
- `test`: browser provider for public tests only.
- `submit`: MUST NOT move hidden tests into browser. It remains trusted-provider-only and must fail/degrade truthfully when that provider is unavailable.
- `cancel`: must cancel current browser execution and preserve existing remote cancellation compatibility.

Offline state must no longer disable supported `Run`/`Test` merely because `navigator.onLine === false`.

## FORBIDDEN

Do not:

- change PYTHON01–PYTHON03 curriculum/assessment/mastery truth;
- create a second mastery/progress store;
- expose hidden test expected values;
- delete/disable Cloudflare provider implementation or its accepted tests;
- add Google Drive/Sheets/Apps Script to execution;
- require a paid/CDN runtime dependency;
- deploy Production;
- merge;
- claim LOCAL_STABLE or Python PASS.

## TESTS

At minimum add/run:

1. browser-provider contract/static test;
2. golden execution fixture;
3. equivalent alternate solution;
4. wrong solution;
5. timeout;
6. cancel;
7. output limit;
8. unsupported feature/package;
9. true offline Run/Public-Test journey using self-hosted/cached runtime;
10. existing Cloudflare P4 provider regressions;
11. updated P5 product contract/browser;
12. targeted P6 browser regression.

Do not weaken existing tests merely to pass.

## STOP CONDITIONS

Return `BLOCKED_BY_SCOPE` if a safe implementation requires:

- changing PYTHON01–PYTHON03 truth;
- browser-visible hidden tests;
- mandatory external CDN/paid runtime;
- unrelated platform redesign;
- destructive learner-state migration.

Otherwise continue until the exact implementation head is test-green for the scoped tests.

## OUTPUT

Return:

- RESULT
- EXACT SHA
- ROOT CAUSE
- CHANGED FILES
- IMPLEMENTATION
- TESTS RUN
- TEST RESULTS
- OFFLINE EVIDENCE
- SECURITY/CAPABILITY LIMITATIONS
- REMAINING RISKS
- SCOPE CHECK
- HANDOFF TO CHAT

Do not merge or deploy.
