# DB04 Security Boundary

## Protected systems

The following are outside learner SQL trust boundary:
- application/control D1;
- authentication/device/session databases;
- deployment/runtime secrets;
- production data;
- hidden assessment assets.

## Mandatory controls

Before `db.sql.execute` can be enabled:
- dedicated learner provider selected and documented;
- app/control DB bindings impossible from learner query context;
- DDL/DML policy explicit;
- multi-statement policy explicit;
- timeout and row limit enforced;
- resource/memory boundary where provider supports it;
- filesystem/network/admin/extension access blocked or sandboxed;
- deterministic reset proven;
- hidden fixtures withheld from client/AI;
- logs redact secrets and avoid unnecessary query/data dumps.

## Fail-closed

If provider identity, engine profile, fixture revision, reset state or safety policy is unknown, execution must not proceed.

## Explicit prohibition

Do not "temporarily" reuse `control-service` D1 for learning demos.
