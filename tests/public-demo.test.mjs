import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const js=readFileSync('public/assets/agents/agent-governance-lab.js','utf8');
const html=readFileSync('public/index.html','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
test('bounded use-case and inference prompts',()=>{
 assert.match(js,/MAX_USE_CASE_CHARS=2000/);
 assert.match(js,/MAX_INFERENCE_PROMPT_CHARS=12000/);
 assert.match(js,/input.length>MAX_USE_CASE_CHARS/);
 assert.match(js,/prompt.length>MAX_INFERENCE_PROMPT_CHARS/);
});
test('requests are bounded by timeout and no provider key is in browser',()=>{
 assert.match(js,/AbortController/);
 assert.match(js,/INFERENCE_TIMEOUT_MS=45000/);
 assert.doesNotMatch(js,/sk-proj-|SUPABASE_SERVICE_ROLE_KEY|UPSTASH_REDIS_REST_TOKEN/);
});
test('generated outputs are rendered as text, not HTML',()=>{
 assert.match(js,/pre.textContent=text/);
 assert.match(js,/result.textContent=synthesis/);
});
test('public site warns against sensitive data and links to source',()=>{
 assert.match(html,/Do not enter PHI, secrets/);
 assert.match(html,/Bourgeois-Demo/);
});
test('inference proxy only forwards the intended path',()=>{
 assert.equal(vercel.rewrites.length,1);
 assert.equal(vercel.rewrites[0].source,'/api/inference');
 assert.equal(vercel.rewrites[0].destination,'https://www.bourgeoisai.com/api/inference');
});
