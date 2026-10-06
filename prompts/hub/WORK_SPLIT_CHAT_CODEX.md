# HUB WORK SPLIT — CHAT / CODEX / USER
## Default allocation: Chat 90–95% · Codex 5–10% maximum

This split inherits `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md`.

## Class A — Chat owns
Chat is the default executor. It handles architecture audit, ownership/source-of-truth mapping, provider selection, prompt/state, GitHub/CI/log review, test design, small/medium implementation, workflow/config, release reasoning and root-cause fixes whenever the available tools can do the work safely.

Chat must try the ordinary path first. Code existing in the task is not by itself a reason to invoke Codex.

Loop: inspect → root cause → canonical owner → smallest safe edit → targeted test → regression → evidence → continue.

## Class B — Codex deep specialist
Codex is limited to the deepest 5–10% after Chat has narrowed the work package.

Use Codex only for work such as:
- deep multi-file runtime refactor;
- complex sandbox/WASM/runtime integration;
- concurrency/race/state-machine work;
- difficult schema/data migration;
- large browser/E2E harness;
- repeated implement→run→debug→retest loops unavailable to normal Chat tooling.

Every Codex handoff must include exact SHA, root cause/hypothesis, canonical owner, allowed files, forbidden scope, required tests, acceptance criteria, evidence and stop condition.

## Class C — real external blocker
Only a real external requirement may stop the flow:
- OAuth/user interaction;
- unavailable credential/secret;
- irreversible/destructive action;
- paid-plan approval;
- unavailable external capability after local/free alternatives are exhausted;
- Constitution prohibition;
- real cross-domain boundary conflict.

A Class C blocker in one branch does not block independent Chat-owned work.

## Infrastructure rule
Provider choice follows:
`browser/local → WASM/Workers → local runtime → optional user-owned sync → free managed → paid managed`.

Paid/vendor-specific infrastructure is optional unless a proven capability requirement says otherwise.

## Manual action rule
Prefer one exact PowerShell/GitHub CLI command over UI clicking when practical. Never ask the user to paste secrets into chat.

## Merge/release
Compilation alone is not PASS. Release target must be explicit:
- LOCAL_STABLE
- SYNC_STABLE
- PUBLISHED_STABLE
- MANAGED_PRODUCTION_STABLE

Do not force managed production when local/offline satisfies the actual requirement.
