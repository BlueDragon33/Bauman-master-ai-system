# L23-H1-F1 — Remove canonical-tree freeze from historical recovery gates

## Trigger

Roadmap V2 Current Gate run `35331606707` failed after the current Consumer Blueprint was admitted.

The failure came from the historical classification validator, which still required the canonical `roadmap_v2/**` tree to equal the 23-file L22 static snapshot exactly.

## Root cause

Three historical recovery validators still contained phase-local assumptions:

- historical classification required no later canonical files;
- legacy toolchain review required exact equality with the old static tree;
- recovery scanner validation inferred “no mutation” by requiring the current tree to equal the old tree.

Those rules were valid only during the old recovery phase and would reject every legitimate current-track addition.

## Fix

### Historical classification

Now verifies durable quarantine boundaries instead:

- all 23 historical static baseline paths still exist;
- stale historical manifests remain absent;
- historical migration contract/mapping remain absent;
- old baseline/data/report namespaces remain quarantined;
- canonical Roadmap contains no executable/UI files.

### Legacy toolchain quarantine

Historical tools/engines are rejected only if the exact historical executable blob is re-admitted unchanged. New current-track implementations may later occupy a path only after their own gate.

### Recovery scanner safety

The scanner now snapshots every canonical Roadmap file and SHA-256 **before and after** execution. PASS requires the snapshots to be identical.

## Safety

This repair does not relax current-track ownership. New canonical artifacts must still pass their own L23/Bxx or L23-Hx gate.
