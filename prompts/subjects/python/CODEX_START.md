# PYTHON04 CODEX START — GOVERNED 5–10% DEEP ESCALATION

Repository: `BlueDragon33/Bauman-master-ai-system`

Baseline exact SHA:

`3632928b3915bdc38504dd072c10dba5881d94ea`

Primary work packet:

`prompts/subjects/python/CURRENT_WORK_PACKET.json`

Active owner:

`prompts/subjects/python/PYTHON04_RUNTIME_TOOLCHAIN_DATA_AI_INTELLIGENCE.md`

Canonical local-first decision:

`prompts/subjects/python/evidence/PYTHON04_LOCAL_FIRST_PROVIDER_DECISION.md`

## ROLE

You are a narrowly scoped deep runtime specialist.

Chat Orchestrator remains project owner and owns:
- architecture decisions;
- state;
- CI review;
- merge;
- release;
- LOCAL_STABLE decision;
- Algorithms sequencing.

Your work is capped to the `codexEscalation` object inside `CURRENT_WORK_PACKET.json`.

Do not broaden scope.

## WHY CODEX IS ALLOWED HERE

Chat already proved the deep blocker:
- current learner facade is network-only;
- Run/Test/Submit are disabled offline;
- Programming has no service-worker runtime owner;
- no self-hosted browser/WASM Python runtime is present;
- satisfying LOCAL_STABLE requires worker lifecycle, runtime asset vendoring/cache, cancellation, timeout/output limits and cross-layer browser regression.

This is the specific 5–10% deep integration exception.

## GOAL

Implement the smallest real self-hosted browser/WASM Python provider behind `BAUMAN_PYTHON_PRODUCT.invoke` so supported learner:
- Run
- public Test

can work locally/offline without paid credentials.

Preserve the existing Cloudflare Container CPython provider as optional high-fidelity/trusted execution.

## REQUIRED ARCHITECTURE

Provider priority:

`browser/WASM local practice → local desktop CPython contract → optional managed Cloudflare container`

Implement only the first provider plus the minimum routing/UI/offline changes needed to use it.

### Browser runtime requirements

- real Python runtime, not fake parser/eval;
- self-hosted or deterministically vendored runtime assets;
- no mandatory public CDN at runtime;
- isolated Web Worker or equivalent worker boundary;
- exact runtime/provider identity;
- timeout;
- cancel by worker termination/recycle or equally strong proof;
- bounded stdout/stderr;
- deterministic normalized result envelope;
- explicit unsupported package/capability failure;
- no hidden-test data in the browser.

### Routing rules

`BAUMAN_PYTHON_PRODUCT.invoke` remains the only learner-facing capability facade.

- `runtime`: report exact active local/browser runtime identity and capability limits.
- `run`: browser provider when supported.
- `test`: browser provider for public tests only.
- `submit`: MUST remain trusted-provider-only; hidden tests never move browser-side.
- `cancel`: cancel current browser execution while preserving existing remote cancellation compatibility.

Offline must no longer disable supported Run/Test solely because `navigator.onLine === false`.

## ALLOWED FILES

Only files listed in `codexEscalation.allowedFiles`.

## FORBIDDEN

Do not:
- modify PYTHON01–PYTHON03 curriculum/assessment/mastery truth;
- create a second learner-state/mastery store;
- expose hidden tests/expected values;
- delete or weaken Cloudflare provider/evidence;
- use Google Drive/Sheets/Apps Script as Python execution;
- add mandatory paid/CDN runtime;
- deploy Production;
- merge;
- mark LOCAL_STABLE;
- unblock Algorithms;
- rewrite unrelated platform architecture.

## TESTS

At minimum satisfy every entry in `codexEscalation.requiredTests`:
- provider contract/static;
- canonical/equivalent/wrong execution fixtures;
- timeout;
- cancel;
- output limit;
- unsupported capability/package;
- true offline Run + public Test;
- existing Cloudflare provider regressions;
- updated P5 contract/browser;
- targeted P6 browser.

Do not weaken existing tests merely to obtain green CI.

## STOP CONDITIONS

Return `BLOCKED_BY_SCOPE` if implementation requires:
- PYTHON01–PYTHON03 truth changes;
- browser-visible hidden tests;
- mandatory public CDN or paid runtime;
- destructive learner-state migration;
- unrelated platform redesign.

Otherwise continue until the exact implementation head is green for the scoped tests.

## OUTPUT CONTRACT

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
