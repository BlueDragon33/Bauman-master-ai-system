# DB04 Input Contract

Status: **DATABASE REASONING & ASSESSMENT CONTRACT LOCKED**

DB04 implements capabilities without redefining DB02/DB03 truth.

It must provide:
- isolated SQL execution;
- deterministic/resettable fixtures;
- structured result rows with NULL/multiplicity/order preserved;
- schema-state checks for DDL/DML;
- deterministic transaction simulation;
- engine-profile versioning;
- index/query-plan evidence;
- bounded AI tutor.

Security:
- never use control-service preview/production D1;
- no production credentials;
- resource/time/network/file/extension restrictions;
- hidden fixture/solution isolation;
- fail-closed provider errors.

With a real provider connected:
- all correct golden alternatives must pass;
- every wrong golden must fail for its mapped semantics;
- engine deviations live in DatabaseEngineProfile, not DB02 canonical truth.
