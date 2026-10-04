# PYTHON PRODUCTION SMOKE PROFILE
Run only through the shared production release workflow after exact preview revision verification.

Non-destructive smoke:
1. Open Programming Code Lab through authenticated ephemeral release-smoke device.
2. Verify runtime identity = CPython 3.14.8 / `cpython-3.14.8-stdlib-v1`.
3. Run safe `2 + 3` task and observe stdout.
4. Run public tests.
5. Submit assessment-preview evidence and verify hidden material is absent, `officialAttemptWrite=false`, `masteryWrite=false`.
6. Confirm a learner draft persists in browser local state.
7. Confirm deterministic hint fallback works; no AI provider is required.
8. Run safe environment-isolation probe and verify no `BAUMAN_`, TOKEN, SECRET or DATABASE values appear.
9. Switch browser offline after page load and verify execution controls become unavailable honestly.
10. Record exact production revision and smoke artifact.

Do **not** run memory bombs, infinite loops, network exfiltration or destructive sandbox exploits in production; those remain CI-only fixtures.
