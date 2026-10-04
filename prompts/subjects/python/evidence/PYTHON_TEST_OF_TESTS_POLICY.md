# PYTHON05 TEST-OF-TESTS POLICY
Status: ACTIVE

Critical coding tasks must be validated against:
- canonical correct implementation;
- at least one materially different valid implementation where feasible;
- known wrong implementation(s);
- edge cases.

Acceptance is behavior-based, never source-string equality.

The accepted PYTHON04 provider already proves this policy for a representative sum task. PYTHON05 task activation must preserve the same rule. Public/hidden grading data remains server-side; learner results contain case status only when disclosure is permitted and never hidden source/expected values.
