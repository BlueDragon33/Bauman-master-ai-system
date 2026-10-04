# PYTHON05 CODE LAB UX CONTRACT
Status: ACTIVE

The Code Lab reuses `platform/ui/bauman-ui.*` and the Programming subject identity. It is not a second app shell.

## Required controls
- accessible code textarea with predictable four-space Tab insertion;
- explicit stdin field for ordinary Run;
- separate Run / Run tests / Submit / Cancel controls;
- status states ready, running, canceling, timeout/error, complete;
- stdout, stderr/traceback, system messages, tests and evidence shown as distinct categories;
- hint ladder with visible incremental reveal;
- local autosave and multi-tab conflict warning;
- mobile punctuation/indent helpers;
- offline banner that disables execution honestly.

## Evidence consequences
Run never consumes an official attempt.
Run tests uses only server-owned public tests.
Submit executes governed public+hidden tests server-side and returns an evidence-only envelope. It sets `officialAttemptWrite=false`, `masteryWrite=false` until the canonical learner-state owner performs a reviewed write in a later accepted integration.

## Accessibility
Editor, stdin, Run/Test/Submit, hints, status, output tabs and errors are keyboard-focusable and labeled. Pass/fail uses text/symbol plus color. Original stderr is retained.
