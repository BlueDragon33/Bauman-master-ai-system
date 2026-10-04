# PYTHON04 test/debug provider contract

Public practice task `sum-integers`: implement `solve(values)` returning the sum
of the given integer list. Cases are public: []→0, [1,2]→3, [-3,3]→0,
[4,5,6]→15. The sandbox receives function inputs; expected values are compared
in the trusted supervisor, never inferred from stdout or a learner PASS claim.
Equivalent implementations are accepted. Returned case IDs, visibility,
passed/failed counts and correctness category are structured practice feedback.
Errors/timeouts/resource limits remain distinct from failed behavior tests.

No official hidden task/test source or solution is implemented or packaged.
Requests cannot submit hiddenTests, solutions, official scores or authority.
Private official assessment remains disabled; adding it requires a trusted
server-side task store/evaluator separate from learner execution and public
packaging. Never place private evaluator source/expected answers in a Python
frame, browser bundle, provider request, local hint or AI prompt.

Trace reports at most 100 cell line locations. Exceptions preserve class,
message and cell locations, with supervisor bounds. They are advisory reports
from an adversarial process: learner code can disable tracing or change its own
runtime diagnostics. This is not a privileged debugger or correctness oracle.
No source-string grading. Lint/format/typecheck providers are not implemented
and are not presented as available.

Official evidence is always false; retries/runs cannot alter PYTHON03's immutable
first-attempt rule because this capability performs no official state writes.
The existing canonical learner-state and shared bridge remain unchanged.

Hidden test source is never returned; no provider grants mastery.
