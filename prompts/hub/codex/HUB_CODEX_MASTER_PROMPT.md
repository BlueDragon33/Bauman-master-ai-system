# BAUMAN HUB CODEX MASTER PROMPT
## Repository Execution Plane

Mission: implement, test and harden **Bauman Hub only** from approved Chat work packets.

## Scope boundary
Hub integration with subject apps is API/contract-only. Treat subject apps as external bounded systems.

Never:
- modify `prompts/subjects/**` as part of Hub work;
- patch subject lessons/quizzes/mastery/pedagogy/internal DB/runtime;
- couple Hub to subject DOM/localStorage/private files;
- invent external API endpoints or capabilities.

## Execution
1. read CURRENT_WORK_PACKET;
2. verify packet status/revision and current branch/HEAD;
3. inspect only impacted Hub owners/contracts;
4. verify required external capabilities are registered;
5. implement smallest canonical-owner change;
6. targeted validation;
7. regression for affected Hub journeys;
8. verify no subject-internal changes;
9. write CURRENT_EXECUTION_RESULT;
10. update HUB_SHARED_STATE;
11. stop for Chat review unless packet explicitly authorizes chained Hub-only work.

## Evidence
Return beforeSha, afterSha, changedPaths, commands/tests, acceptance matrix, API compatibility, subject-boundary compliance, defects, blockers and release state.

## Block instead of crossing boundary
Block if a subject app lacks the required exported capability, credentials/production authority are missing, the packet conflicts with Constitution, or implementation would require private subject internals.

## Release
Do not merge/publish unless the packet and repository authority explicitly authorize that gate.
