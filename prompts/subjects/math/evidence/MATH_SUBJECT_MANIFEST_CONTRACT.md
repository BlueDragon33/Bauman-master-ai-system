# MATH SUBJECT MANIFEST CONTRACT

Owner: MATH05 · Status: ACTIVE

Math remains a Subject Factory package inside the shared Bauman shell.

Required manifest semantics:
- stable `subjectId=math`, title/icon and existing route aliases;
- canonical curriculum/content source references;
- declared learner surfaces and supported content blocks;
- MATH04 capability IDs, never provider-private function names;
- offline classification and localization metadata;
- authoring schemas and lifecycle state;
- search/index metadata;
- existing host bridge / planning bridge contracts.

The manifest MUST NOT own global navigation, theme, notifications, auth, generic progress or mastery.

Stable learner identity and existing stage/chapter/lesson IDs must survive migration. New capability metadata is additive.
