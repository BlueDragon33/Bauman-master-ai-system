# Russian Prompt System — Full Re-audit 2026-10-01

State: **IN_PROGRESS — executable revalidation required**

Baseline: `main@248f7eb6e07b4f652b1a8963e68e671577bb2be4`.

Comparison with the previously released Russian RC `7697a3f05362c111fb481ebd6043738c12dbcb8c` shows current main is one commit ahead and that intervening commit changes only non-Russian subject manifests. Russian runtime/content is therefore the same tree that was released, but this audit does **not** inherit the earlier PASS blindly.

## Why the earlier PASS was too weak

1. RU05 scenario graphs were validated as JSON but `scenario-registry.json` was not consumed by the learner runtime.
2. RU08 acceptance matrix listed journeys/failures without executable evidence per row.
3. RU07 policy described dynamic-provider safety while the learner-facing mentor is currently deterministic local fallback; runtime truth and policy wording were misaligned.
4. RU08 authoring lifecycle existed as contracts/CLI but `subjects/russian/editor.html` was only a placeholder and did not provide the structured authoring surface claimed by the manifest.
5. Active data still contained P-era owner labels after RU00 replaced P0–P17 as execution topology.
6. The archived P12 prompt contains important authoring responsibilities compressed out of RU08. The source-recovery rule requires recovering those responsibilities into RU08 rather than resurrecting P12.

## Recovered P12 responsibilities

Recovered as RU08 authoring responsibilities:
- no-code-first structured forms;
- roles/least privilege and no self-approval;
- immutable audit;
- revisions and reviewed diff;
- semantic diff and impact analysis before promotion;
- optimistic concurrency and fail-closed conflict handling;
- autosave/draft recovery;
- learner/mobile/offline preview expectations;
- staging-only import with schema detection, mapping report and round-trip checks;
- generated-candidate provenance/review boundary;
- PASS/FAIL/WARN/WAIVED validation semantics with waiver evidence;
- migration preview/dry-run.

Generic review metadata remains owned by the shared Control service. Russian schema/domain validation and authoring adapter remain subject-owned.

## Fixes on this branch

- RU05 scenario runtime consumes the canonical scenario registry, persists practice-only resume state, exposes branching/repair, and never writes mastery/SRS/planner.
- RU08 Russian editor is a structured form by default, autosaves a local candidate draft, supports staging-only import, preview, candidate export, metadata-only review-envelope export, and no remote canonical write.
- RU03/RU05/RU07 active metadata now points to RU owners; P references remain historical evidence only.
- RU07 policy now states the current learner-facing AI surface is deterministic local fallback until a provider adapter exists and passes executable security tests.
- RU08 acceptance matrix maps every learner/admin journey and every failure case to executable evidence.
- CI runs re-audit static gates plus browser tests for scenario, AI boundary and authoring on source and packaged runtimes.

## Invariants

No learner-state reset. No duplicate mastery/SRS/planner/audio authority. No direct candidate canonical write. No static-JSON-only acceptance claim. No production release until the exact re-audit RC passes required gates and the C3 release annex.
