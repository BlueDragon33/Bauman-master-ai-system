# MATH COMPONENT ↔ CAPABILITY MAP

Owner: MATH05 · Status: LOCKED

Learner UI consumes capability IDs, not provider implementations.

| UI need | Capability / owner | Degraded state |
|---|---|---|
| Validate expression syntax | `math.parse.expression` | explicit parser error |
| Numeric check | `math.numeric.evaluate` | ERROR/UNAVAILABLE with provenance |
| Graph samples | `math.graph.sample` | graph unavailable + textual state |
| Matrix calculation | `math.matrix.compute` | unsupported operation/dimension |
| Numerical simulation | `math.simulation.run` | non-convergence / unavailable |
| Symbolic simplify/solve | MATH04 symbolic IDs | UNAVAILABLE until provider bound |
| Geometry/vector visual | MATH04 geometry/vector IDs | UNAVAILABLE until provider bound |
| AI coaching | `math.ai.coach` | canonical hint/local evaluator fallback |
| Reasoning verdict | MATH03 evaluator | INDETERMINATE when authority insufficient |

Component code may decorate these results, but must preserve status, assumptions, exactness and provenance.
