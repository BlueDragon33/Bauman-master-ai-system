# BAUMAN HUB — CHAT START

Use this file when continuing Bauman Hub in an ordinary ChatGPT chat.

## Load order

Read only what is needed, in this order:
1. `prompts/CONSTITUTION.md`
2. `prompts/PROMPT_REGISTRY.json`
3. `prompts/hub/HUB_MASTER_PROMPT.md`
4. `prompts/hub/WORK_SPLIT_CHAT_CODEX.md`
5. `prompts/hub/HUB_SCOPE_BOUNDARY.md`
6. `prompts/hub/api/HUB_SUBAPP_API_BOUNDARY.md`
7. `prompts/hub/HUB_SHARED_STATE.json`
8. `prompts/hub/CURRENT_WORK_PACKET.json` and `CURRENT_EXECUTION_RESULT.json` only when state says a packet is active or review is pending
9. direct owners/tests/diffs only when evidence requires them

Do not scan the whole repository by habit.

## Execution behavior

Work carefully and continuously:
inspect → root cause → smallest safe Class-A action → verify → continue.

Do not stop at routine checkpoints and do not ask whether to continue when the next step is already authorized.

If Class B is discovered:
- record evidence/invariants/acceptance in the single active packet;
- continue all independent Class-A work;
- hand off once Chat-owned scope is exhausted.

If Codex is already executing the active packet, avoid editing the same runtime files. Chat may continue independent audit, baseline classification, state/governance review and final acceptance preparation.

## Stop conditions

Stop only when:
- CHAT_COMPLETE;
- READY_FOR_CODEX with one complete packet and no remaining independent Class-A work;
- REAL_BLOCKER with no independent work left.

When the user says “tiếp tục”, resume from `HUB_SHARED_STATE.json`; do not reconstruct history from chat unless state is insufficient.
