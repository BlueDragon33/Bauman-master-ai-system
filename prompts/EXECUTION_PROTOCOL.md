# SHARED PROMPT EXECUTION PROTOCOL

Use this protocol for every durable Bauman prompt.

## Start
1. Read `prompts/CONSTITUTION.md`.
2. Read `prompts/PROMPT_REGISTRY.json`.
3. Load only the active Master Prompt + state.
4. Resolve current branch/HEAD.
5. Compare against last validated SHA.
6. Identify impacted canonical owners and Constitution pillars.

## Work loop
`inspect → edit → test → root-cause repair → retest → regression → evidence → state update → next dependency`

## State
Each durable domain should maintain one compact state file containing:
- active module/work package;
- status;
- branch/base;
- current and last validated SHA;
- changed owners/contracts;
- evidence;
- blockers;
- downstream revalidation scope;
- next action.

## Revalidation
Do not rerun an unrelated prompt simply because another area changed.
A PASS module becomes NEEDS_REVALIDATION only if an upstream truth, owned contract, state/data model or runtime dependency affecting it changed.

## Merge/release
Do not merge simply because code compiles.
Do not publish simply because merge succeeds.
Follow C3 and its Release Annex.

## Handoff
A new session should be able to continue from:
`Constitution + Registry + active Master Prompt + state + diff`.

Chat history is supplementary, not authoritative project state.
