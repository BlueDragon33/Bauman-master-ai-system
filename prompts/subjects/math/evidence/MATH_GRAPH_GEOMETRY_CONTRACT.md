# MATH04 · GRAPH / GEOMETRY CONTRACT

Status: ACTIVE

## Graph
`math.graph.sample` consumes an expression plus explicit bounds and bounded sample count. It returns sample points, discontinuity/gap markers, bounds and a textual summary.

Limits: 8–600 samples per call; invalid bounds fail; non-finite/domain points are gaps. Large adjacent jumps are marked as potential discontinuities so a renderer does not blindly join them.

The graph is representation only. MATH02 owns the function/domain. MATH03 owns assessment interpretation.

## Accessibility
A graph surface must retain the source expression, bounds and a nonvisual sample/feature summary. Canvas aria-label alone is insufficient.

## Geometry / vector
Capability slots exist but remain `UNAVAILABLE` until curriculum-required providers with explicit objects/constraints and keyboard/non-drag alternatives are validated. No fake geometry engine is introduced in MATH04.
