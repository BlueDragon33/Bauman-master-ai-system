# Prerequisite Assurance · Pass 13A · Sync-Safe Integration Audit

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `SYNC_SAFE_OVERLAY_VALIDATED_CI_PASS`
Validated SHA: `dcad7936619c5a9c6e472a31fe77892fb415d2e1`
CI run: `34497978374`

## Goal

Protect Phase-1 Academic 2026 work from overwriting newer runtime/device-management changes that landed on `main` after the prerequisite branch was created.

## Divergence audit

Merge base remains `6050657d0089f4eb6d0c868d9d76c14b7fc48c2b`.

At the audit point, `main` and the prerequisite branch were diverged. The newer `main` side contains a device-control/runtime-access line of work, including:

- `.github/workflows/runtime-device-gate-ci.yml`;
- `assets/css/device-access-gate.css`;
- `assets/js/platform/runtime-config.js`;
- `assets/js/platform/device-access-gate.js`;
- control-service storage/API changes;
- runtime-device-gate regression/E2E scripts;
- an `index.html` change that loads the device gate before the normal Hub runtime.

The Academic branch independently modifies `index.html` to load `academic-2026.css` and `academic-main.js`. Therefore `index.html` is the immediate integration collision point.

## Safe reconciliation performed

The prerequisite branch now preserves both runtime layers in `index.html`:

1. `main.css`;
2. `device-access-gate.css` from current `main`;
3. `academic-2026.css`;
4. `runtime-config.js` from current `main`;
5. `device-access-gate.js` from current `main`;
6. existing `data.js` and `main.js`;
7. existing `planning-main.js`;
8. `academic-main.js` last.

A stray literal `7` that existed after the topbar closing element on the prerequisite branch was removed during the reconciliation.

The exact current-main versions of the following runtime files were copied into the prerequisite branch without semantic edits:

- `assets/css/device-access-gate.css`;
- `assets/js/platform/runtime-config.js`;
- `assets/js/platform/device-access-gate.js`.

This is an overlay preservation step, not a claim that all 25 newer `main` commits have already been merged.

## CI hardening

The Academic 2026 workflow now also triggers on the device-gate CSS/JS files and checks:

- JavaScript syntax for `academic-main.js`, `runtime-config.js`, and `device-access-gate.js`;
- presence of both device-gate and Academic CSS references;
- presence/order-required runtime references in `index.html`;
- absence of the stray `</div>7` markup regression;
- all previous curriculum/prerequisite validators.

CI run `34497978374` passed the complete Academic 2026 chain including P9, P6, P4, P7, P8, P10, P11, J1, P0, runtime JS syntax and index reference checks.

## Remaining main-side changes

The branch is still intentionally not declared fully synchronized with `main`. Control-service migrations, device store/API changes, runtime-device-gate E2E/regression scripts and related documentation/workflow changes remain newer-main assets that must be preserved at final integration. They do not currently conflict with Academic prerequisite files except through runtime integration behavior.

No merge to `main` is allowed until final browser/device/access regression proves both systems coexist.

## Next

Pass 13B should implement the honest diagnostic runtime for all prerequisite gates, including reused gates P1/P2/P3/P5 that currently have knowledge content but do not yet have a complete gate-level diagnostic runtime. Untested state must remain `UNASSESSED`, never fabricated as zero. The next layer must compute REBUILD/REPAIR/BRIDGE/READY/MASTERED, enforce D1 and misconception floors, and expose repair routes without mutating the existing scheduler yet.
