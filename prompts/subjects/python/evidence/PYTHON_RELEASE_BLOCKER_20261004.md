# PYTHON RELEASE BLOCKER — 2026-10-04

Status: **EXTERNAL CREDENTIAL PERMISSION BLOCKER — RECONFIRMED AFTER R3**

Latest exact release revision: `f9b9428a6839f2ec838f0e46ce6c57e2bea5c098`

Latest approved one-time release workflow: `37216104758`

## What is already proven

The r3 release fixed the previous repository-side authorization defect:

- one-time release authorization: PASS;
- exact activation ancestry check: PASS;
- Control preview packaging: PASS;
- preview D1 migration step: PASS;
- Control preview deployment: PASS;
- Python sandbox Docker image build: PASS.

The release then failed at **Deploy Learning Runtime preview** when Wrangler called the Cloudflare Containers endpoint:

`/accounts/<account>/containers/me`

The image build completed successfully before that call. Preview runtime activation verification did not run, and production was skipped.

This reconfirms that the remaining blocker is outside repository code.

## Repository-side defects already closed

1. r2 authorization failed because the release workflow used a shallow checkout (`fetch-depth: 2`) while validating the pinned activation ancestor.
2. PR #269 changed authorization checkout to `fetch-depth: 0`, added an r3 add-only release request, and locked the fix in the release contract.
3. Release Activation CI, Development Fast CI, and Universal Constitution Compliance all passed before merge.
4. r3 authorization passed on merged main and reached the real Cloudflare runtime deployment step.

## Required external correction

Update the Cloudflare deployment API token stored in the GitHub environments used by Bauman preview/production so it includes the account-scoped Containers management permission required by the current Wrangler/Containers API.

The token must retain the permissions already required for Workers/D1 deployment and additionally allow management of Workers Containers for the target account.

Do not place this token in source code, prompt files, logs, or runtime sandbox environment variables.

## Retry rule after credential repair

Create a new add-only one-time approved release request from the then-current merged `main` revision and run:

1. exact Preview deploy;
2. exact revision verification;
3. Python runtime activation verification;
4. runtime profile verification: `cpython-3.14.8-stdlib-v1`;
5. production deploy only after preview PASS with explicit `DEPLOY_PRODUCTION`;
6. Python production smoke plus existing whole-system release closure.

Do not reuse r1, r2, or r3 as a new authorization request.

## Stop rule

Until the Cloudflare token permission is corrected and a fresh exact-revision preview + production sequence passes:

- Python prompt implementation remains RC-complete but publication-incomplete;
- no production STABLE claim is valid;
- do not start the next subject prompt under the repository's ONE_SUBJECT_AT_A_TIME rule.

This is a fail-closed external release blocker, not a reason to weaken the container runtime or bypass the release gate.
