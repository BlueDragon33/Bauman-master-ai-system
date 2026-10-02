# MIVAR03 — LOGICAL REASONING · INFERENCE · EXPLANATION · ASSESSMENT

Mode:

`TRACE-FIRST · MULTIPLE-VALID-DERIVATION-AWARE · HIDDEN-FACT-INTOLERANT`

# ENTRY

Requires MIVAR02.

# REASONING LOOP

Problem
→ formalize entities/facts
→ define variables/domains
→ define rules
→ choose goal/strategy
→ match conditions
→ bind variables
→ fire rule
→ derive fact
→ check conflict/contradiction
→ continue/terminate
→ explain result.

# ASSESSMENT DIMENSIONS

Separate:
- formalization;
- fact correctness;
- variable/domain use;
- rule correctness;
- matching;
- binding;
- inference order/strategy;
- termination;
- contradiction handling;
- explanation/provenance;
- final result.

# FINAL ANSWER ONLY

Insufficient where task targets reasoning trace.

# FACT FORMALIZATION

Check:
entity identity,
relation,
argument order,
domain/type.

# RULE FORMALIZATION

Check:
conditions,
conclusion,
variable scope,
safe bindings.

# UNBOUND VARIABLE

Known invalid fixture required.

# DOMAIN VIOLATION

Known invalid fixture required where domains exist.

# RULE FIRING

All required conditions must be satisfied under one compatible binding.

# VARIABLE CONSISTENCY

Same variable occurrence must keep same binding.

# MULTIPLE MATCHES

All valid matches considered according inference semantics.

# FORWARD INFERENCE

If supported:
agenda/fixed-point reasoning.

# BACKWARD INFERENCE

If supported:
goal decomposition and subgoal proof.

# MIXED INFERENCE

Only if actual scope.

# MULTIPLE VALID DERIVATIONS

Different rule orders/proof paths can produce same conclusion.
Grader should accept valid traces.

# CIRCULAR RULES

Known cycle fixture.
Must terminate or report resource/loop status according contract.

# DUPLICATE DERIVATION

Should not cause infinite repeated firing.

# CONTRADICTION

Learner identifies incompatible derived/known facts.

# CONFLICT RESOLUTION

Only assess priorities/strategies actually taught.

# NEGATION

Semantics follow MIVAR02.
Do not assume missing fact = false unless closed-world/NAF says so.

# INCOMPLETE KNOWLEDGE

“Cannot derive” is not necessarily “false”.

# EXPLANATION

Learner can explain rule/facts/bindings.

# PROOF TRACE

Every step must refer to prior facts or original facts.

# HIDDEN PREMISE

Known invalid fixture:
answer depends on unstated/hidden fact.

# QUERY ANSWER

Possible states:
proved,
disproved if semantics support,
unknown/not derivable,
contradictory,
resource-limited.

# COMPLETENESS CLAIM

Do not claim KB is complete merely because query returned result.

# ERROR TAXONOMY

`FORMALIZATION_ERROR`
`FACT_ERROR`
`ARITY_ERROR`
`VARIABLE_SCOPE_ERROR`
`UNBOUND_VARIABLE`
`DOMAIN_ERROR`
`RULE_CONDITION_ERROR`
`INVALID_RULE_FIRE`
`BINDING_CONFLICT`
`INFERENCE_STRATEGY_ERROR`
`CYCLE_ERROR`
`TERMINATION_ERROR`
`DUPLICATE_DERIVATION_ERROR`
`NEGATION_SEMANTICS_ERROR`
`CONTRADICTION_ERROR`
`HIDDEN_PREMISE`
`EXPLANATION_TRACE_ERROR`
`PROVENANCE_ERROR`.

# PARTIAL CREDIT

Separate:
knowledge representation,
inference correctness,
final result.

# HINT LADDER

H1 identify facts/entities
H2 inspect variables/domains
H3 inspect rule conditions
H4 inspect binding
H5 identify next valid rule
H6 inspect contradiction/cycle
H7 reconstruct proof trace
H8 full solution only when allowed.

# TEST-OF-TESTS

Known invalid systems must fail:
- rule fires with missing condition;
- variable bindings inconsistent;
- unbound conclusion variable;
- infinite cycle;
- missing fact treated as false without semantics;
- explanation cites rule that never fired;
- hidden fact inserted;
- contradiction silently overwritten.

# AI BOUNDARY

AI may coach formalization.
It cannot invent facts/rules or substitute a prose chain for actual engine trace.

# DELIVERABLES

Create:
- `MIVAR_LOGICAL_REASONING_CONTRACT.md`
- `MIVAR_INFERENCE_ASSESSMENT_CONTRACT.md`
- `MIVAR_BINDING_RULE_ASSESSMENT.md`
- `MIVAR_CONTRADICTION_ASSESSMENT.md`
- `MIVAR_EXPLANATION_ASSESSMENT.md`
- `MIVAR_ERROR_TAXONOMY.json`
- `MIVAR_GOLDEN_VALID_TRACES.json`
- `MIVAR_GOLDEN_INVALID_TRACES.json`
- `MIVAR04_INPUT_CONTRACT.md`

# PASS

PASS when grader can distinguish valid inference from plausible answer text and accepts multiple valid derivations.

# FINAL PRINCIPLE

**GRADE THE DERIVATION, NOT JUST THE SENTENCE AT THE END.**
