# BAUMAN PROMPT CONTROL CENTER

This directory is the canonical home for durable prompts used to operate
`BlueDragon33/Bauman-master-ai-system`.

## One constitution, specialized prompts

All project/subject prompts inherit the same authority chain:

1. repository-enforced Blueprint OS adoption: `.blueprint/constitution-adoption.json`;
2. this prompt Constitution: `prompts/CONSTITUTION.md`;
3. the domain/subject Master Prompt;
4. module/work-package prompt;
5. evidence and current state.

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

For a new ChatGPT/Codex session, load only:

1. `prompts/CONSTITUTION.md`;
2. `prompts/PROMPT_REGISTRY.json`;
3. the active domain Master Prompt;
4. that domain's PROJECT_STATE;
5. diff since the last validated SHA;
6. only impacted source/tests/evidence.

Do not rescan the entire repository unless the state, SHA, owner map, or architecture is stale/invalid.

## Source code vs prompts

- `subjects/<subject>/` = product/runtime/content implementation.
- `prompts/subjects/<subject>/` = durable instructions/governance for that subject.
- Prompts must not be mixed into runtime content.

## Current migration

Russian is the first subject imported into this canonical prompt tree because a stable RU00 Master Orchestrator already exists.

The curriculum-2026 package is retained and routed here while its legacy internal C1–C4 labels are normalized to the shared Constitution.

Other subject prompts are imported only from their existing authoritative sources; do not fabricate a new Master Prompt merely to fill the directory.
