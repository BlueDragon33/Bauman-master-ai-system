# MATH PRODUCTION SMOKE PROFILE

For the shared release authority only. MATH06 does not deploy production.

After a shared production release, verify against the exact RC identity:
1. Math route loads and expected subject/content IDs are visible.
2. Representative formula/lesson renders.
3. Representative MATH03 problem returns the expected verdict.
4. First attempt persists and retry does not overwrite it.
5. MATH04 numeric + graph capabilities work; unbound providers degrade honestly.
6. Search/resources resolve canonical Math entities.
7. AI Tutor is grounded or explicitly unavailable.
8. Offline core behaves according to the packaging profile.
9. Author/admin route remains protected and cannot bypass shared lifecycle.
10. No new critical console/network/security error.

Failure: contain/rollback to the manifest rollback SHA, trace canonical owner, fix, rerun impacted MATH06 acceptance, issue a new exact RC.
