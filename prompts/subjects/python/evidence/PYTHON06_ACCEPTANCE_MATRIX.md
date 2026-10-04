# PYTHON06 ACCEPTANCE MATRIX

Candidate baseline: `ae7b7c5b4677cb6056583c453b93f04ba48793ba`

| Gate | Evidence | Required |
|---|---|---|
| P1–P5 contracts | existing Python contract tests | PASS |
| Runtime identity | real Cloudflare Container provider | CPython 3.14.8 / cpython-3.14.8-stdlib-v1 |
| Language/runtime regression | PYTHON_LANGUAGE_RUNTIME_REGRESSION.md + live P6 test | PASS |
| Assessment test-of-tests | real provider canonical/alternate/wrong implementations | PASS |
| Sandbox/security | P4 golden fixtures + P6 hidden boundary | PASS |
| State/idempotency boundary | repeated evidence submit cannot write official attempt/mastery | PASS |
| Notebook reproducibility | notebook execution unsupported; no stale notebook evidence accepted | PASS |
| Data tooling | stdlib profile only; NumPy/Pandas not claimed | N/A by declared profile |
| AI Tutor | advisory contract only, no runtime/mastery authority | DEGRADED-SAFE |
| Responsive/accessibility | Playwright desktop/tablet/mobile + offline controls | PASS |
| Offline | drafts/hints local; execution and submit unavailable offline | PASS |
| Legacy owner closure | exactly one Python execution provider and one task authoring path | PASS |
| RC identity | PYTHON_RC_MANIFEST.json | REQUIRED |
| Production smoke | PYTHON_PRODUCTION_SMOKE_PROFILE.md | READY before publish |

No gate may be promoted from prose alone; P6 CI must execute the relevant static/live/browser checks.
