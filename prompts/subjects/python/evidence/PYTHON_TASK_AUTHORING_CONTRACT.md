# PYTHON05 TASK AUTHORING CONTRACT
Status: ACTIVE

Normal coding task creation must not require editing learner renderer source.

The authoring surface at `subjects/programming/editor.html` supports:
1. prompt/starter/competency;
2. governed runtime choice;
3. practice or assessment-preview mode;
4. timeout within provider policy;
5. public tests;
6. hidden author-only tests;
7. hint ladder;
8. validation;
9. sandbox starter preview;
10. separate public and secure exports.

Lifecycle authority remains shared:
`DRAFT → VALIDATE → REVIEW → PREVIEW → APPROVE → ACTIVATE`.

Preview is sandbox execution only. It does not write mastery or official attempts. Hidden material belongs to the trusted author/server boundary and is excluded from learner catalog and learner-facing responses.
