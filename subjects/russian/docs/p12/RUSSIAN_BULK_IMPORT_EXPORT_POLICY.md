# Russian P12 Bulk Import / Export Policy

Bulk operations are **staging operations**, never direct canonical overwrites.

## Import
- maximum declared batch: 500 candidate items;
- every item resolves its P3 canonical owner independently;
- duplicate candidate/revision pairs fail closed;
- invalid or derived-only owners are rejected;
- generated content remains non-canonical;
- each item retains source references, content hash, rollback note and diff summary.

## Export
Exports may include candidate metadata and proposed payload files for review, but must not convert derived caches into fact owners.

## Promotion
A batch may be reviewed together for convenience, but canonical promotion remains item-addressable and rollbackable by canonical ID.
