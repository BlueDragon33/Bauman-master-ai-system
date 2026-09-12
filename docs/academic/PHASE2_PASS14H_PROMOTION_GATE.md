# Phase 2 · Pass 14H — Promotion Gate

Status: `PHASE2_PROMOTION_CANDIDATE_VALIDATED_BROWSER_PASS`

Branch: `phase2/pass14h-promotion-gate`

## Purpose

Pass14H is a release/promotion boundary, not a new learning feature. It verifies that the Phase2 candidate contains only the intended academic architecture changes, remains current with `main`, preserves production/runtime boundaries, and passes the complete Phase2 browser regression chain before any merge decision.

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

At the validated Pass14H code head the exact diff against `main` contains 45 approved paths. No unapproved path is present, no existing main file is deleted, and the candidate is `behind_by: 0`.

## Promotion validator

`scripts/validate-phase2-promotion-14h.js` compares the candidate against current `origin/main`, rejects any unapproved path, rejects deletion of existing main files, rejects production/deployment boundary changes, verifies that current main is still an ancestor of the candidate, and reruns the critical semantic safety assertions.

The first promotion attempt correctly stopped at the new Pass14H validator because two assertions were written against property names that the already-validated runtimes do not expose. No production runtime defect was found. The assertions were corrected to test the real contracts already enforced by Pass14G: transcript eligibility requires a complete verified ledger, and Event Readiness cannot write official results or fabricate course completion.

## CI gate

`.github/workflows/academic-2026-phase2-promotion-gate.yml` performs:

1. full-history checkout and current-main fetch;
2. all Phase2 static validators from course architecture through Pass14G;
3. Pass14H exact diff/production-boundary validation;
4. syntax validation of all promoted runtimes and browser tests;
5. Browser regression chain 14B → 14C → 14D → 14E → 14F → 14G;
6. promotion evidence artifact generation.

No deploy credentials are consumed by this workflow and no deploy command exists in it.

## Validated promotion run

Run: `34684624878`

Validated candidate code head: `71afd24327115b83fb80135935f0d19b94b91adb`

Results:

- existing Phase2 static validators: PASS;
- Pass14H exact allowlist / production-boundary validator: PASS;
- promoted runtime/browser syntax checks: PASS;
- Browser 14B regression: PASS;
- Browser 14C regression: PASS;
- Browser 14D regression: PASS;
- Browser 14E regression: PASS;
- Browser 14F regression: PASS;
- Browser 14G final integration regression: PASS;
- promotion workflow conclusion: `success`.

Promotion evidence artifact:

- name: `academic-phase2-promotion-34684624878`
- artifact ID: `10295132376`
- SHA-256: `77284c5a7ac5224f883e01c85cfe4ec6c90a14629fb9b63d282ba1f12f181b70`
- retention: 14 days from the run.

## Branch integrity

At validated code head `71afd24327115b83fb80135935f0d19b94b91adb`:

- relative to `main`: ahead 80 commits, behind 0;
- exact changed-path allowlist: 45/45 matched;
- `main` is still an ancestor of the candidate;
- production/deploy/control-service boundaries are untouched.

This documentation closeout commit is docs-only. The promotion workflow is intentionally configured to rerun on every candidate push, so the docs-only head is revalidated automatically without changing the Phase2 runtime surface.

## Promotion decision

Phase2 is technically qualified as a promotion candidate. It is **not merged** and **not deployed** by Pass14H.

Recommended final merge mode remains squash/controlled promotion so the long Phase2 working history does not have to become the permanent `main` history. A separate explicit merge decision is still required.

Final status: `PHASE2_PROMOTION_CANDIDATE_VALIDATED_BROWSER_PASS`
