# PYTHON ASSESSMENT TEST-OF-TESTS REPORT
P6 preserves PYTHON03 behavior-first authority.

Required executable checks:
- canonical correct solution PASS;
- structurally different valid alternate PASS;
- known hard-coded/wrong solution FAIL;
- public/hidden material remains server-side;
- learner response never contains hidden stdin/expected/source;
- submit remains evidence-only with `officialAttemptWrite=false` and `masteryWrite=false`.

Because Python runtime is not the canonical official-attempt writer, repeated practice evidence cannot duplicate an official attempt. Any future official-state writer must add its own idempotent key under the global learner-state owner before that capability is enabled.
