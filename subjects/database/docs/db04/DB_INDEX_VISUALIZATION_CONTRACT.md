# DB04 Index Visualization Contract

Capability: `db.index.visualize`

Visualization may show:
- key columns/order;
- logical search path;
- selectivity intuition;
- composite left-prefix behavior when profile supports it;
- read benefit vs write/storage maintenance trade-off.

Algorithms remains owner of generic B-tree/hash mechanics.

Database visualization must not claim:
- exact physical page layout without engine evidence;
- index use merely because an index exists;
- "add index = faster" as a universal rule.

Any engine-specific claim carries engine profile + version + source/provenance.
