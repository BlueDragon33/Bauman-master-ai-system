# Russian Engine RE19 — Content Pack Compiler & Registry

State: VALIDATING

## Purpose

Turn validated content packs into immutable versioned manifests that can be installed and rolled back without feature-code edits.

## Compiler

Input:
- RE15-valid pack;
- known competency index;
- known linguistic refs;
- minimum Engine API.

Output:
- pack ID + revision;
- deterministic content hash;
- item index;
- competency index;
- level ranges;
- capability requirements;
- lazy resource refs;
- offline preload refs;
- provenance summary;
- commercial eligibility.

The deterministic hash is a change detector, not a cryptographic signature.

## Commercial eligibility

commercialRequested and commercialEligible are distinct.

Eligibility requires:
- commercial pack flag;
- every item at trusted provenance state;
- every media object explicitly commercial-use allowed.

Payment/billing is outside this contract.

## Registry

The registry supports:
- multiple installed revisions;
- exact revision lookup;
- active revision;
- rollback;
- duplicate install idempotency;
- same revision/different hash conflict rejection.

## Exit gate

PASS when multiple revisions coexist, active revision is deterministic, rollback works, hash conflict fails closed and commercial eligibility reflects content trust/rights.
