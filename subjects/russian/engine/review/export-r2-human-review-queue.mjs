import fs from 'node:fs';
import {buildR2HumanReviewQueue,verifyR2HumanReviewQueue} from './r2-candidate-human-review-queue.mjs';
const read=url=>JSON.parse(fs.readFileSync(url,'utf8'));
const spatial=read(new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url));
const dialogues=read(new URL('../content/fixtures/repair-dialogues.r1-ai-proposal.json',import.meta.url));
const queue=buildR2HumanReviewQueue(spatial,dialogues);
if(!verifyR2HumanReviewQueue(queue))throw new Error('Invalid RE45 human review queue');
process.stdout.write(JSON.stringify(queue,null,2)+'\n');
