# MATH04 · NUMERICAL COMPUTATION POLICY

Status: ACTIVE

Local numeric computation uses bounded deterministic JavaScript Number arithmetic and reports `numerical_approximation` provenance.

Rules:
- problem-specific tolerance remains MATH03 policy; MATH04 does not invent a global epsilon;
- NaN/Infinity/division-by-zero/domain errors are explicit;
- iteration count and convergence status are returned for iterative methods;
- seeded/random computation must expose the seed;
- unit-aware assessment remains governed by the MATH03 problem contract unless a validated unit provider is bound;
- plausible numeric output is not automatically accepted evidence.
