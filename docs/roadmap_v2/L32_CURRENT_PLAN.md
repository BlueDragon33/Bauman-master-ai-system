# Lượt 32 — Current Plan · Bước 125–128

Status: `B125_PASS · H1_PASS · F1_SUPERSEDED · F2_PASS · B126_ACTIVE · B127_BLOCKED · B128_BLOCKED`

Prerequisite: L31 final marker head `369df7fcc7f9e79c2ad3426651918608cc56bcc1` passed the complete six-gate set.

## Why L32 exists

L31 can prove that a candidate is `eligible_for_release_review`, but deliberately does not authorize release review or production promotion. The canonical Roadmap tree has no current Release Review receipt boundary.

L32 adds a separate data-only Release Review layer. It does **not** authorize production promotion, connect a production consumer, persist review state, render a dashboard, mutate schedules/calendars, activate runtime behavior, send notifications, or perform automatic actions.

## B125 — Release Review contract and canonical request/result schemas

**PASS.** Pinned a fail-closed contract for:
- `CANDIDATE::...` candidate identities;
- `RELEASE_REVIEWER::...` reviewer identities;
- recomputation of current Promotion Eligibility from its canonical request;
- release review only when recomputation yields `eligible_for_release_review`;
- three explicit review decisions: approve for a later promotion-review stage, needs revision, rejected;
- approval meaning shadow-only next-stage eligibility, never production authorization.

## L32-H1 — Release Review identity/audit binding

**PASS.** Exact outer/nested candidate binding plus explicit reviewer/decision/reason audit fields are enforced. The F2 clean validator rebuild passed the complete six-gate set at head `536b368876c0b45e7a6a66daaab30d605664a9e1`.

## B126 — Deterministic in-memory Release Review projector

**ACTIVE.** Implements a scripts-only, deterministic, deeply frozen projector that recomputes Promotion Eligibility, preserves candidate/reviewer/decision/reason audit identity, maps non-eligible upstream states to a blocked receipt, and allows only `release_review_approved_shadow_only` to set `promotionReviewEligible=true`. Production promotion and all runtime/persistence side effects remain disabled.

## B127 — Adversarial Release Review validation

Blocked until B126 passes the complete six-gate set.

## B128 — Full-system closeout

Blocked until B127 passes the complete six-gate set.

Any defect creates `L32-Fx`; any missing architecture creates `L32-Hx`. Later steps remain blocked until the repair/hardening head passes the complete six-gate set.

## L32-F1 — B125 validator syntax repair

H1 gate exposed a generated-source syntax defect in the B125 validator: the added audit-field assertions were spliced into the source-eligibility assertion and produced `SyntaxError: missing ) after argument list` before B125 logic could execute.

F1 reconstructs only that assertion block. No schema, identity-binding rule, fail-closed rule, production boundary or runtime-isolation assertion is weakened. H1 and B126 remain blocked until the repaired head passes the complete six-gate set.

## L32-F2 — Clean rebuild of B125 validator

The F1 patch removed the first malformed splice but a stale duplicated assertion tail remained after the validator's final `console.log`, causing `SyntaxError: Unexpected token ')'` at line 84.

F2 replaces the complete B125 validator with one clean source file containing all original B125 checks plus H1 identity/audit assertions. No gate or policy is removed.
