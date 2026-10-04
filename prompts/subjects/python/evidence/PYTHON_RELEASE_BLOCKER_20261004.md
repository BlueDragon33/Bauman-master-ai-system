# PYTHON RELEASE BLOCKER — 2026-10-04

Status: **EXTERNAL CREDENTIAL PERMISSION BLOCKER**

Approved one-time release workflow run `37209439349` successfully validated the one-time release request and deployed the Control preview. It then failed at **Deploy Learning Runtime preview** when Wrangler attempted the Cloudflare Containers API endpoint:

`/accounts/<account>/containers/me`

The container image itself built successfully before that API call. Production was skipped.

## Required external correction

The Cloudflare deployment API token stored for the Bauman preview/production environments must include the account-scoped permission required to manage Containers: **Workers Containers Write / Containers Edit**. Existing Workers/D1 permissions are not sufficient for a Worker deployment that includes a Container binding/image.

## Retry rule

Do not reuse the failed release SHA after post-P6 hardening merges. Retry from the final merged `main` revision:

1. exact Preview deploy;
2. verify exact runtime revision, Python execution enabled, runtime profile `cpython-3.14.8-stdlib-v1`;
3. only then Production with explicit `DEPLOY_PRODUCTION`;
4. require Python production smoke and existing whole-system release closure.

Until this credential permission is corrected, production publication remains blocked and no STABLE claim is valid.
