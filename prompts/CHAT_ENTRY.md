# CHATGPT NORMAL CHAT ENTRY — BAUMAN PROMPT SYSTEM

The prompt repository is not Codex-only. It is the durable operating context for ordinary ChatGPT chats, ChatGPT Work, and Codex.

## New chat rule

Do not ask the user to re-upload a prompt ZIP when canonical prompt files already exist in the repository.

Read in this order:

1. `prompts/CONSTITUTION.md`
2. `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md` when infrastructure/storage/sync/runtime/provider choices are involved
3. `prompts/PROMPT_REGISTRY.json`
4. `prompts/constitution/README.md`
5. active domain/subject `README.md` when registered
6. active domain/subject Master Prompt
7. mode-specific `chatStart` / `codexStart` from `PROMPT_REGISTRY.json` when present
8. active domain/subject state
9. active module/work packet only when state requires it
10. only routed Constitution clauses and current diff/evidence required by the task

## Modes

### Ordinary Chat
Use for planning, reviewing, explaining, drafting, comparing, prompt evolution and state handoff. Do not claim code/repo execution unless tools actually performed it.

### Work
Use for larger multi-step research/file/app workflows. The same Constitution and subject state remain authoritative.

### Codex
Use for repository implementation/testing. The same Constitution and subject state remain authoritative.

No mode is allowed to create a second Constitution or a competing Master Prompt.

## Token rule

Never load every subject and every Constitution file by default. Load the active subject + routed clauses + current state first; broaden only when evidence requires it.

## Global operating defaults

- Chat owns 90–95% of work; Codex is limited to the deepest 5–10% after Chat narrows the work package.
- Prefer local/browser/offline/free/portable providers before managed cloud.
- Treat Google Drive/Sheets/Apps Script as optional sync/backup bridges, not mandatory canonical runtime.
- Prefer exact CLI commands over manual GitHub UI actions when practical.


## Domain mode entry

When a registry domain defines `chatStart` or `codexStart`, use that mode entry instead of asking the user to paste a long operating prompt. The mode entry must delegate to the single registered Master Prompt and current state; it is not a second Master Prompt.
