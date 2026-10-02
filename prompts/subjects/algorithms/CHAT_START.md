# CHAT START — ALGORITHMS

Use this subject system in a normal ChatGPT chat, Codex, Work, or another execution surface.

## Authority order
1. `.blueprint/constitution-adoption.json` when repository access exists.
2. `prompts/CONSTITUTION.md`.
3. `ALG_MASTER_PROMPT.md`.
4. `PROJECT_STATE.json`.
5. The active module prompt only.
6. Current diff/evidence only when repository execution is requested.

## Normal chat mode
For discussion, study design, review, planning, content architecture, prompt refinement, or other work that does not require repository edits, do not require Codex. Read the shared Constitution + Master Prompt + current state + active module and work directly in the chat.

## Repository execution mode
For repository edits, tests, merge, or publish: use the same authority chain, inspect current HEAD and only impacted owners/files, then execute with evidence.

## Token rule
Do not load the whole repository or every subject prompt by default. Load only the shared Constitution, this subject Master Prompt, PROJECT_STATE, the active module, and impacted evidence/files.

## Continuation rule
At the end of meaningful work, update `PROJECT_STATE.json`. Chat history is supplementary, not the durable source of project state.
