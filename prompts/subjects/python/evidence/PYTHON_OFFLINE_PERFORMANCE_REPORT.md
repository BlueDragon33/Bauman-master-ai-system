# PYTHON OFFLINE & PERFORMANCE REPORT

Offline contract:
- packaged task/lesson UI may remain available when cached;
- learner draft remains local;
- Python execution, tests and submit are disabled offline;
- no official submission is queued silently;
- reconnect rechecks runtime identity.

Performance acceptance is bounded by the P6 CI job timeout and real provider request timeout. The P6 live suite records request durations and rejects a representative provider call exceeding 30 seconds.

No claim is made for offline Python execution.
