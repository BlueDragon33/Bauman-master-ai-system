# L25/B97 — Priority Contract Acceptance

Status: `PENDING_GATE`

## Purpose

B97 modernizes Priority Engine policy against the accepted Consumer Blueprint and Mastery V2 boundary.

No Priority result is persisted and nothing is sent to scheduler/runtime.

## Locked formula

`0.35 × Master relevance + 0.30 × knowledge gap + 0.20 × prerequisite urgency + 0.15 × forgetting risk`

- normalized input features: [0,1];
- score: [0,100];
- critical gap needed within 4 weeks overrides weighted band;
- weighted bands: high ≥70, medium ≥40, low otherwise.

## Existing Competency boundary

A target with verified existing competency plus valid retention evidence may be classified `review_on_demand`.

That disposition never grants `master_ready`.

The Diagnostic 80% pass / 70% critical floor and Mastery 75% retention / 14–21 day window must remain aligned.

## Safety

- Consumer/Mastery historical manifests are forbidden dependencies;
- current Mastery V2 snapshot schema is required;
- current prerequisite-policy schema is required;
- persistence disabled;
- scheduler write disabled;
- runtime activation disabled;
- production integration disconnected.

B98 remains blocked until B97 and all six project gates pass.
