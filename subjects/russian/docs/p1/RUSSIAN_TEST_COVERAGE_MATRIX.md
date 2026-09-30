# Russian P1 Test Coverage Matrix

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Russian subject scripts
Count: **39**

- `subjects/russian/scripts/audit-academic-language.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-content-contract.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-handwriting-glyph-authority.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-handwriting-recognition.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-learning-data.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-learning-flow.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-promotion-candidate.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-runtime-offline.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-speaking-coach.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/audit-vocab-srs.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/handwriting-glyph-authority-policy.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/test-handwriting-glyph-authority-policy.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-academic-language.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-adaptive-next-step.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-ai-runtime.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-bridge.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-deeplink.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-planning.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-progression.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-route-receipt.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-capability-step-routing.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-evidence-bound-completion.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-handwriting-listen-write-contract.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-handwriting-listen-write-exercises.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-handwriting-progress-adaptive.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-handwriting-pronunciation.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-learning-flow.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-listen-write-expansion.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-listen-write-factory.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-listening-visual-first.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-promotion-candidate.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-readiness-navigator.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-reference-ui.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-review-planning.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-speaking-coach.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-stage-progression-evidence.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-stage-readiness.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-stage-transition-handoff.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.
- `subjects/russian/scripts/validate-vocab-srs.mjs` — static/domain/audit candidate; exact proof classified after CI log inspection.

## Repository Russian browser tests
Count: **9**

- `tests/russian-capability-continue-browser.mjs`
- `tests/russian-capability-deeplink-browser.mjs`
- `tests/russian-capability-hub-browser.mjs`
- `tests/russian-capability-route-receipt-browser.mjs`
- `tests/russian-future-ui-browser.mjs`
- `tests/russian-handwriting-listen-write-browser.mjs`
- `tests/russian-handwriting-offline-authority-browser.mjs`
- `tests/russian-handwriting-recognition-browser.mjs`
- `tests/russian-offline-shell-browser.mjs`

## Critical P1 finding
Before this P1 branch, `.github/workflows/system-integration-ci.yml` contained the Russian Playwright/browser acceptance suite but its pull-request path filter did **not** include `subjects/russian/**`. Russian-only changes therefore did not automatically trigger the full browser-system acceptance workflow.

P1 audit tooling commit on this branch adds:
- `subjects/russian/**`
- `subjects/shared/**`
- `foundation/domain-model/**`

to the workflow trigger. No production runtime code is changed.

## Classification
- `russian-ui-reference-gate.yml`: useful static/domain gate for Russian changes.
- `system-integration-ci.yml`: browser/package acceptance, now wired to Russian changes on this audit branch.
- Final TRUSTED/USEFUL/WEAK/STALE/MISLEADING classification remains `VALIDATING` until the PR workflow results are inspected.
