# PYTHON04 TEST / DEBUG PROVIDER CONTRACT
Status: PUBLIC VALIDATION BINDING — official provider acceptance pending.

## Test results
`python.test.run` returns structured cases with id/name, status (`passed|failed|error|skipped`), visibility, safe expected/actual data, error category and runtime identity. Hidden test source is never returned.

## Trace/debug
`python.trace` and `python.debug` may expose deterministic steps, call stack, variables, breakpoints and safe expression inspection. Real exception class/location is preserved; learner-friendly explanations may be added but may not replace runtime evidence.

## Static tools
Lint/format/typecheck are advisory providers. Formatting is not correctness. Lint/style is not mastery. Static-analysis findings must be clearly separated from runtime behavior.

All provider evidence flows into PYTHON03 contracts; no provider grants mastery by itself.

## Implemented validation scope

Public task `sum-integers` evaluates four public input lists and compares
returned values outside the untrusted Python process. Case IDs/visibility,
passed/failed counts and correctness are structured. Printed PASS is ignored.
Equivalent implementations and known wrong implementations are real fixtures.
This feedback remains public practice: learner transport can be forged and
therefore cannot become official evidence.

Trace mode reports at most 100 safe source locations; exceptions preserve type,
message, SyntaxError offset and safe cell/line locations. No privileged expression
eval, interactive breakpoint or static typechecker is implemented/advertised.
Official hidden grading and immutable-attempt persistence remain disabled.
Private/solution/policy request overrides are rejected before sandbox execution;
no accepted hidden test source or solution is shipped in the lab or AI context.
