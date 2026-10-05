import assert from "node:assert/strict";
import fs from "node:fs";

const preview=fs.readFileSync(".github/workflows/deploy-bauman-preview.yml","utf8");
const production=fs.readFileSync(".github/workflows/deploy-bauman-production.yml","utf8");
const orchestration=fs.readFileSync(".github/workflows/python-approved-release.yml","utf8");

assert.match(preview,/workflow_call:/);
assert.match(production,/workflow_call:/);
assert.match(production,/confirm:/);
assert.match(production,/DEPLOY_PRODUCTION/);

const requestMatch=orchestration.match(/REQUEST="(\.github\/release-requests\/python-(\d{8})-r(\d+)\.json)"/);
assert.ok(requestMatch,"approved release workflow must bind one explicit add-only Python release request");
const requestPath=requestMatch[1];
assert.ok(fs.existsSync(requestPath),"bound approved release request is missing: "+requestPath);
const request=JSON.parse(fs.readFileSync(requestPath,"utf8"));

assert.equal(request.schema,"PYTHON_APPROVED_RELEASE_REQUEST_V1");
assert.equal(request.status,"APPROVED_ONE_TIME");
assert.equal(request.oneTime,true);
assert.equal(request.confirm,"DEPLOY_PRODUCTION");
assert.equal(request.activationMergeSha,"04cf1978198ee90a47dc61698ad70aec011a78bc");
assert.equal(request.sourceP6MergeSha,"23e594b7f6a62d45fdad9f2669866f1410d2db6f");
assert.equal(request.runtimeProfile,"cpython-3.14.8-stdlib-v1");
assert.equal(request.provider,"cloudflare-container-durable-object-v1");

const date=requestMatch[2];
const retry=requestMatch[3];
const expectedReleaseId=`python-runtime-${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}-r${retry}`;
assert.equal(request.releaseId,expectedReleaseId,"request filename and releaseId must encode the same one-time release identity");

assert.match(orchestration,/push:/);
assert.match(orchestration,/branches: \[main\]/);
assert.match(orchestration,/fetch-depth: 0/);
assert.ok(orchestration.includes(`- "${requestPath}"`),"push path must bind the same request file");
assert.ok(orchestration.includes(`fs.readFileSync('${requestPath}','utf8')`),"authorization must read the same request file");
assert.ok(orchestration.includes(`if(r.releaseId!=='${request.releaseId}')`),"authorization must bind the exact request releaseId");
assert.match(orchestration,/--diff-filter=A/);
assert.match(orchestration,/git merge-base --is-ancestor 04cf1978198ee90a47dc61698ad70aec011a78bc/);
assert.match(orchestration,/uses: \.\/\.github\/workflows\/deploy-bauman-preview\.yml/);
assert.match(orchestration,/needs: preview/);
assert.match(orchestration,/uses: \.\/\.github\/workflows\/deploy-bauman-production\.yml/);
assert.match(orchestration,/confirm: DEPLOY_PRODUCTION/);
assert.match(orchestration,/statuses: write/);
assert.match(orchestration,/python\/release-publish/);
assert.match(orchestration,/actions\/runs\/\$GITHUB_RUN_ID/);
assert.match(orchestration,/\\\"state\\\":\\\"success\\\"/);
assert.match(orchestration,/\\\"state\\\":\\\"failure\\\"/);

console.log(JSON.stringify({
  ok:true,
  requestPath,
  releaseId:request.releaseId,
  addOnly:true,
  exactPreviewThenProduction:true
}));
