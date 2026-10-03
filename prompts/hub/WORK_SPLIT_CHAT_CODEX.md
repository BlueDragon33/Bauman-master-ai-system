# BAUMAN HUB — CHAT / CODEX WORK SPLIT

Status: CANONICAL
Scope: Bauman Hub only

## Principle

Use the normal Chat box for careful product/architecture work and small, deterministic repository changes.
Use Codex only when the work benefits materially from deep repository execution, multi-file refactoring, repeated test/fix loops, browser/runtime verification, or large-scale code transformation.

The goal is not speed. The goal is to use the lightest capable execution plane without sacrificing correctness.

## CLASS A — CHAT OWNS

Chat should handle these directly and should not hand them to Codex merely because code is involved:

- clarify and normalize user intent;
- inspect narrowly scoped Hub files/contracts/state;
- architecture decisions and source-of-truth decisions;
- UX/UI information architecture and component contracts;
- acceptance criteria and QA matrices;
- audit existing Hub behavior from targeted files/screenshots;
- compare exact GitHub SHAs/diffs;
- prompt-system files, documentation, state files and work packets;
- small deterministic edits when all of the following are true:
  - Hub-only;
  - normally 1–2 files;
  - no migration;
  - no auth/security/Device Gate change;
  - no cross-runtime contract change;
  - no browser/build/test harness required to understand correctness;
  - change can be verified by direct diff/static inspection;
- review Codex execution results;
- decide ACCEPT / REVISE / BLOCKED;
- prepare merge/release decision, but do not silently publish unless authorized.

Chat behavior: slow, evidence-first, narrow reads, verify before changing, no routine confirmation checkpoints.

## CLASS B — CODEX OWNS

Escalate to Codex when any of these are true:

- multi-file runtime refactor with coupled behavior;
- new shared adapter/read-model/state architecture;
- data/state migration or compatibility migration;
- repeated implement -> run tests -> diagnose -> fix -> retest loop;
- browser/E2E/responsive verification is required;
- build tooling, CI, service worker, PWA/offline behavior;
- auth, Device Gate, permission, security-sensitive behavior;
- contract implementation spanning multiple owners;
- large DOM/render ownership cleanup;
- performance profiling/optimization;
- non-trivial persistence/storage changes;
- broad dead-code cleanup where runtime ownership must be proven;
- changes whose safe implementation depends on executing the app;
- regression surface is too large to validate by static inspection alone;
- expected diff is large or touches 3+ coupled runtime files.

Codex receives one approved work packet and must return exact execution evidence.

## CLASS C — EXTERNAL AUTHORITY / USER GATE

Stop only when real outside authority is required, for example:

- credentials/secrets not available;
- OAuth/Cloudflare/Vercel/GitHub authorization requiring user action;
- production release authority not already granted;
- destructive or irreversible operation outside packet authority;
- required subject capability does not exist and adding it would cross the Hub boundary.

## Boundary

For Hub work, neither Chat nor Codex may use subject-app internals as a shortcut.

Forbidden:
- prompts/subjects/** as Hub implementation input;
- subjects/** modification;
- private subject DB/localStorage/IndexedDB/DOM;
- invented subject endpoints;
- subject assessment/mastery/pedagogy changes.

Subject integration remains:
Descriptor -> Capability -> Launch Adapter -> Normalized Hub Read Model.

## Dispatch rule

Before work starts, classify it:

- A: Chat executes directly.
- B: Chat defines/updates packet; Codex executes; Chat reviews.
- C: stop and request only the missing external authority.

If a task starts as A but expands into B, Chat stops editing runtime, preserves evidence, updates the packet, and hands off without restarting analysis from zero.

If a task starts as B but Codex discovers a small unrelated A-class documentation/state correction, it may update only the execution-result/state artifacts required by the packet; unrelated product changes return to Chat.

## Continuous behavior

Chat:
inspect -> reason -> small safe change when Class A -> verify -> continue.

Codex:
inspect approved scope -> implement -> targeted test -> fix -> regression -> evidence.

Neither plane asks for routine confirmation between internal phases.
