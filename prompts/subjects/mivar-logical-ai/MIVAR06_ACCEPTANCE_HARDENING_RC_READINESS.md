# MIVAR06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`INFERENCE-REGRESSION · CONTRADICTION-RED-TEAMED · TRACE-VERIFIED · NO-KNOWN-BLOCKER`

# MISSION

Prove Mivar / Logical AI is semantically correct, terminating, explainable, safe, accessible and exact-RC ready.

# GATES

A canonical knowledge truth
B reasoning/assessment
C inference/trace
D explanation/AI
E UX/a11y/offline/performance/security
F legacy/RC.

# FACT VALIDATION MATRIX

Test:
- valid fact;
- duplicate fact;
- wrong arity;
- wrong domain;
- unknown entity;
- contradictory fact.

# RULE VALIDATION MATRIX

Test:
- valid rule;
- missing condition;
- malformed condition;
- unbound conclusion variable;
- domain mismatch;
- duplicate rule;
- impossible/unreachable conditions where detectable.

# BINDING MATRIX

Test:
- one binding;
- multiple bindings;
- conflicting binding;
- repeated variable consistency.

# INFERENCE MATRIX

Test:
- one-step;
- multi-step;
- no derivation;
- multiple valid derivations;
- forward/backward equivalence where semantics allow;
- fixed point.

# CYCLE / TERMINATION

Known:
self cycle,
mutual cycle,
productive cycle,
nonproductive repeated derivation.

Engine must terminate or hit explicit resource bound.

# DUPLICATE DERIVATION

No infinite repeated firing.

# CONTRADICTION

Test:
- direct contradiction;
- derived contradiction;
- conflict strategy if supported.

# NEGATION

Only actual semantics:
missing fact must not be treated as false unless contract permits.

# OPEN/CLOSED WORLD

If supported, fixture verifies distinction.

# PRIORITY / CONFLICT

Only if supported.
Ordering must be deterministic and documented.

# PROOF TRACE

Every derived fact trace references actual rule/facts/bindings.

# EXPLANATION

Rendered explanation must match proof trace.

# HIDDEN FACT

Known fixture must fail.

# STALE KB

Old query result clearly invalidated after KB revision.

# MULTIPLE VALID PROOFS

Grader accepts valid alternate proof path where task permits.

# PROPERTY-BASED GRADING

Prefer semantic result/trace properties over exact ordering when order is irrelevant.

# LARGE KB

Bounded performance/resource tests.

# QUERY SECURITY

Untrusted query cannot escape sandbox or mutate canonical KB without permission.

# KNOWLEDGE FILE SECURITY

Embedded prompt/instructions treated as data, not controller commands.

# AI ACCEPTANCE

AI must:
- not invent facts;
- not invent rules as canonical;
- distinguish verified trace from candidate reasoning;
- not fabricate proof;
- surface contradiction/unknown states;
- not reveal hidden answers;
- not write official mastery.

# OFFLINE

Core deterministic inference path verified offline where practical.

# PERFORMANCE

Measure:
KB load,
validation,
query,
inference,
graph render,
authoring.

# MEMORY

Repeated inference/proof graph use does not leak unbounded memory.

# RESPONSIVE / A11Y

Facts/rules/query/trace/proof graph usable on mobile/tablet/desktop with structured alternatives.

# AUTHORING ACCEPTANCE

Author creates:
- KB;
- facts;
- rules;
- query;
- scenario;
- contradiction/debug task

without app-code edits for ordinary cases.

# LEGACY

Resolve duplicate:
- KB registry;
- fact/rule parser;
- inference engine;
- explanation generator;
- graph visualizer;
- old routes/flags.

# FOUNDATION OWNER GATE

No duplicate generic Math/Algorithms/Database truth.

# MIGRATION

If canonical IDs/schema change:
aliases,
KB migration,
rule/fact migration,
learner evidence preservation,
rollback.

# RC FREEZE

Freeze:
SHA,
content snapshot,
subject pack,
KB revisions,
engine version/config,
golden traces,
lockfile.

# PRODUCTION SMOKE PROFILE

1. open Mivar / Logical AI subject;
2. open one canonical fact/rule lesson;
3. inspect facts/rules/variables;
4. run one deterministic query;
5. inspect one multi-step proof trace;
6. trigger one known contradiction/unknown case;
7. verify active subject pack/KB revision;
8. verify engine version/config;
9. verify optional AI grounded/fallback;
10. offline logical query if supported.

# BLOCKERS

- hidden facts accepted;
- invalid rule firing;
- infinite loop without resource stop;
- contradiction silently overwritten;
- explanation mismatches actual trace;
- AI fabricates proof/facts;
- stale KB result shown as current;
- duplicate canonical inference owner;
- migration corrupts learner evidence.

# DELIVERABLES

Create:
- `MIVAR_ACCEPTANCE_MATRIX.md`
- `MIVAR_FACT_RULE_REGRESSION.json`
- `MIVAR_BINDING_INFERENCE_REGRESSION.json`
- `MIVAR_CYCLE_CONTRADICTION_REPORT.md`
- `MIVAR_TRACE_EXPLANATION_ACCEPTANCE.md`
- `MIVAR_AI_ACCEPTANCE_REPORT.md`
- `MIVAR_SECURITY_REPORT.md`
- `MIVAR_ACCESSIBILITY_RESPONSIVE_REPORT.md`
- `MIVAR_OFFLINE_PERFORMANCE_REPORT.md`
- `MIVAR_LEGACY_CLOSURE_REPORT.md`
- `MIVAR_RC_MANIFEST.json`
- `MIVAR_PRODUCTION_SMOKE_PROFILE.md`
- `MIVAR06_EVIDENCE_INDEX.md`

# PASS

PASS only when canonical knowledge, rule validation, inference, proof trace, explanation and AI agree; cycles/contradictions/security gates pass; exact RC exists.

# FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST BE ABLE TO PROVE ITS CONCLUSION FROM THE EXACT KNOWLEDGE-BASE REVISION IT USED.**
