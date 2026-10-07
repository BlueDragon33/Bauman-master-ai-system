# Russian Engine RE21 — Live RU04 Owner Binding

State: VALIDATING

## Runtime

When and only when the grounded Engine opt-in is requested, browser-bootstrap creates a live owner integration controller.

Every grounded observation is sent to that controller with the scene content revision.

The controller writes through the existing RussianAssessmentMastery APIs:
- recordAssessmentAttempt;
- recordEvidence.

## Safety

Evidence is always non-authoritative.

The integration never calls recordStageGate.

A duplicate Engine evidence ID is suppressed in the mounted controller and is also safe under the owner's idempotent IDs.

Missing RU04 owner fails soft and does not break the grounded interaction.

## Default behavior

Without `?ruEngine=grounded-v1`, live owner integration is not activated and no Engine evidence write occurs.

## Exit

PASS when real-owner mapping, duplicate safety, missing-owner containment, no stage-gate write and no mastery write are proven.
