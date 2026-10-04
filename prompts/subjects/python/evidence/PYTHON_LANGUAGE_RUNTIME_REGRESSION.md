# PYTHON LANGUAGE & RUNTIME REGRESSION

Runtime authority: CPython 3.14.8 via `cloudflare-container-durable-object-v1`.

P6 real-provider regression covers:
- exact runtime identity;
- stdin/stdout behavior;
- alternate valid implementation acceptance;
- known-wrong implementation rejection;
- negative/zero/large integer cases;
- timeout/resource/security regression inherited from P4 golden fixtures;
- clean container per run.

The stdlib runtime profile is intentionally narrow. NumPy/Pandas and notebook execution are not claimed in this RC.
