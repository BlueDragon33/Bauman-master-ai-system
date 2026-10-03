# MATH05 INPUT CONTRACT

Status: READY · MATH04 PASS

## Accepted MATH04 baseline

- Exact runtime-tested head: `c39b4ca271b7750b42adbb6b315d87d3b41ffa53`
- Math Learning App Gate: `37123186751` · SUCCESS
- Whole System Integration Gate: `37123186689` · SUCCESS
- Development Fast CI: `37123186702` · SUCCESS
- Universal Constitution Compliance: `37123187267` · SUCCESS
- Future Interface System CI: `37123186688` · SUCCESS
- Production deployment: NO

## Locked MATH04 inputs

MATH05 may consume:
- `MATH_CAPABILITY_REGISTRY.json`;
- `MATH_EXPRESSION_PARSER_CONTRACT.md`;
- `MATH_SYMBOLIC_PROVIDER_CONTRACT.md`;
- `MATH_NUMERICAL_COMPUTATION_POLICY.md`;
- `MATH_GRAPH_GEOMETRY_CONTRACT.md`;
- `MATH_SIMULATION_NUMERICAL_METHODS_CONTRACT.md`;
- `MATH_AI_TUTOR_CONTRACT.md`;
- `MATH_AI_TOOL_PERMISSION_MATRIX.md`;
- `MATH_COMPUTATION_VISUALIZATION_GOLDEN_FIXTURES.json`;
- `window.BAUMAN_MATH_CAPABILITIES` as the provider facade.

## Authority boundary

- MATH02 remains mathematical truth owner.
- MATH03 remains reasoning/assessment verdict owner.
- MATH04 provides typed computation/visualization/advisory capability results only.
- Provider results cannot write official mastery or academic truth.
- Unbound symbolic/CAS, geometry/vector and remote-AI providers remain `UNAVAILABLE`; MATH05 must not fake them in UI.
- Learner/authoring surfaces must call capability IDs/adapters rather than provider-specific implementations.
- Result provenance, exactness/approximation, assumptions and failure state must remain visible to the consuming UI where material.

## Compatibility

MATH05 must preserve MATH03 verdict semantics:
`ACCEPTED | REJECTED | CONDITIONAL | INDETERMINATE`.

Capability output may support explanation or evidence display, but must not silently upgrade an `INDETERMINATE` reasoning result to accepted/mastery.

## Revalidation triggers

Revalidate MATH04 if MATH05 changes:
- capability IDs/result contract;
- parser grammar or safety;
- provider exactness/domain/assumption semantics;
- offline/degraded behavior;
- AI permission/reveal policy;
- computation provenance.

Pure learner-surface layout or authoring presentation changes do not invalidate MATH04 provider semantics.
