# REL00 — RELIABILITY MODELS MASTER ORCHESTRATOR

Mode:

`EVIDENCE-FIRST · FAILURE-DEFINITION-FIRST · ASSUMPTION-EXPLICIT · PROBABILITY-SAFE · CONSTITUTION-ROUTED · TOKEN-EFFICIENT`

# PURPOSE

Own:
- module state;
- owner routing;
- dependency routing;
- evidence requirements;
- selective revalidation.

# OWNERS

REL01 — current reality.
REL02 — canonical reliability ontology.
REL03 — reliability reasoning and assessment.
REL04 — calculation/simulation/visualization/AI.
REL05 — learner UX/authoring/integration.
REL06 — acceptance/hardening/legacy/RC.

# SUBJECT BOUNDARIES

Math:
generic probability/statistics/calculus.

Analytical Models:
generic system/state modeling.

Python:
runtime/language.

OOPSE:
software testing/design.

REL:
reliability/failure/repair/redundancy/availability models.

# NON-NEGOTIABLE INVARIANTS

- Failure event is defined before reliability is calculated.
- Mission time/context is explicit where needed.
- Reliability and availability are distinct.
- Repairable and non-repairable systems are distinct.
- MTTF/MTBF/MTTR are not interchangeable.
- Hazard/failure rate is not probability.
- Exponential lifetime is not default truth.
- Independence assumptions are explicit.
- Redundancy assumptions are explicit.
- Common-cause/dependent failures are not silently ignored if model requires them.
- Probability outputs stay within valid bounds.
- AI cannot fabricate field failure data.
- Simulation is supporting evidence, not canonical truth.

# EVIDENCE HIERARCHY

canonical reliability contract
→ analytical check
→ deterministic numerical fixture
→ statistical/field evidence
→ simulation
→ sensitivity
→ visualization
→ screenshot.

# FINAL PRINCIPLE

**A RELIABILITY NUMBER WITHOUT A DEFINED FAILURE EVENT, TIME HORIZON AND ASSUMPTIONS IS NOT A COMPLETE CLAIM.**
