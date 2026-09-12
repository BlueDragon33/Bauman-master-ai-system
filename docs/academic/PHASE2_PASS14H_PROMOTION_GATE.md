# Phase 2 · Pass 14H — Promotion Gate

Status: `PROMOTION_GATE_RUNNING`

Branch: `phase2/pass14h-promotion-gate`

## Purpose

Pass14H is a release/promotion boundary, not a new learning feature. It verifies that the Phase2 candidate contains only the intended academic architecture changes, remains current with `main`, preserves production/runtime boundaries, and can pass the complete Phase2 browser regression chain before any merge decision.

The candidate remains `CANDIDATE_ONLY`. This pass does not authorize a merge to `main` and does not authorize any production deployment.

## Locked promotion boundaries

- no automatic merge;
- no automatic deployment;
- no production Worker or production D1 mutation;
- no change to `index.html`, `assets/js/main.js`, `assets/js/data.js`, runtime-config or device-access gate;
- no change under `control-service/`, migration or Wrangler production configuration paths;
- existing Cloudflare preview deployment remains explicit `workflow_dispatch` and still requires the `DEPLOY_PREVIEW` confirmation token;
- Phase2 continues to load additively through the previously validated academic bootstrap rather than replacing the legacy Hub shell.

## Promotion manifest

`assets/data/phase2-promotion-manifest-2026.json` records the exact allowlist of paths permitted to differ from `main`, the validated Pass14G code head/run/artifact, and the no-merge/no-deploy decision state.

## Promotion validator

`scripts/validate-phase2-promotion-14h.js` compares the candidate against current `origin/main`, rejects any unapproved path, rejects deletion of existing main files, rejects production/deployment boundary changes, verifies that current main is still an ancestor of the candidate, and reruns the critical semantic safety assertions.

## CI gate

`.github/workflows/academic-2026-phase2-promotion-gate.yml` performs:

1. full-history checkout and current-main fetch;
2. all Phase2 static validators from course architecture through Pass14G;
3. Pass14H exact diff/production-boundary validation;
4. syntax validation of all promoted runtimes and browser tests;
5. Browser regression chain 14B → 14C → 14D → 14E → 14F → 14G;
6. promotion evidence artifact generation.

No deploy credentials are consumed by this workflow and no deploy command exists in it.

## Current state

The final CI result, artifact, candidate SHA and promotion decision will be written here only after the promotion workflow completes successfully.
