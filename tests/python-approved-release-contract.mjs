import assert from "node:assert/strict";
import fs from "node:fs";

const preview=fs.readFileSync(".github/workflows/deploy-bauman-preview.yml","utf8");
const production=fs.readFileSync(".github/workflows/deploy-bauman-production.yml","utf8");
const orchestration=fs.readFileSync(".github/workflows/python-approved-release.yml","utf8");
const request=JSON.parse(fs.readFileSync(".github/release-requests/python-20261004.json","utf8"));

assert.match(preview,/workflow_call:/);
assert.match(production,/workflow_call:/);
assert.match(production,/confirm:/);
assert.match(production,/DEPLOY_PRODUCTION/);

assert.equal(request.schema,"PYTHON_APPROVED_RELEASE_REQUEST_V1");
assert.equal(request.status,"APPROVED_ONE_TIME");
assert.equal(request.oneTime,true);
assert.equal(request.confirm,"DEPLOY_PRODUCTION");
assert.equal(request.activationMergeSha,"04cf1978198ee90a47dc61698ad70aec011a78bc");

assert.match(orchestration,/push:/);
assert.match(orchestration,/branches: \[main\]/);
assert.match(orchestration,/python-20261004\.json/);
assert.match(orchestration,/--diff-filter=A/);
assert.match(orchestration,/git merge-base --is-ancestor 04cf1978198ee90a47dc61698ad70aec011a78bc/);
assert.match(orchestration,/uses: \.\/\.github\/workflows\/deploy-bauman-preview\.yml/);
assert.match(orchestration,/needs: preview/);
assert.match(orchestration,/uses: \.\/\.github\/workflows\/deploy-bauman-production\.yml/);
assert.match(orchestration,/confirm: DEPLOY_PRODUCTION/);
assert.match(orchestration,/statuses: write/);
assert.match(orchestration,/python\/release-publish/);
assert.match(orchestration,/"state":"success"/);
assert.match(orchestration,/"state":"failure"/);
console.log("PYTHON_APPROVED_RELEASE_CONTRACT=PASS");
