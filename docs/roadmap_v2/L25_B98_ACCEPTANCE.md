# L25/B98 — Deterministic Priority Scoring Acceptance

Status: `PENDING_GATE`

## Purpose

B98 implements the current Priority scoring harness in `scripts/` only.

It consumes explicit current Mastery snapshots and explicit candidate metadata. No canonical Priority executable or manifest is admitted.

## Required behavior

- exact 35/30/20/15 contribution model;
- six current knowledge states normalize exactly;
- urgency boundaries at 4/8/12/24 weeks and missing due date;
- forgetting risk derived from current state and retention evidence;
- gap needed within four weeks becomes `critical`;
- Existing Competency + valid diagnostic/retention becomes `review_on_demand`, never Master-ready;
- high/medium/low weighted bands remain deterministic;
- output conforms to Priority Result V2 explainability fields;
- result is deeply frozen and non-persisted.

## Fail-closed coverage

B98 rejects:

- manual derived-feature/disposition overrides;
- relevance outside [0,1];
- negative due horizon;
- unknown target;
- candidate/snapshot phase mismatch;
- persisted snapshot;
- Master-ready state/gate mismatch;
- prerequisite-eligibility/state mismatch.

## Safety

- no ranking is introduced until B99;
- no canonical `roadmap_v2/priority.mjs`;
- no Priority manifest;
- canonical source JSON remains byte-identical;
- persistence, scheduler write and runtime activation remain disabled.

B99 remains blocked until B98 and all six project gates pass.
