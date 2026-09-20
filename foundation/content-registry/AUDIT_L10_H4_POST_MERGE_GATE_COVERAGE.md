# Foundation L10 H4 — Post-merge gate coverage

## Defect class

Post-merge verification coverage gap.

The L10 freeze head passed the required six promotion gates before merge. After PR #58 merged to `main`, five push workflows started, but **Foundation Domain Model Gate** did not run because its push trigger was still restricted to the historical L9 work branch.

## Hardening

The Foundation Domain Model workflow now:

- continues to validate the historical L9 branch;
- validates pushes to `main`;
- validates this H4 hardening branch;
- applies the same path scope on push that was already used for pull requests.

No Foundation runtime, L9 contract, L10 registry contract, learner state, subject runtime, storage, or deployment authority is changed.

## Acceptance

H4 is complete only when the same H4 head passes:

1. Content Asset Provenance Gate;
2. Foundation Domain Model Gate;
3. Academic 2026 Prerequisite Gate;
4. Windows checkout safety;
5. Bauman Cloudflare Preview CI;
6. Whole System Integration Gate.

After merge, the resulting `main` commit must again trigger and pass the same six-gate set.

## Safety

This is CI coverage hardening only. It does not reopen L10 architecture or enable deferred runtime integration.

## H4-F1 — trigger YAML structure repair

The first H4 edit accidentally concatenated the final push-path entry with the `pull_request:` key, preventing GitHub from recognizing the Foundation workflow. The malformed boundary was repaired without changing job logic or validation assertions.

Acceptance remains the same six-gate set on one head.
