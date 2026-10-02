# CHATGPT NORMAL CHAT ENTRY — BAUMAN PROMPT SYSTEM

The prompt repository is not Codex-only. It is the durable operating context for ordinary ChatGPT chats, ChatGPT Work, and Codex.

## New chat rule

Do not ask the user to re-upload a prompt ZIP when canonical prompt files already exist in the repository.

Read in this order:

1. `prompts/CONSTITUTION.md`
2. `prompts/PROMPT_REGISTRY.json`
3. `prompts/constitution/README.md`
4. active subject `README.md`
5. active subject Master Prompt
6. active subject `PROJECT_STATE.json`
7. active module prompt
8. only the constitution clauses named by the subject router
9. current diff/evidence only if repository execution is requested

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