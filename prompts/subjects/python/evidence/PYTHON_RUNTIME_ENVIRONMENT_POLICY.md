# PYTHON04 runtime environment policy

CPython 3.12.12, environment `python04-stdlib-v1`, Linux x86_64/cgroup v2.
Base image:
`python@sha256:593bd06efe90efa80dc4eee3948be7c0fde4134606dd40d8dd8dbcade98e669c`.
Build recipe and bootstrap fingerprints are verified on every run; concrete
built image ID appears in structured results. Rebuild after a bootstrap/recipe
change with `node runtime/python/setup.mjs`. Never trust an old mutable tag.

Preloaded learner libraries: ast, collections, csv, datetime, functools, io,
itertools, json, math, pathlib, random, re, statistics, struct and their standard
library dependencies. Python builtins work normally inside the OS sandbox;
`os`/`ctypes` introspection does not bypass that boundary. The in-memory module
cache is an explicit environment, not a full installed Python filesystem.
Other imports can be unavailable. NumPy, Pandas, pytest, pip and an external
AI model are unavailable; the lab does not imply support for those stages.

No learner-selected interpreter, image, package, dependency resolver or mutable
pip environment. No environment/config copied from the host. Hash seed is 0;
randomness must be explicitly seeded by reproducible tasks. Time/OS randomness
are not treated as deterministic truth. Files and stdin are declared inputs.

PYTHON02's supported-minor field remains unbound: this provider identity is a
runtime contract, not an edit to academic truth. Official evidence is disabled
until a separately governed official assessment/task store exists.

## Hosted gate and profile identity

There is no learner interpreter enabled in the hosted product. `runtimeProfileId=python04-stdlib-v1` denotes the local candidate only. Uncontrolled learner `pip install` is prohibited. The default companion denies execution; `--acceptance` is an explicit local verification harness, not release authorization.
