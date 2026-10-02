# LSE03 — REQUIREMENTS · TRACEABILITY · VERIFICATION & VALIDATION · ASSESSMENT

Mode:
`REQUIREMENT-QUALITY-FIRST · TRACEABILITY-FIRST · V&V-SEPARATED · MULTIPLE-VALID-SOLUTION-AWARE`

# ENTRY
Requires LSE02.

# REASONING LOOP

`Need → Requirement → Quality Check → Allocation → Interface/Architecture → Trace → Verification → Validation → Change Impact → Readiness`

# ASSESSMENT DIMENSIONS

Grade separately:
- need interpretation;
- requirement formulation;
- requirement quality;
- allocation;
- interface reasoning;
- traceability;
- verification method;
- verification evidence;
- validation scenario;
- change impact;
- risk;
- technical review.

# CRITICAL CASES

Reject:
- “fast/easy/reliable” with no measurable context;
- compound independently verifiable requirements;
- missing source/owner;
- wrong allocation;
- incompatible interface semantics;
- orphan requirement;
- orphan test;
- stale trace;
- implementation status presented as verification;
- unit test presented as validation by itself;
- test result for wrong baseline;
- baseline mutated in place;
- changed requirement with stale evidence;
- risk with no cause/consequence.

# MULTIPLE VALID SOLUTIONS

Different architectures or verification methods may be valid when requirements and evidence support them.

# ERROR TAXONOMY

`NEED_REQUIREMENT_CONFUSION`
`AMBIGUOUS_REQUIREMENT`
`COMPOUND_REQUIREMENT`
`UNVERIFIABLE_REQUIREMENT`
`MISSING_SOURCE_OWNER`
`ALLOCATION_ERROR`
`INTERFACE_MISMATCH`
`TRACEABILITY_GAP`
`STALE_TRACE`
`ORPHAN_REQUIREMENT`
`ORPHAN_TEST`
`VERIFICATION_METHOD_ERROR`
`VERIFICATION_VALIDATION_CONFUSION`
`BASELINE_ERROR`
`CHANGE_IMPACT_GAP`
`RISK_FORMULATION_ERROR`
`REVIEW_GATE_ERROR`

# HINT LADDER

H1 identify need  
H2 rewrite requirement measurably  
H3 identify allocation/interface  
H4 inspect trace  
H5 choose verification method  
H6 define validation scenario  
H7 analyze change/risk  
H8 full example if allowed

# DELIVERABLES

Create:
- `LSE_REQUIREMENTS_REASONING_CONTRACT.md`
- `LSE_TRACEABILITY_ASSESSMENT_CONTRACT.md`
- `LSE_VV_ASSESSMENT_CONTRACT.md`
- `LSE_CHANGE_IMPACT_ASSESSMENT.md`
- `LSE_RISK_TRADE_STUDY_ASSESSMENT.md`
- `LSE_ERROR_TAXONOMY.json`
- `LSE_GOLDEN_VALID_LIFECYCLE_CASES.json`
- `LSE_GOLDEN_INVALID_LIFECYCLE_CASES.json`
- `LSE04_INPUT_CONTRACT.md`

# PASS

PASS when grader separates implementation, verification and validation and recognizes valid alternatives.

# FINAL PRINCIPLE

**A PASSED TEST IS ONLY MEANINGFUL WHEN TRACEABLE TO THE RIGHT REQUIREMENT AND EXACT BASELINE.**
