# SHARED PROMPT EXECUTION PROTOCOL

Use this protocol for every durable Bauman prompt in ordinary ChatGPT chat, ChatGPT Work, or Codex.

## Start
1. Read `prompts/CONSTITUTION.md`.
2. Read `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md` when infrastructure/storage/sync/runtime/provider choices are involved.
3. Read `prompts/PROMPT_REGISTRY.json`.
4. Load only the active Master Prompt + state.
5. If repository execution is requested, resolve current branch/HEAD and compare against last validated SHA.
6. If the task is discussion/planning only, do not invent repository state or claim repository execution.
7. Identify impacted canonical owners and Constitution pillars.

## Work loop
`inspect → edit → test → root-cause repair → retest → regression → evidence → state update → next dependency`

Default allocation: Chat 90–95%; Codex 5–10% maximum. Chat must inspect, narrow scope and attempt ordinary implementation first. Codex receives only deep multi-file runtime/refactor/migration/E2E work packages.

For infrastructure/provider decisions use the dependency ladder from `DEPENDENCY_INDEPENDENCE_POLICY.md`; paid/vendor-specific services are optional unless a proven capability requirement says otherwise.

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

## Manual actions
When a user action is required and GitHub CLI or another reproducible CLI can perform it, prefer one exact copy-paste command over UI clicking. Never ask the user to paste secrets into chat.

## Merge/release
Do not merge simply because code compiles.
Do not publish simply because merge succeeds.
Follow C3 and its Release Annex. Release target must be explicit: LOCAL_STABLE, SYNC_STABLE, PUBLISHED_STABLE or MANAGED_PRODUCTION_STABLE. Do not force MANAGED_PRODUCTION_STABLE when the subject only requires a local/offline target.

## Handoff
A new session should be able to continue from:
`Chat Entry + Constitution + Registry + active subject README/Master Prompt + state + routed clauses + diff when repository work is requested`.

Chat history is supplementary, not authoritative project state.
