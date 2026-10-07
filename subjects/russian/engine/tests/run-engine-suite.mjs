const tests=[
  'test-re01-contracts.mjs',
  'test-re02-grounded-scene.mjs',
  'test-re03-level-catalog.mjs',
  'test-re04-reference-graph.mjs',
  'test-re05-speech-adapter.mjs',
  'test-re06-learner-adaptive.mjs',
  'test-re07-commercial-scale.mjs',
  'test-re08-quality-gate.mjs',
  'test-re09-browser-bootstrap.mjs',
  'test-re09s1-grounded-browser-model.mjs'
];

for(const file of tests){
  await import(new URL(file,import.meta.url));
}

console.log(JSON.stringify({
  ok:true,
  suite:'RUSSIAN_ENGINE_FAST_SUITE_V1',
  tests:tests.length
}));
