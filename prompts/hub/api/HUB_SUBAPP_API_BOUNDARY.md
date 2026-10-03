# HUB ↔ SUBJECT / SUB-APP API BOUNDARY

## Rule
The Hub may integrate a subject only through public, declared contracts. It must not solve integration by reading subject internals.

Forbidden Hub dependencies:
- prompts/subjects/** as runtime input;
- edits inside subjects/** for a Hub-only fix;
- private subject databases;
- subject localStorage or IndexedDB;
- subject DOM scraping;
- subject-internal mastery/assessment/pedagogy state;
- invented endpoints/capabilities.

## Integration chain
Descriptor → Capability → Launch Adapter → Normalized Hub Read Model.

If a capability does not exist, expose UNAVAILABLE (or an explicit blocker). Do not reverse-engineer a private implementation.

## Normalized learner-facing fields
A Hub projection should preserve provenance/freshness rather than flattening everything to numbers. For a field such as progress/assessment/next action, keep at minimum:
- status: CURRENT | STALE | UNAVAILABLE | LOCAL_HUB;
- value: nullable;
- source/owner identifier;
- asOf or revision when known;
- label/reason when unavailable or stale.

## Authority
Subject mastery and assessment remain subject-owned unless a public capability contract explicitly exports them. Hub local notes, schedule annotations and research checklists may be LOCAL_HUB, but they must never be promoted to official subject mastery/assessment by presentation code.