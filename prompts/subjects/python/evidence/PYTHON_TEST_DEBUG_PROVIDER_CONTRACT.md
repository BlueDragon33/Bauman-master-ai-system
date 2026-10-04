# PYTHON04 TEST / DEBUG PROVIDER CONTRACT
Status: TEST PROVIDER PROVEN — richer debugger/trace providers remain optional capabilities.

## Test results

`PythonSandbox.runTests()` provides the governed `python.test.run` execution path. It returns structured case id, status and runtime status plus provider/runtime identity. Hidden case input, expected output and hidden source are not returned.

The PYTHON04 test-of-tests fixture proved:
- canonical valid implementation: 3/3;
- alternate valid implementation: 3/3;
- known wrong implementation: fewer than 3/3;
- hidden material absent from the returned envelope.

This is behavior evidence; source-string equality is not used.

## Trace/debug

`python.trace` and `python.debug` remain optional future providers. When added, they may expose deterministic steps, call stack, variables, breakpoints and safe expression inspection. Real exception class/location must be preserved; learner-friendly explanations may supplement but not replace runtime evidence.

## Static tools

Lint/format/typecheck are advisory providers. Formatting is not correctness. Lint/style is not mastery. Static-analysis findings remain separate from runtime behavior.

All provider evidence flows into PYTHON03 contracts; no provider grants mastery by itself.

## Evidence

Real test-provider behavior passed `Python P4 Container Provider CI` run `37197219411` at head `6984c97effa094e4cb61c193103186f3d0da727f`.
