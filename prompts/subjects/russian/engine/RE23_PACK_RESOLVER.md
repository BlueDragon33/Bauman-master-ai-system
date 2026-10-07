# RE23 — ACTIVE PACK RESOLVER

Owners: RU03 + RU08 + C1

Mission: resolve exact active pack revision and item refs without loading all content at startup.

Requirements:
- registry active revision is explicit;
- resolver returns packId/revision/contentHash with item ref;
- unknown/inactive revision fails closed;
- minimum Engine API compatibility check;
- capability requirements surfaced before launch;
- offline resource plan returned separately from runtime item;
- no silent fallback to another revision.

PASS when exact revision resolution, rollback resolution and incompatibility failure are deterministic.
