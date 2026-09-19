# L25/B97 — Priority Contract Acceptance

Status: `PASS`

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


## Full gate evidence

Accepted repair/B97 head: `28e730595828b326ba0f7409cb79821460e02d76`

- Roadmap V2 Current Gate — run `35336940531` — PASS
- Foundation Domain Model — run `35336940521` — PASS
- Windows checkout safety — run `35336940515` — PASS
- Russian Reference UI — run `35336940503` — PASS
- Cloudflare Preview — run `35336940527` — PASS
- Whole System Integration — run `35336940529` — PASS


B97 is closed. B98 may begin subject to any B98 pre-audit hardening.
