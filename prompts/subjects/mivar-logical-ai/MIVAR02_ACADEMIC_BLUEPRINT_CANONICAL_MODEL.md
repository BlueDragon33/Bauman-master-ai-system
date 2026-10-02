# MIVAR02 — ACADEMIC BLUEPRINT & CANONICAL LOGICAL-KNOWLEDGE MODEL

Mode:

`FORMAL-SEMANTICS-FIRST · TRACEABLE · PROVENANCE-AWARE · CANONICAL-OWNER`

# ENTRY

Requires MIVAR01.

# MISSION

Define one canonical knowledge representation for the actual Mivar / Logical AI scope.

# OUTCOMES

Learner can:
- formalize a domain;
- define facts/entities/relations;
- define variables/domains;
- create valid rules;
- select inference direction;
- follow/construct inference;
- detect contradictions;
- explain derivations;
- evaluate knowledge-base completeness/consistency;
- document provenance and limits.

# CANONICAL ENTITIES

`KnowledgeBase`
`KnowledgeRevision`
`Entity`
`Constant`
`Variable`
`Domain`
`Predicate`
`Relation`
`Fact`
`Rule`
`RuleCondition`
`RuleConclusion`
`Binding`
`Query`
`InferenceStrategy`
`InferenceState`
`InferenceStep`
`DerivedFact`
`DependencyEdge`
`Conflict`
`Contradiction`
`ExplanationTrace`
`KnowledgeSource`
`ProvenanceRecord`
`Scenario`
`Misconception`
`Remediation`.

# KNOWLEDGE-BASE IDENTITY

Stable ID + revision.
Inference result binds exact revision.

# ENTITY / CONSTANT

Stable semantic identity.

# VARIABLE

Named placeholder with optional type/domain constraints.

# DOMAIN

Allowed values/type/semantic set.

# PREDICATE / RELATION

Arguments and arity explicit.

# FACT

Canonical grounded proposition/relation.

# FACT IDENTITY

Equivalent normalized fact should not duplicate accidentally.

# RULE

Rule has:
- identifier;
- conditions;
- conclusion(s);
- variables;
- constraints;
- provenance;
- optional priority only if actual semantics support.

# CONDITION

Positive/negative/existence/comparison only as actual scope supports.

# CONCLUSION

Must be derivable from valid bindings.

# BINDING

Maps variables to constants/entities/values.

# QUERY

Target fact/relation/goal.

# INFERENCE STRATEGY

Potential:
forward,
backward,
mixed,
mivar-specific.

Only actual MIVAR01 scope becomes canonical.

# INFERENCE STATE

Contains:
known facts,
agenda/goals,
bindings,
fired rules,
derived facts,
contradictions,
termination state.

# INFERENCE STEP

Record:
before state reference,
rule,
matched conditions,
bindings,
derived conclusion,
after state reference.

# DERIVED FACT

Stores provenance:
rule + prerequisite facts.

# DUPLICATE DERIVATION

Same fact may have multiple proof paths.
Do not overwrite provenance blindly.

# DEPENDENCY GRAPH

Derived from canonical knowledge/inference.
Graph view is not truth owner.

# CYCLE

Represent cycle and termination policy.

# TERMINATION

Possible:
fixed point,
goal found,
agenda empty,
depth/resource bound,
contradiction policy.

# CONFLICT

If multiple rules eligible:
strategy explicit.

# CONTRADICTION

Represent conflicting propositions/relations explicitly.

# CONTRADICTION POLICY

Possible:
report,
prioritize,
branch,
revision,
other actual course semantics.

Do not invent resolution semantics.

# OPEN/CLOSED WORLD

Only if actual scope.
Assumption must be explicit.

# MONOTONICITY

Only if actual scope.

# NEGATION

Semantics explicit:
classical,
negation-as-failure,
other actual scope.

Do not conflate.

# CERTAINTY / WEIGHT

Only if actual course supports.
Separate logical truth from confidence score.

# EXPLANATION TRACE

Can answer:
- what was concluded;
- which rule fired;
- which facts supported it;
- which bindings were used;
- prior derivations;
- source/provenance.

# PROVENANCE

Original facts/rules link to source/author/version.

# HYBRID ML FACT

If scope:
ML output entering KB must include:
model identity,
score/threshold,
timestamp/context,
confidence semantics.

Do not convert prediction to logical truth silently.

# STORAGE BOUNDARY

Database stores canonical entities.
Database engine does not define logical semantics.

# ALGORITHM BOUNDARY

Algorithms may implement matching/search.
MIVAR owns inference semantics.

# DELIVERABLES

Create:
- `MIVAR_ACADEMIC_BLUEPRINT.md`
- `MIVAR_COMPETENCY_GRAPH.json`
- `MIVAR_PREREQUISITE_GRAPH.json`
- `MIVAR_CANONICAL_ENTITY_SCHEMA.json`
- `MIVAR_FACT_RELATION_CONTRACT.md`
- `MIVAR_RULE_BINDING_CONTRACT.md`
- `MIVAR_INFERENCE_STATE_CONTRACT.md`
- `MIVAR_CONFLICT_CONTRADICTION_CONTRACT.md`
- `MIVAR_EXPLANATION_PROVENANCE_CONTRACT.md`
- `MIVAR_HYBRID_AI_BOUNDARY_CONTRACT.md`
- `MIVAR03_INPUT_CONTRACT.md`

# PASS

PASS when one canonical representation can support lessons, inference, explanations, grading and authoring without implementation-specific truth duplication.

# FINAL PRINCIPLE

**IF THE KNOWLEDGE REPRESENTATION IS AMBIGUOUS, THE INFERENCE ENGINE CANNOT MAKE IT TRUE BY COMPUTING FASTER.**
