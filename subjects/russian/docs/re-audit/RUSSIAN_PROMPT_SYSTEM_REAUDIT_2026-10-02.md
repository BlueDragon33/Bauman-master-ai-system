# Russian Prompt System — Full Re-Audit Correction Record (2026-10-02)

## Scope

Re-audit source: `RUSSIAN_PROMPT_SYSTEM(1).zip` and its router/master topology:

`RU00 → RU01 → RU02 → RU03/RU04 → RU05 → RU06 → RU07 → RU08 → C3 Release Annex`.

This correction pass does not accept a phase record or CI label as sufficient evidence by itself. Runtime ownership, learner/admin journeys, fail-closed behavior, offline behavior, and browser acceptance are required where the prompt requires them.

## Confirmed gaps found after the previous production release

1. **RU03 — linguistic authority was not enforced by learner runtime.**
   - `provenance.json` declared `FAIL_CLOSED`, but runtime surfaces did not consume it.
   - Correction: `assets/linguistic-authority.js` exposes executable dataset/item authority guards. Unknown, UNVERIFIED, PARTIAL, and SOURCE_ASSERTED content cannot be promoted to authoritative use.

2. **RU05 — scenario registry existed as data but was not the runtime scenario engine.**
   - Existing validators checked graph shape but not execution/resume.
   - Correction: `assets/scenario-runtime.js` consumes `scenario-registry.json`, validates transitions, persists session state, supports repair paths, resumes after refresh, and emits practice-only non-authoritative evidence.

3. **RU06 — academic/technical/research datasets existed but were not consumed as a coherent production workflow.**
   - Correction: `assets/academic-production.js` loads technical concepts, academic functions, reading tasks, and performance tasks; adds source/claim lineage, authority labels, learner-owned drafts, and non-authoritative snapshots.

4. **RU07 — deterministic local templates were presented under an AI Mentor surface without a clear provider/fallback distinction.**
   - Correction: `ai-mentor-guard.js` now reports provider state. Without an actual provider, learner UI is explicitly labeled `Fallback cục bộ · không gọi model`.

5. **RU08 — authoring acceptance was contract-only; `editor.html` was a placeholder.**
   - Correction: structured Authoring Workbench implements staging candidate creation/import, canonical owner mapping, validation, preview, metadata-only review request, and export of a reviewed repository patch packet. Raw JSON is advanced-only. There is no direct browser canonical-publish control.

6. **Offline correction**
   - New runtime capabilities and the required small authority/scenario/production datasets are precached.
   - The data fetch branch can fall back to the shell cache, preventing a false precache that cannot actually serve offline.

## Anti-paper-PASS gates added

- `subjects/russian/scripts/validate-russian-prompt-reaudit.mjs`
- `tests/russian-prompt-reaudit-browser.mjs`

The browser gate verifies:
- RU03 fail-closed authority behavior,
- RU05 state-machine execution and refresh resume without mastery writes,
- RU06 runtime dataset consumption and non-authoritative production snapshots,
- RU07 truthful deterministic fallback labeling,
- RU08 structured authoring lifecycle and metadata-only review boundary.

It is run against source and packaged Russian runtimes in Whole System Integration CI.

## Release rule

This correction branch is **not** a release merely because these files exist. Revalidation requires all relevant static and browser gates to pass. Only then may phase records be amended with new evidence, the exact PR head merged, and C3 Release Annex preview/production be executed for the exact merged SHA.
