# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `TURN22_GREEN_TURN23_ACTIVE`

Date: 2026-09-19
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Foundation base: content-resolution implementation through Step 14 is preserved from the accepted Foundation branch.
Russian accepted head: `b5acb6b5b604fcdd87920371b1d651c3415ccaea`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Architecture principles and ownership are defined in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

## Accepted Russian turns

Turns 1–22 are green.

Turn 21 introduced one additive weakness-repair layer across exam, listening, speaking, Cyrillic, dictation, multimodal review and skill-gate signals. Repair lifecycle is `detected → opened → attempted → repair_evidence_present → resolved`; opening never equals completion, and the router only persists to `bauman_russian_weakness_repair_v1`.

Turn 22 made offline readiness truthful: the current entry page resolves to a 62-entry app shell, all 17 required learning-data sources are part of readiness, stale local counters cannot produce a false ready state, external media is explicitly network-only when applicable, and failed visual assets become `missing_visual_asset` without translation fallback.

## Current turn

Turn 23 — Browser/package/accessibility/performance QA.

Turn 23 must execute substeps 23.1–23.7 from the canonical plan. It must close deferred obligation `RUS-CURSIVE-VISUAL-001` before Turn 24 can begin.

## Protected authority

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- existing Russian learner-state authority;
- saved progress/state;
- Hub and Device Access boundaries;
- Foundation registry authority;
- Academic scheduler authority;
- Turn 18 SRS/Review Queue authority boundaries;
- Turn 19 advisory skill-gate semantics;
- Turn 20 AI direct-semantic/read-only policy;
- Turn 21 additive repair-store-only authority;
- Turn 22 truthful offline readiness and explicit missing-resource behavior.

## Branch policy

Do not merge to `main` without an explicit promotion decision.
