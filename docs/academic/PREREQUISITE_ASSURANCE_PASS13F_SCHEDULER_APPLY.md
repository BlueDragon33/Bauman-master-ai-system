# Pass 13F · Explicit Transactional Scheduler Apply

Status: `SCHEDULER_APPLY_ROLLBACK_BROWSER_VALIDATED`

Validated branch: `temp/bauman-master-hub-prereq-2026`

Validated code/workflow head: `dd2d9ed32c39f0f04dd1fd0224b446b59108fa0c`

GitHub Actions run: `34555370121` · SUCCESS

Browser job: `browser-e2e-acceptance` · SUCCESS

Browser artifact: `academic-browser-13e-13f-34555370121`

## Architecture

Pass13F does not enable automatic Academic scheduling. `academic-main.js` keeps `SCHEDULER_MUTATION_ENABLED=false`, and the Pass13D Preview runtime keeps its direct `APPLY_ENABLED=false` path fail-closed.

A separate runtime, `assets/js/academic-scheduler-apply.js`, provides only an explicit user-approved transaction path:

`Diagnostic → Risk/Repair → Preview/Diff → explicit confirmation → transaction Apply → verified rollback`

## Apply invariants

- Apply requires `confirmed:true`; the UI asks for explicit confirmation.
- Stored preview must be `bauman_academic_schedule_preview_v1`, version `PASS13D`, mode `preview_only`.
- The preview must still have the exact baseline schedule fingerprint.
- Every current slot must still match the exact value captured by preview.
- Existing manual, external or unknown-source entries cannot be replaced.
- At most six preview changes may be applied per transaction.
- Only the narrow remediation/diagnostic action set is accepted.
- `STOP_BROAD`, `JIT_ONLY` and already-MASTERED broad remediation cannot enter Apply.
- `REPAIR_MATCHED` requires both repair-route evidence and failed-node evidence.
- Applied entries are marked `academic_applied` and carry transaction ID, preview timestamp, applied timestamp and explicit-user-apply metadata.
- There is no call to legacy `autoSchedule()` and no background Apply trigger.

## Transaction and rollback

Transaction history is stored per user under `bauman_academic_2026_schedule_transactions_v1` and retains the exact entries before and after Apply, plus before/after schedule fingerprints.

Rollback is explicit and conservative:

- it only uses the latest active Academic transaction;
- the current schedule fingerprint must exactly equal that transaction's post-Apply fingerprint;
- if anything changed after Apply, rollback is rejected instead of overwriting the newer edit;
- slots that were empty before Apply are deleted on rollback;
- replaced auto/review slots are restored exactly;
- the final rollback fingerprint must exactly match the pre-Apply fingerprint;
- transaction status becomes `rolled_back` only after the schedule restoration is verified.

## Browser evidence

The final Chromium suite completed with `ACADEMIC_BROWSER_ACCEPTANCE_13E_13F_PASS` and 16 acceptance checks. It verified explicit transaction Apply, manual/external preservation, exact rollback, rejection of rollback after a post-Apply schedule change, successful rollback after that outside change is restored, transaction-history persistence after reload, responsive UI, device authorization/pending/offline-grace, and the prior Academic/PlanningBridge integration.

The same run observed Service Worker support but zero registrations, so this pass does not claim PWA offline-cache coverage.

## Merge boundary

Pass13F closes the Academic scheduler implementation/acceptance gate on the temporary branch. Merge to `main` is still prohibited until a final sync-safe comparison against the current `main` verifies that newer Main/Control-Service/device-management changes are preserved and the integrated candidate is revalidated.