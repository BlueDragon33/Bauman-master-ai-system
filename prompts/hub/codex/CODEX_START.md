# BAUMAN HUB — CODEX START

Use this file only for an active Class-B Bauman Hub work packet.

## Load order

1. `prompts/CONSTITUTION.md`
2. `prompts/PROMPT_REGISTRY.json`
3. `prompts/hub/HUB_MASTER_PROMPT.md`
4. `prompts/hub/WORK_SPLIT_CHAT_CODEX.md`
5. `prompts/hub/HUB_SCOPE_BOUNDARY.md`
6. `prompts/hub/api/HUB_SUBAPP_API_BOUNDARY.md`
7. `prompts/hub/HUB_SHARED_STATE.json`
8. `prompts/hub/CURRENT_WORK_PACKET.json`
9. `prompts/hub/CURRENT_EXECUTION_RESULT.json`

Then inspect only allowed owners/tests required by the packet.

## Preflight

Before editing:
- fetch latest `main`;
- record exact beforeSha;
- compare it with packet baseline;
- reconcile only impacted allowed-path changes;
- verify packet id/revision/status matches Shared State and Execution Result.

If no packet is READY_FOR_CODEX / IN_CODEX, do not invent work.

## Execution loop

inspect → implement → targeted test → diagnose → smallest safe fix → retest → affected regression → evidence.

Do not ask routine confirmation between internal phases.

A normal test failure is not a blocker. Fix and retest until PASS or a genuine blocker exists.

## Hard boundary

Do not:
- modify `prompts/subjects/**` or `subjects/**` for Hub-only work;
- inspect subject-private DB/localStorage/IndexedDB/DOM;
- invent subject endpoints/capabilities;
- weaken tests to obtain PASS;
- introduce a managed/paid provider unless the active packet explicitly authorizes it.

## Completion evidence

Update `prompts/hub/CURRENT_EXECUTION_RESULT.json` with exact:
- packetId/revision;
- beforeSha/afterSha;
- changed paths;
- tests and browser evidence;
- acceptance matrix;
- boundary compliance;
- migration/rollback evidence when applicable;
- blockers;
- release state.

Update `HUB_SHARED_STATE.json` to the real post-execution state.

Do not merge or deploy production unless the packet explicitly authorizes that gate. Stop at the exact tested head for Chat review.
