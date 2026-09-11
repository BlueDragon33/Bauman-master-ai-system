import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { collectProtectedFingerprints, validateAcademicBaseline } from './validate-repository-baseline.mjs';

const before = collectProtectedFingerprints();
const academicBefore = validateAcademicBaseline();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bauman-roadmap-v2-'));
const output = path.join(tempRoot, 'roadmap_v2');

try {
  const run = spawnSync(process.execPath, ['scripts/dry-run-roadmap-migration.mjs', '--output', output], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  if (run.status !== 0) throw new Error(`Dry-run failed: ${run.stderr || run.stdout}`);
  const receipt = JSON.parse(fs.readFileSync(path.join(output, 'migration_receipt.json'), 'utf8'));
  if (receipt.status !== 'PASS_B78') throw new Error('Dry-run receipt is not PASS_B78');
  if (receipt.legacyMutationCount !== 0 || receipt.runtimeMutationCount !== 0) throw new Error('Dry-run reported a forbidden mutation');

  fs.rmSync(tempRoot, { recursive: true, force: true });
  if (fs.existsSync(tempRoot)) throw new Error('Temporary sidecar rollback failed');

  const after = collectProtectedFingerprints();
  const academicAfter = validateAcademicBaseline();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Protected fingerprints changed across dry-run/rollback');
  if (JSON.stringify(academicBefore) !== JSON.stringify(academicAfter)) throw new Error('Academic baseline changed across dry-run/rollback');

  console.log(JSON.stringify({
    status: 'PASS_B79',
    protectedFingerprintsBefore: Object.keys(before).length,
    protectedFingerprintsAfter: Object.keys(after).length,
    academicInvariant: true,
    temporarySidecarRemoved: true,
    legacyMutationCount: 0,
    runtimeMutationCount: 0
  }));
} finally {
  if (fs.existsSync(tempRoot)) fs.rmSync(tempRoot, { recursive: true, force: true });
}

