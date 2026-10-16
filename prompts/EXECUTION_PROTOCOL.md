# SHARED PROMPT EXECUTION PROTOCOL

Use this protocol for every durable Bauman prompt in ordinary ChatGPT chat, ChatGPT Work, or Codex.

## Start
1. Read `prompts/CONSTITUTION.md`.
2. Read `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md` and `prompts/DEPENDENCY_BUDGET.json` when infrastructure/storage/sync/runtime/provider choices are involved.
3. Read `prompts/PROMPT_REGISTRY.json`.
4. Load only the active Master Prompt + state.
5. If repository execution is requested, resolve current branch/HEAD and compare against last validated SHA.
6. If the task is discussion/planning only, do not invent repository state or claim repository execution.
7. Identify impacted canonical owners and Constitution pillars.

## Work loop
`inspect → edit → test → root-cause repair → retest → regression → evidence → state update → next dependency`

Apply universal R15–R22 through the existing Master Prompt and state. Preserve the approved objective; keep one active critical path, a completion predicate, exact source evidence and one primary next action. R22 replaces fixed work percentages: finish eligible analysis, edits and verification with current authorized capabilities; use a minimal handoff only for an evidenced capability gap. A handoff does not automatically switch Chat/Work/Codex mode or grant restricted rights.

Separate CODE_COMPLETE, TEST_VERIFIED, MERGED, DEPLOYED and USER_ACCEPTED. CI and agent review establish only their evidenced scope; mandatory human UX/academic acceptance and authenticated authority remain separate. A new read of unchanged green CI is not the default next action when safe product work is available.

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
Inherit the central [development runtime policy](https://github.com/BlueDragon33/Software-Blueprint-Hub/blob/cd01fb3c2178393628ce968af209db082227d2c4/control/development-runtime-policy.v1.json): Bauman development defaults to offline/local-only, with no remote publication from a push or CI completion. Preserve existing online URLs unless a separate removal is authorized.

Follow C3 and its Release Annex. Release target must be explicit: LOCAL_STABLE, SYNC_STABLE, PUBLISHED_STABLE or MANAGED_PRODUCTION_STABLE. Do not force MANAGED_PRODUCTION_STABLE when the subject only requires a local/offline target.

## Handoff
A new session should be able to continue from:
`Chat Entry + Constitution + Registry + active subject README/Master Prompt + state + routed clauses + diff when repository work is requested`.

Chat history is supplementary, not authoritative project state.


## Prompt control validation

When prompt governance changes, run `node scripts/validate-prompt-control-center.mjs` before merge. A prompt change is not complete if Registry paths are broken, a domain has competing Master Prompt authority, or Shared State / active packet / execution result disagree on packet identity, revision or lifecycle.
