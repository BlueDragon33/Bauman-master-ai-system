# PYTHON05 input contract

Status: PROVISIONAL — do not open PYTHON05 acceptance until PYTHON04 exact-head
tests, review and required CI/PR acceptance are recorded.

Consume PYTHON02 academic truth and PYTHON03 assessment truth unchanged.
Programming remains `subjects/programming/`, with 48 stable legacy lesson IDs
and the existing canonical learner-state owner. The local Python lab exposes
one adapter facade and public practice evidence, never official grades/mastery.

The initial provider is local Docker/CPython 3.12.12, not a production endpoint.
Consume the execution/security/environment/notebook/test/data/AI contracts in
this evidence directory and the exact tested SHA/CI receipts in the execution
report. Preserve unavailable capabilities explicitly: remote/offline execution,
private official tests, external AI, NumPy/Pandas and persistent REPL kernel.
Do not route unsupported official tasks into public practice evidence.

PYTHON05 may improve authoring/editor/learner integration using shared UI and
the existing subject manifest/adapter; it must not fork a platform registry,
runner, learner state store, assessment truth or release mechanism. A remote
provider or private official grader needs separate infrastructure/security
authority and new exact-head acceptance before being enabled.

Rollback: remove the additive lab link/declaration/assets and stop only the
local companion processes. Force-remove only containers labeled
`bauman.python04=true` after confirming they belong to this provider. No learner
state/database/schema migration or production deployment occurred.

Release status: NOT READY. The historical blocker states that no compliant learner Python execution provider has yet been proven for the hosted product. This branch supplies a local container candidate and explicit acceptance harness, not a released learner service. Required exact-head CI/PR acceptance is still pending.
