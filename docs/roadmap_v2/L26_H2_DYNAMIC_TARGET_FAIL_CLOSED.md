# L26-H2 — Dynamic target fail-closed boundary

Status: `ACTIVE_WITH_B102`

## Architecture gap

Current Consumer Blueprint intentionally keeps these dynamic chapters blocked with `DYNAMIC_INSTANCE_REQUIRED`:

- `RU-R4-C09`
- `RU-R4-C10`
- `CUR-L4-C01` … `CUR-L4-C06`

Priority V2 accepts only current materialized Consumer Blueprint chapter/lesson knowledge targets. Therefore B102 must not revive the historical behavior that treated an uninstantiated `CUR-L4-*` identifier as schedulable.

## Rule

A verified Current Bauman source is provenance, not target admission.

Until a real syllabus/course instance is separately admitted:

- uninstantiated dynamic target IDs fail closed;
- Scheduler never bypasses Priority V2 target validation;
- Current Bauman override may prioritize a current-official-source item whose **knowledge target is already admitted** by Priority V2;
- this supports previewing/prioritizing known prerequisites from a real current syllabus without claiming that the dynamic course template itself has been instantiated.

## B102 implementation

`scripts/roadmap-v2-scheduler-harness.mjs` checks `blockedDynamicTargets` before Priority scoring and raises:

`Dynamic Scheduler target requires real syllabus instance`

The B102 gate also proves that a verified current source can override weighted Priority for an admitted static prerequisite target while `CUR-L4-C03` remains rejected.

## Safety

This hardening does not instantiate a course, create syllabus content, write a schedule, connect a calendar or activate runtime.
