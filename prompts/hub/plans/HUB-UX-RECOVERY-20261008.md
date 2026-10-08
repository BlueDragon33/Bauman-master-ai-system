# Bauman Hub · Architecture and UX Recovery (2026-10-08)

Status: EXECUTION PLAN — not a release receipt, not a new Constitution, not a new active packet.
Authority: `prompts/hub/HUB_MASTER_PROMPT.md` and C1–C4, Constitution 1.2.
Baseline: `main@c4a1467bfa3db28df8ac5dcc55ca40b0046aca2e`.
Release target: LOCAL_STABLE only until actual human/browser acceptance and separate production gate.

## Product intent

Build toward a **100-level modular architecture**, NOT 100 concurrent runtime layers, CSS overrides, dashboards, or feature panels. Keep a calm premium visual language with clear hierarchy. Teaching and learning content comes first; decoration supports it, never competes with it.

## Forensic baseline, not performance measurements

Static HTML declarations on baseline:
| Entry | CSS | Script tags |
|---|---:|---:|
| Hub / | 21 | 24 |
| Math | 24 | 44 |
| Russian | 12 | 33 |
| Programming | 3 | 5 |

These are static counts, not requests, transferred bytes, TTI, LCP, CPU cost, memory, or proof that each asset is redundant. Measure real browser runs before stating performance improvements.

- Subjects reference had 21 shadowed function names, sample teacher/progress/deadline fixtures and a second canonical runtime appended below the legacy renderer.
- Main Hub uses multiple presentation wrappers around `app.subjects` / `app.page`; code ownership needs a dedicated follow-up refactor, not another wrapper.
- PR #295 remains open/blocked and overlaps the Subjects module. Do not overwrite or merge it by force.
- Preserve existing storage r5 migration, scoped profile data, schedules, notes, subject IDs, capability contracts, learning evidence, and release authorities.

## Non-negotiable rules

1. **Single owner:** one route owner and one renderer per view. No new monkey-patches that wrap `app.page`, `app.subjects` or DOM observers just for cosmetics.
2. **Replace, do not layer:** a new UI generation must retire or migrate the prior generation in the same governed change. No V7 on top of V6 to repair V6.
3. **One learner decision per view:** home shows next useful action; Subjects defaults to subject selection/continue. Detailed progress, notes, AI, schedule and diagnostics are progressively disclosed, not all visually dominant at once.
4. **No fake learner truth:** mock cards, fixed instructor names, fake deadlines or default mastery values cannot appear as current learner data. Preserve CURRENT / STALE / UNAVAILABLE / LOCAL_HUB semantics.
5. **Data and safety first:** no destructive resets, no silent storage migration, no lost backups, no unauthorized subject-private reads or publication.
6. **Elegant but lightweight:** shared tokens and components; accessible contrast/keyboard semantics; avoid needless animation, duplicated icons, advertising-style KPI walls, and new always-on dependencies.
7. **Measured gates:** record real browser CPU, request/byte counts, main-thread work, LCP/CLS/INP where measurable, critical flows, accessibility, offline behavior; compare against exact pre-change SHA, device and network. Static resource counts are warning signals only.
8. **Fail closed on regressions:** green compile/static CI alone is not learner UX acceptance. Preserve rollback, exact SHA, screenshots and functional evidence.

## Ordered execution (small independent changes)

### R0 — Remove dead reference code (this branch)
- Remove the shadowed Subjects visual/demo runtime, keep only the canonical truth-aware implementation.
- Retain historical demo-note IDs solely to discard legacy demo records on read.
- Add CI regression preventing duplicate function declarations or reincarnated fake UI content.
- Do not claim speed improvement until browser benchmarks.
- Merge only with passing applicable tests and reconciliation of the overlap with PR #295.

### R1 — Remove competing render ownership
- After #295 resolves, make the Subjects page one render owner with explicit route/launch API.
- Retire presentation patch wrappers only after side-by-side behavioral equivalence and rollback proof.
- Preserve five existing routes and all Subject bridge contracts.

### R2 — Reduce cognitive load
- Learner-first default: subject title, actual learning state, one primary action.
- Reveal suggestions, calendar, heatmap, detailed stats and notes on request in secondary views.
- No loss of feature access; desktop/mobile and keyboard acceptance tests.

### R3 — Consolidate CSS and scripts with evidence
- Audit the 21/24 Hub, 24/44 Math and 12/33 Russian static loads.
- Remove only proven redundant styles/assets; never blindly rename or remove cache URLs.
- Use shared tokens and owner-level modules, modern loading patterns only after dependency-order assessment.

### R4 — Subject-by-subject hardening
- Math first, Russian second, then other Subjects.
- Retain canonical curriculum, assessment/mastery and offline content.
- Browser real-device smoke, restore/export, service-worker update and rollback gate before any publish.

## Current safety hold
`codex/hub-subject-integration-20261007` (PR #295) is a separate blocked workstream. Do not silently make this cleanup its continuation or declare its acceptance. No automatic main merge or production publish based only on this plan.
