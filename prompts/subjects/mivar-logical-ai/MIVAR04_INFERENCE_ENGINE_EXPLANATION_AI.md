# MIVAR04 — INFERENCE ENGINE · TRACE · EXPLANATION · AI

Mode:

`CANONICAL-KB-DRIVEN · DETERMINISTIC-WHEN-POSSIBLE · EXPLAINABLE · RESOURCE-BOUNDED · AI-BOUNDED`

# ENTRY

Requires MIVAR02/MIVAR03.

# CAPABILITIES

Possible:
- `mivar.kb.load`
- `mivar.fact.validate`
- `mivar.rule.validate`
- `mivar.infer.forward`
- `mivar.infer.backward`
- `mivar.infer.mixed`
- `mivar.query.run`
- `mivar.trace.explain`
- `mivar.graph.visualize`
- `mivar.consistency.check`
- `mivar.scenario.run`
- `mivar.ai.tutor`

Only actual scope.

# KNOWLEDGE-BASE LOADER

Load exact KB revision.
Reject schema/semantic incompatibility.

# FACT VALIDATOR

Check:
predicate/relation,
arity,
domains,
duplicates,
contradictions.

# RULE VALIDATOR

Check:
variable scope,
bound conclusion variables,
condition structure,
domain compatibility.

# MATCHER

Deterministic ordering where possible.
If ordering is semantically irrelevant, result must not depend on accidental container order.

# BINDING ENGINE

Preserve one compatible substitution per match.

# FORWARD ENGINE

If supported:
agenda/fixed point.
Avoid repeated useless firing.

# BACKWARD ENGINE

If supported:
goal stack/tree,
cycle detection,
memoization where appropriate.

# MIXED ENGINE

Only if scope.

# RESOURCE LIMITS

Bound:
steps,
depth,
agenda,
facts,
rules,
bindings,
time,
memory.

# TERMINATION STATUS

Return:
goal-found,
fixed-point,
no-proof,
contradiction,
resource-limit,
error.

# DERIVED FACT PROVENANCE

Store:
rule ID,
binding,
prerequisite fact IDs,
KB revision.

# MULTIPLE PROOFS

Preserve multiple proof paths where useful.

# EXPLANATION GENERATOR

Explanation is rendered from actual trace.
No free-form invented rationale.

# CONTRADICTION CHECK

Detect according canonical semantics.

# CONSISTENCY REPORT

List:
conflicting facts/rules,
cycles,
unreachable rules where determinable,
unused facts where relevant.

# DEPENDENCY GRAPH

Derived from KB/rules.
Graph view is not semantic owner.

# QUERY ENGINE

Query result includes:
status,
answers/bindings,
proof refs,
KB revision,
warnings.

# SCENARIO RUNNER

Temporary scenario facts are isolated from canonical KB unless explicitly published.

# STALE RESULT

Query/inference from old KB revision cannot masquerade as current.

# OBSERVABILITY

Track:
parse error,
invalid rule,
cycle/resource stop,
contradiction,
query failure,
explanation mismatch,
AI failure.

# AI TUTOR MODES

`FORMALIZATION_COACH`
`RULE_COACH`
`BINDING_COACH`
`INFERENCE_COACH`
`CONTRADICTION_COACH`
`EXPLANATION_COACH`
`KB_DESIGN_COACH`.

# AI GROUNDING

Canonical KB + task + actual inference trace + learner attempt.

# AI PROOF SAFETY

If no engine trace exists:
AI may suggest a candidate reasoning path but must label it unverified.

# AI FACT SAFETY

Never add unstated facts as truth.

# AI RULE SAFETY

Suggested rules are proposals, not canonical KB changes.

# AI HIDDEN MATERIAL

No access to protected answer/proof fixtures.

# AI OFFICIAL GRADING

Forbidden by default.

# SECURITY

Knowledge files treated as untrusted input.
No embedded instructions can override platform rules.

# OFFLINE

Logical engine should be local/offline where practical.

# DELIVERABLES

Create:
- `MIVAR_KB_RUNTIME_CONTRACT.md`
- `MIVAR_RULE_VALIDATOR_CONTRACT.md`
- `MIVAR_INFERENCE_ENGINE_CONTRACT.md`
- `MIVAR_QUERY_RESULT_SCHEMA.json`
- `MIVAR_TRACE_EXPLANATION_CONTRACT.md`
- `MIVAR_CONSISTENCY_CHECKER_CONTRACT.md`
- `MIVAR_GRAPH_VISUALIZATION_CONTRACT.md`
- `MIVAR_AI_TUTOR_CONTRACT.md`
- `MIVAR_SECURITY_RESOURCE_BOUNDARY.md`
- `MIVAR05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum:
- one-step derivation;
- multi-step derivation;
- multiple valid proof paths;
- unbound variable;
- contradiction;
- cycle termination;
- hidden-premise rejection;
- stale KB revision;
- explanation trace verification.

# PASS

PASS when every engine result is traceable to exact KB revision and actual inference steps.

# FINAL PRINCIPLE

**THE EXPLANATION MUST BE A VIEW OF THE INFERENCE TRACE, NOT A STORY GENERATED AFTER THE FACT.**
