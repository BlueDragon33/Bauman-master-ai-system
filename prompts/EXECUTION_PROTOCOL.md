# SHARED PROMPT EXECUTION PROTOCOL

Use this protocol for every durable Bauman prompt in ordinary ChatGPT chat, ChatGPT Work, or Codex.

## Start
1. Read `prompts/CONSTITUTION.md`.
2. Read `prompts/PROMPT_REGISTRY.json`.
3. Load only the active Master Prompt + state.
4. If repository execution is requested, resolve current branch/HEAD and compare against last validated SHA.
5. If the task is discussion/planning only, do not invent repository state or claim repository execution.
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
`Chat Entry + Constitution + Registry + active subject README/Master Prompt + state + routed clauses + diff when repository work is requested`.

Chat history is supplementary, not authoritative project state.
