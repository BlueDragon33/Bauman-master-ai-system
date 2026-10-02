# DB01 Duplicate Owner Map

Baseline SHA: `066ef7ce03be4e30f01fd69ae66a1cd859711226`

| Capability / truth | Current owner/evidence | Classification | DB direction |
|---|---|---|---|
| Basic SQL/relational introduction | Programming PR06 | KEEP / REUSE | Reference, do not fork |
| JOIN/GROUP BY/basic index | Programming PR15 | KEEP / REUSE | Reference, then deepen canonically |
| Database prerequisite graph | P6 pack | KEEP / MIGRATE INTO CANONICAL MODEL | DB02 consumes evidence |
| Generic review/exam/remediation state | Programming/shared shell | KEEP SHARED | DB must not create second generic mastery owner |
| Generic JSON authoring | Programming shell | KEEP SHARED | DB05 adds DB-specific schemas through shared authoring |
| SQL execution engine | None proven | MISSING OWNER | DB04 capability owner required |
| Semantic SQL grader | None proven | MISSING OWNER | DB03 owner required |
| Learner schema/fixture registry | None proven | MISSING OWNER | DB02/DB04 split truth/runtime roles |
| Transaction simulator | None proven | MISSING OWNER | DB04 |
| Query-plan parser/visualizer | None proven | MISSING OWNER | DB04 |
| Application D1 schema/migrations | control-service | KEEP / HARD BOUNDARY | Never become learner DB |
| Advanced DB specialization | prompts/subjects/advanced-database | SEPARATE SUBJECT OWNER | DB fundamentals must not absorb it |

## Conclusion

The main issue is not duplicate learner DB engines; it is **missing canonical DB-specific runtime/grader owners plus overlapping introductory content inside Programming**. Reuse existing content and centralize new ownership rather than cloning it.
