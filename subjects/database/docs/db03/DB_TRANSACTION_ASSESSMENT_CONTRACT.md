# DB Transaction Assessment Contract

Every task names a theoretical isolation model or verified DatabaseEngineProfile.

Evidence may include operation trace, read/write set, visibility explanation, anomaly classification, wait-for graph, conflict reasoning, commit/rollback result and invariant impact.

Supported phenomena include dirty read, non-repeatable read, phantom, lost update and write skew.

DB04 execution/simulation must reproduce intended schedules deterministically enough for grading.

Transaction assessment uses isolated/resettable learner data and never application/control D1.
