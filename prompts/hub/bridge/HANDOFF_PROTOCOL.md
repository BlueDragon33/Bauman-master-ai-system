# CHAT ↔ CODEX HANDOFF PROTOCOL — BAUMAN HUB

The normal Chat plane and Codex plane are two connected roles over the **same Hub project**.

## Chat plane
- understand user intent;
- make Hub product/architecture/UX decisions;
- write a precise work packet;
- define acceptance criteria and forbidden scope;
- review Codex result;
- update shared decision/state.

## Codex plane
- consume exactly one approved Hub work packet;
- reconcile current HEAD/state;
- implement only Hub-owned code/contracts;
- run targeted tests then regression;
- never cross into subject-app internals;
- return exact evidence, changed paths, SHAs, tests, blockers and next action.

## Bridge files
- `CURRENT_WORK_PACKET.json`: Chat → Codex
- `CURRENT_EXECUTION_RESULT.json`: Codex → Chat
- `HUB_SHARED_STATE.json`: durable shared state

## State machine
`DRAFT → READY_FOR_CODEX → IN_CODEX → CODEX_DONE → CHAT_REVIEW → ACCEPTED | REVISE | BLOCKED`

Codex rejects a packet if it asks to edit subject-app internals, lacks testable acceptance criteria, requires an unavailable external capability, or requires release authority that is not present.

Chat does not rewrite Codex evidence. It may accept, request revision, or create a follow-up packet.
