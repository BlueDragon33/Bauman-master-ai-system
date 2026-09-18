import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateData,validateRuntime} from '../scripts/validate-russian-cyrillic-sound-letter.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/cyrillic-sound-letter-contract.v1.json','utf8'));
const data=JSON.parse(fs.readFileSync('subjects/russian/data/cyrillic-sound-map.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateData(data,c),true);
assert.equal(validateRuntime(js,index),true);

{const x=copy();x.audio.answerRequiresListenInSoundToLetter=false;assert.throws(()=>validateContract(x),/must require a listening event/)}
{const x=structuredClone(data);x.entries[0].meaning_vi='a';assert.throws(()=>validateData(x,c),/prohibited semantic field/)}
{const x=structuredClone(data);x.entries.pop();assert.throws(()=>validateData(x,c),/Expected 33 sound rows/)}
assert.throws(()=>validateRuntime(js.replace("u.lang='ru-RU'","u.lang='en-US'"),index),/not pinned to ru-RU/);

console.log('RUSSIAN_CYRILLIC_SOUND_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
