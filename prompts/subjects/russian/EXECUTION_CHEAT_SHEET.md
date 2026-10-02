# EXECUTION CHEAT SHEET

## Every Work/Codex run

Read:

1. `RUSSIAN_MASTER_PROMPT.md`
2. active `RUxx` file
3. `RUSSIAN_CONSTITUTION_ROUTER.json`
4. only named constitution sections
5. latest evidence/status/diff

Then:

audit impacted scope
→ trace owner
→ implement/fix
→ targeted tests
→ affected subsystem tests
→ browser/user journey
→ regression
→ evidence
→ module status.

## Do not

- load all source archive prompts by default;
- re-open P0–P17 as the execution plan;
- copy global QA/UI/platform rules into Russian files;
- create a Russian-only platform fork;
- mark PASS without runtime/user-path evidence;
- publish from RU01–RU08.

## Release

RU08 produces exact RC handoff.

Then invoke the shared C3 production release annex.
