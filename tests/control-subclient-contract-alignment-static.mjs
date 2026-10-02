import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract=JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const source=fs.readFileSync('control-service/src/index.ts','utf8');

const block=source.match(/const SUBCLIENTS = \[(.*?)\] as const;/s);
assert.ok(block,'Control SUBCLIENTS block missing');

const ids=[...block[1].matchAll(/id:\s*"([^"]+)"/g)].map(m=>m[1]);
const contractIds=(contract.subclients??[]).map(x=>x.id);

assert.deepEqual(ids,contractIds,'Control-service SUBCLIENTS drifted from application-management.contract.json order/IDs');

for(const item of contract.subclients??[]){
  assert.ok(source.includes(`id: "${item.id}"`),item.id+': control subclient missing');
  if(item.sourcePath){
    assert.ok(source.includes(`sourcePath: "${item.sourcePath}"`),item.id+': control sourcePath mismatch');
  }
  assert.ok(source.includes(`name: "${item.name}"`),item.id+': control name mismatch');
}

console.log(JSON.stringify({
  gate:'CONTROL_SUBCLIENT_CONTRACT_ALIGNMENT',
  status:'PASS',
  count:contractIds.length,
  ids:contractIds
},null,2));
