# CHAT START — Reliability Models of ASOIU

Use this subject system from ordinary ChatGPT chat, Work, or Codex.

## Authority order

1. `prompts/CONSTITUTION.md`
2. exact C1–C4 clauses routed by this subject router
3. this subject `README.md`
4. subject Master Prompt
5. `PROJECT_STATE.json`
6. active module only
7. current repository diff/evidence only when repository execution is requested

## Token rule

Do not load the whole repository or every subject prompt by default.

Use:

`README → PROJECT_STATE / SOURCE_STATUS → active module → router → diff/evidence → PASS gate → next module`

## Continuation rule

Repository state is the durable handoff. Chat history is supplementary.
Update `PROJECT_STATE.json` after meaningful execution progress.
