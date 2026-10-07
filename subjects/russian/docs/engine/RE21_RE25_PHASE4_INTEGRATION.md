# Russian Engine Phase 4 — Integration Hub

State: VALIDATING

## RE21
Integration transaction hub composes RE17 + RE18 without becoming mastery/planner authority.

## RE22
Durable outbox provides idempotent enqueue, retryable delivery and delivered-history retention.

## RE23
Pack resolver requires one explicit active revision and rejects incompatible Engine API versions.

## RE24
Compatibility dry-run is read-only.

Against the current app contract it should identify:
- assessment owner available;
- planner owner available;
- speech owners available;
- Engine bootstrap available;
- planner candidate-source seam missing.

## RE25 boundary

No outside-Engine write occurs yet.

The expected minimum cross-boundary allowlist is:
1. subjects/russian/assets/adaptive-planner.js — add an explicit Engine candidate-source seam, not manualOverride;
2. subjects/russian/sw.js — precache newly browser-loaded integration modules if/when the hub is connected for true offline parity.

Additional outside files are forbidden unless fresh evidence proves they are necessary.

Rollout remains OPT_IN_FLAG.
