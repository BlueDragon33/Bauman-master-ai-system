# PYTHON RUNTIME ENVIRONMENT POLICY

Status: **UNBOUND UNTIL SANDBOX IMAGE IS DEPLOYABLE**

Official evidence must reference an immutable environment identity.

Required identity:
- provider kind/version;
- container image digest;
- exact CPython version;
- OS/base image identity;
- curated package lock/profile hash;
- task-visible package list;
- execution policy version.

Do not record "latest" as official runtime identity.

## Profiles

`python-core`
- standard library;
- project test harness;
- no learner package installation;
- network denied.

`python-data` (optional)
- `python-core` plus explicitly pinned NumPy/Pandas packages only when curriculum/task requires them;
- statistics/ML/database theory remains externally owned.

Exact Python/package versions are intentionally not selected until the image can be built and tested on the authorized provider. Once selected, changes require new environment ID and revalidation of version-sensitive fixtures.

## Reproducibility

Official run = clean workspace + immutable image/profile + declared files/stdin/seed + task/test revision. Package download during an official run is prohibited.

Exploration sessions may be longer lived, but their outputs are not automatically reproducible official evidence.
