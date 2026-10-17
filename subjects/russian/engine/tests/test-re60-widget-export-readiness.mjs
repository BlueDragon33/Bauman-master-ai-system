import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectActualWidgetExportReadiness } from '../mobile/widget-export-readiness.mjs';

const path = fileURLToPath(new URL('../mobile/widget-export-readiness.mjs', import.meta.url));

test('real Bauman canonical RU03 sources block export until separately reviewed', () => {
  const status = inspectActualWidgetExportReadiness();
  assert.equal(status.schemaVersion, 'RUSSIAN_WIDGET_EXPORT_READINESS_V1');
  assert.equal(status.sourceProjectId, 'project:bauman-master-ai-system');
  assert.equal(status.state, 'BLOCKED');
  assert.equal(status.eligibleToExport, false);
  assert.equal(status.qualityGatePass, false);
  assert.equal(status.productionAuthority, false);
  assert(status.blockers.includes('WIDGET_PUBLICATION_RIGHTS_AND_CANDIDATE_BINDINGS_NOT_APPROVED'));
  // As the real corpus changes, this test forces the blocker to be reviewed
  // instead of silently granting release via the presence of verified fields.
});

test('CLI exits with a blocked status and produces no vocabulary artifact', () => {
  const result = spawnSync(process.execPath, [path], {
    encoding: 'utf8',
    cwd: fileURLToPath(new URL('../../../../', import.meta.url)),
    timeout: 8000
  });
  assert.equal(result.status, 2);
  assert.equal(result.stderr, '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.eligibleToExport, false);
  assert.equal(report.qualityGatePass, false);
  assert.equal(report.productionAuthority, false);
  assert(report.blockers.length > 0);
  assert(!('items' in report));
  assert(!('contentRevision' in report));
  assert(!('audio' in report));
});

test('no invented RU03 identities or approvals appear in diagnostic output', () => {
  const report = inspectActualWidgetExportReadiness();
  for (const value of Object.values(report)) {
    assert.equal(typeof value === 'string' && value.includes('APPROVED_BY'), false);
  }
  assert.deepEqual(Object.keys(report).sort(), [
    'blockers', 'eligibleToExport', 'productionAuthority', 'qualityGatePass',
    'schemaVersion', 'sourceProjectId', 'stage', 'state'
  ].sort());
});
