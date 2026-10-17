# HUB WORK SPLIT — CHAT / CODEX / USER
## R22 capability-based allocation · B4 / STRUCTURED

This routing inherits effective universal R15–R22 and `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md`. Fixed percentage allocation is superseded; Chat/Work/Codex names describe available capabilities, not mandatory phases.

## Class A — Chat owns
The current connected, authorized environment handles architecture audit, ownership/source-of-truth mapping, provider selection, prompt/state, GitHub/CI/log review, test design, small/medium implementation, workflow/config, release reasoning and root-cause fixes whenever the available tools can do the work safely.

Use the ordinary connected path first. Code existing in a task is not a reason to switch modes. A need for an authenticated cross-app GUI can justify Work/Browser; a native build, complex local refactor or environment-specific test can justify Codex. Verify the concrete capability gap first.

Loop: inspect → root cause → canonical owner → smallest safe edit → targeted test → regression → evidence → continue.

## Class B — Codex deep specialist
Use Codex only for a demonstrated capability gap after narrowing the work package. No percentage quota applies.

Use Codex only for work such as:
- deep multi-file runtime refactor;
- complex sandbox/WASM/runtime integration;
- concurrency/race/state-machine work;
- difficult schema/data migration;
- large browser/E2E harness;
- repeated implement→run→debug→retest loops unavailable to normal Chat tooling.

Every escalation must include exact HEAD/policy, approved goal, root cause or capability gap, canonical owner, minimal allowed paths and excluded scope, file/log/tool/attempt budget, required verification, acceptance/return condition and safe independent work that can continue. A written handoff never opens Work or switches mode automatically.

Central execution-service dispatch additionally requires actual Project Authority, canonical Work Package/source binding and a scoped signed issuer grant. The candidate service protocol currently permits inspect-scoped reads; it does not authorize code writes, shell access, gate PASS or release. Do not create approval records, issue grants or infer readiness from test fixtures.

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
