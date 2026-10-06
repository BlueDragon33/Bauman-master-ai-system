import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createReferenceGraph,validateReferenceGraph} from '../knowledge/reference-graph.mjs';

const read=url=>JSON.parse(fs.readFileSync(url,'utf8'));
const graph=read(new URL('../content/graph/reference-graph.v1.json',import.meta.url));
const grammar=read(new URL('../../data/grammar.json',import.meta.url));
const scenarios=read(new URL('../../data/scenario-registry.json',import.meta.url));
const fixtures=read(new URL('../content/fixtures/grounded-scenes.v1.json',import.meta.url));
const levels=read(new URL('../content/levels/levels.v1.json',import.meta.url));

const canonicalIndex={
 'subjects/russian/data/grammar.json':new Set(grammar.map(x=>x.id)),
 'subjects/russian/data/scenario-registry.json':new Set((scenarios.scenarios||[]).map(x=>x.id))
};
const contentIndex={
 'subjects/russian/engine/content/fixtures/grounded-scenes.v1.json':new Set(fixtures.scenes.map(x=>x.sceneId)),
 'subjects/russian/engine/content/levels/levels.v1.json':new Set(levels.levels.map(x=>x.id))
};

const validation=validateReferenceGraph(graph,{canonicalIndex,contentIndex});
assert.equal(validation.ok,true,validation.errors.join('; '));

const runtime=createReferenceGraph(graph,{canonicalIndex,contentIndex});
assert.equal(runtime.nodeCount,11);
assert.equal(runtime.edgeCount,9);

const requestSources=runtime.experienceSources('SEM-REQUEST-OBJECT');
assert.equal(requestSources.length,2);
assert.deepEqual(requestSources.map(x=>x.id).sort(),['grounded-give-ball-a','grounded-give-book-b']);

const repairDeps=runtime.canonicalDependencies('SEM-REPAIR-COMMUNICATION');
assert.equal(repairDeps.length,2);
assert(repairDeps.every(x=>x.kind==='canonical-ref'));
assert(repairDeps.some(x=>x.canonicalRef.id==='P11-ADMIN-RECEPTION'));
assert(repairDeps.some(x=>x.canonicalRef.id==='P11-LIFE-ROOMMATE'));

const needDeps=runtime.canonicalDependencies('SEM-NEED-REQUEST-PERMISSION');
assert.equal(needDeps.length,1);
assert.equal(needDeps[0].canonicalRef.id,'GR006');

for(const node of graph.nodes.filter(x=>x.kind==='canonical-ref')){
 assert(!Object.hasOwn(node,'text'));
 assert(!Object.hasOwn(node,'russian'));
 assert(node.canonicalRef.ownerPath);
 assert(node.canonicalRef.id);
}

console.log(JSON.stringify({ok:true,nodes:runtime.nodeCount,edges:runtime.edgeCount,requestExperienceSources:requestSources.length,canonicalRepairDependencies:repairDeps.length,copiedCanonicalRussianText:0}));
