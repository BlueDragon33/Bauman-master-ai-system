# Russian Engine RE16 — Canonical Content Promotion

State: VALIDATING

## Purpose

Create a fail-closed lifecycle for Engine fixture/generated Russian content.

## Lifecycle

DRAFT / GENERATED_UNREVIEWED / FIXTURE_NONCANONICAL
→ REVIEW_CANDIDATE
→ RU03_APPROVED
→ PUBLISHED_REFERENCE
→ SUPERSEDED / ARCHIVED

Illegal jumps fail.

## Immutable revision

A stable content fingerprint is attached to each contentId + revision.

Registering the same revision with changed linguistic/provenance payload fails as an immutable revision conflict.

The fingerprint is an internal deterministic change detector, not a cryptographic trust proof.

## RU03 authority

Approval requires a review record containing:
- authority = RU03;
- decision = APPROVE;
- reviewer ID;
- reviewed revision matching the candidate revision.

AI or Engine cannot create RU03 approval.

## Publication

PUBLISHED_REFERENCE requires a canonical reference.

Consumers should prefer that canonical ref over copying linguistic truth into Engine.

## Supersession

Published revisions can be superseded without deletion.

History records the replacing revision.

## Exit gate

PASS when skipped transitions fail, revision mutation fails, RU03 approval is mandatory, publication requires canonicalRef and supersession preserves history.
