# PYTHON TEST QUALITY POLICY

Public tests clarify behavior and support debugging without exposing the entire official assessment set. Hidden tests evaluate documented edge cases, generalization and robustness.

A test is invalid when it asserts behavior absent from the task contract, depends on irrelevant trick conditions, leaks hidden answers, or makes the official score flaky.

Required principles:
- normal + boundary + edge cases appropriate to the competency;
- anti-hardcode cases when sample memorization could pass;
- equivalent implementations accepted when behavior is equivalent;
- order ignored unless order is contractual;
- approximate numeric outputs use task/domain-appropriate tolerance;
- randomness uses a controlled seed, statistical contract or deterministic abstraction;
- performance limits exist only when performance is part of the competency;
- regression tests accompany verified bug fixes;
- notebook tasks include restart/run-all reproducibility checks.

Learner-written tests can be evidence of requirement understanding and edge-case awareness, but raw test count is not a quality metric.

