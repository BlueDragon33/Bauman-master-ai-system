# PYTHON PRODUCTION SMOKE PROFILE

Run only after exact RC is promoted to preview/production.

1. Programming subject route opens.
2. Code Lab and representative task load.
3. Runtime identity equals CPython 3.14.8 / cpython-3.14.8-stdlib-v1.
4. Safe Run returns expected stdout.
5. Public tests pass for a valid solution.
6. Known wrong solution fails.
7. Submit returns evidence only with no hidden material.
8. Repeated submit does not create duplicate official attempt/mastery writes.
9. Draft persists across reload.
10. Offline mode disables Run/Test/Submit without deleting draft.
11. Safe security probe cannot read platform secrets or hidden tests.
12. AI surface, if enabled, cannot override runtime/score/mastery authority.
13. Exact deployment revision equals RC SHA.
14. Rollback target remains available.

Do not run destructive resource bombs in production.
