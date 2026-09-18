import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const inv=JSON.parse(fs.readFileSync('recovery/roadmap-v2/r2c0-admission-audit.v1.json','utf8'));
assert.equal(inv.schema,'BAUMAN_ROADMAP_V2_R2C0_ADMISSION_AUDIT_V1');
assert.equal(inv.phase,'L27R2C0_TOOLCHAIN_DATA_TEST_ADMISSION_AUDIT');
assert.equal(inv.status,'audit_only_no_new_canonical_files');
assert.equal(inv.historical.terminalRound,27);
assert.equal(inv.historical.terminalStep,108);

const canonicalGroups=[
 inv.categories.alreadyAdmittedR2B.files,
 inv.categories.portableEngineCandidates.files,
 inv.categories.portableToolCandidates.files,
 inv.categories.staleHashPinnedManifests.files,
 inv.categories.baselineBoundGeneratedArtifacts.files,
 inv.categories.deferredStructuralSchemas.files,
 inv.categories.historicalStateAndSpec.files
];
const flattened=canonicalGroups.flat();
assert.equal(flattened.length,75);
assert.equal(new Set(flattened).size,75,'R2C0 canonical classifications overlap');
assert.equal(inv.invariants.roadmapCanonicalHistoricalFileCount,75);
assert.equal(inv.invariants.categorizedCanonicalHistoricalFileCount,75);
assert.equal(inv.invariants.generatedArtifactsMayBeCopiedToCanonicalNow,false);
assert.equal(inv.invariants.oldManifestsMayBeCopiedToCanonicalNow,false);
assert.equal(inv.invariants.oldMigrationContractMayBeCopiedToCanonicalNow,false);
assert.equal(inv.invariants.runtimeActivationAllowed,false);
assert.equal(inv.invariants.uiChangesAllowed,false);

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const actual=walk('roadmap_v2').sort();
const approved=[...inv.categories.alreadyAdmittedR2B.files].sort();
assert.deepEqual(actual,approved,'R2C0 must not add canonical Roadmap files');

assert.equal(inv.categories.staleHashPinnedManifests.count,7);
assert.equal(inv.categories.baselineBoundGeneratedArtifacts.count,24);
assert.equal(inv.categories.portableEngineCandidates.count,7);
assert.equal(inv.categories.portableToolCandidates.count,8);
assert.equal(inv.categories.historicalTestHarnessCandidates.count,7);
assert.equal(inv.proposedSubrounds[0].status,'in_progress');
assert.equal(inv.proposedSubrounds.slice(1).every(x=>String(x.status).startsWith('blocked_on_')),true);

console.log('ROADMAP_V2_L27R2C0_ADMISSION_AUDIT=PASS');
console.log(JSON.stringify({canonicalHistorical:75,currentCanonical:actual.length,quarantinedManifests:7,quarantinedGenerated:24},null,2));
