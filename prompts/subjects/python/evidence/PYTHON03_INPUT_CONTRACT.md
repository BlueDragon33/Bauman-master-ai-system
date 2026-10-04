# PYTHON03 INPUT CONTRACT

Status: READY AFTER PYTHON02 PASS
Production mutation authorized: **NO**

PYTHON03 must consume:
- `PYTHON_CURRICULUM_BLUEPRINT.md`
- `PYTHON_COMPETENCY_GRAPH.json`
- `PYTHON_PREREQUISITE_GRAPH.json`
- `PYTHON_CANONICAL_ENTITY_MODEL.md`
- `PYTHON_VERSION_AUTHORITY_POLICY.md`
- `PYTHON_CONTENT_PROVENANCE_POLICY.md`
- `PYTHON_LEGACY_LESSON_OWNERSHIP_MAP.json`.

Stable assumptions:
1. Actual runtime remains `subjects/programming/`.
2. Legacy PRxx IDs remain readable; PYTHON03 must not reset learner state.
3. No executable Python provider exists yet.
4. MCQ correctness is not programming mastery.
5. PYTHON03 may define code reasoning, trace/state reasoning, debugging taxonomy, behavior/test evidence and partial-credit semantics.
6. Runtime execution/sandbox implementation belongs to PYTHON04.
7. Global mastery authority remains C4; Python only specializes evidence semantics.

PYTHON03 output must be usable by a future governed runtime without requiring browser `eval` or a second mastery store.
