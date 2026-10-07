# RE24 — APP OWNER COMPATIBILITY DRY RUN

Owners: RU04 + RU08 + C3

Mission: inspect current Russian app owners and prove whether Engine can integrate before any outside-Engine write.

Inspect:
- RussianAssessmentMastery API/schema;
- RussianAdaptivePlanner API/schema/reasons;
- browser bootstrap owner presence;
- speech providers;
- service worker/offline availability.

Output:
READY / PARTIAL / BLOCKED plus exact missing seams.

No mutation.

PASS when current app can be evaluated deterministically and missing integration seams are listed precisely.
