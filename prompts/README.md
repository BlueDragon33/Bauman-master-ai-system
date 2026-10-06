# BAUMAN PROMPT CONTROL CENTER

This directory is the canonical home for durable prompts used to operate
`BlueDragon33/Bauman-master-ai-system`.

## One constitution, specialized prompts

All project/subject prompts inherit the same authority chain:

1. repository-enforced Blueprint OS adoption: `.blueprint/constitution-adoption.json`;
2. this prompt Constitution: `prompts/CONSTITUTION.md`;
3. shared dependency policy when infrastructure/provider decisions are involved: `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md`;
4. the domain/subject Master Prompt;
5. module/work-package prompt;
6. evidence and current state.

A lower layer may specialize its domain. It may not contradict a higher layer.

## Stable rule

**ONE PROJECT · ONE SHARED CONSTITUTION · ONE MASTER PROMPT PER DOMAIN/SUBJECT · CONTINUOUS EVOLUTION**

Do not create:
- prompt-final.md
- prompt-final2.md
- prompt-v2.md
- prompt-new.md

When a Master Prompt evolves, patch the stable file and preserve a changelog/migration note.

## Token-efficient continuation

For a new ordinary ChatGPT chat, ChatGPT Work session, or Codex session, load only:

1. `prompts/CHAT_ENTRY.md`;
2. `prompts/CONSTITUTION.md`;
3. `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md` when provider/storage/runtime/sync decisions are involved;
4. `prompts/PROMPT_REGISTRY.json`;
5. the active subject `README.md` + Master Prompt;
6. that subject's `PROJECT_STATE.json`;
7. only the C1–C4 clauses named by its router;
8. repository diff/tests/evidence only when repository execution is actually requested.

Do not rescan the entire repository unless the state, SHA, owner map, or architecture is stale/invalid.

## Source code vs prompts

- `subjects/<subject>/` = product/runtime/content implementation.
- `prompts/subjects/<subject>/` = durable instructions/governance for that subject.
- Prompts must not be mixed into runtime content.

## Channel-neutral use

The prompt tree is not Codex-only.

- **Ordinary ChatGPT chat:** planning, review, explanation, drafting, comparison, prompt evolution and handoff.
- **ChatGPT Work:** larger multi-step workflows across files/apps.
- **Codex:** repository implementation, tests and engineering execution.

All three modes use the same Constitution, Master Prompt, router and PROJECT_STATE. A chat must not claim repository execution unless tools actually performed it.

## Current normalized subjects

- Russian — RU00–RU08 canonical active prompt system.
- Math — MATH00–MATH06 canonical active prompt system.
- Python — PYTHON00–PYTHON06 canonical active prompt system.
- Algorithms & Data Structures — ALG00–ALG06 canonical active prompt system.
- Curriculum 2026 — canonical shell-building prompt system.

Original/backup ZIP packages remain under `prompt-archives/` for provenance and recovery. They are not simultaneous execution authority.


## Infrastructure default

The repo-wide default is **LOCAL-FIRST · OFFLINE-FIRST · FREE-FIRST · PORTABLE · OPTIONAL CLOUD**. Managed services are adapters, not canonical truth. Google Drive/Sheets/Apps Script may be used as optional user-owned sync/backup bridges. Recurring paid infrastructure requires explicit user approval and a documented local/free alternative analysis.

## Work allocation

Default engineering split is **Chat 90–95% / Codex 5–10% maximum**. Chat owns orchestration, audit, prompt/state, GitHub/CI, small/medium implementation and release reasoning. Codex is reserved for deep runtime/refactor/migration/E2E work packages.


## Prompt Control Center validation

Any change under `prompts/**` must keep Registry, mode entries, state, active packet and execution result consistent. Run:

`node scripts/validate-prompt-control-center.mjs`

The same check is enforced by `.github/workflows/prompt-control-center-ci.yml`.
