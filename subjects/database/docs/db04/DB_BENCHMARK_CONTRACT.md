# DB04 Benchmark Contract

Capability: `db.benchmark.run`

Benchmark evidence records:
- engine/profile/version;
- fixture revision and data size;
- query/task ID;
- plan ID/result if available;
- repetitions;
- cache/warm-state context when meaningful;
- measured latency distribution/median;
- row count;
- timeout/failure information.

## Interpretation

Benchmark result is contextual evidence, not a universal theorem.

Do not:
- cherry-pick fastest run;
- compare different datasets as if equal;
- call planner cost milliseconds;
- infer future production performance from one toy fixture.

Benchmarking must remain inside the learner/performance sandbox.
