import crypto from 'node:crypto';

// Dedicated, fail-closed demo gateway. Never place credentials in browser code.
const MAX_BODY_BYTES=20000;
const MAX_PROMPT_CHARS=12000;
const MINUTE_LIMIT=10;
const DAY_LIMIT=30;
const UPSTREAM='https://www.bourgeoisai.com/api/inference';
const json=(res,status,payload)=>res.status(status).setHeader('Cache-Control','no-store').json(payload);
const getIp=req=>{
  // x-real-ip is supplied by Vercel's trusted proxy. Do not accept arbitrary
  // x-forwarded-for chains as a client identity.
  const raw=String(req.headers['x-real-ip']||'');
  return /^([\da-fA-F:.]+)$/.test(raw)&&raw.length<80?raw:'';
};
async function consume(url,token,key,limit,windowSec){
  const response=await fetch(url+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify([['INCR',key],['EXPIRE',key,windowSec,'NX']]),signal:AbortSignal.timeout(4000)});
  if(!response.ok)throw new Error('Quota store unavailable');
  const data=await response.json();
  const count=Number(data?.[0]?.result);
  if(!Number.isFinite(count))throw new Error('Quota store invalid response');
  return count<=limit;
}
export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'POST required'});
  const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
  if(!url||!token)return json(res,503,{error:'Demo quota service not configured'});
  const ip=getIp(req);
  if(!ip)return json(res,403,{error:'Client identity unavailable'});
  const bytes=Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body||{}));
  if(bytes>MAX_BODY_BYTES)return json(res,413,{error:'Request too large'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body}catch{return json(res,400,{error:'Invalid JSON'})}
  if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.prompt!=='string'||body.prompt.length<1||body.prompt.length>MAX_PROMPT_CHARS)return json(res,400,{error:'Invalid prompt'});
  if(body.research!==false||body.orchestration!=='quality'||Object.keys(body).some(k=>!['prompt','research','orchestration'].includes(k)))return json(res,400,{error:'Unsupported demo request'});
  const identity=crypto.createHash('sha256').update(ip).digest('hex');
  const minute=Math.floor(Date.now()/60000),day=Math.floor(Date.now()/86400000);
  try{
    // Both windows are consumed before upstream; Redis errors fail closed.
    const minuteOk=await consume(url,token,'demo:v1:m:'+identity+':'+minute,MINUTE_LIMIT,120);
    const dayOk=await consume(url,token,'demo:v1:d:'+identity+':'+day,DAY_LIMIT,172800);
    if(!minuteOk||!dayOk){res.setHeader('Retry-After',minuteOk?'3600':'60');return json(res,429,{error:'Demo quota reached. Please try again later.'})}
  }catch{return json(res,503,{error:'Demo quota temporarily unavailable'})}
  try{
    const upstream=await fetch(UPSTREAM,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
    const text=await upstream.text();
    if(text.length>100000)return json(res,502,{error:'Inference response too large'});
    let payload;try{payload=JSON.parse(text)}catch{return json(res,502,{error:'Inference service returned an invalid response'})}
    return json(res,upstream.status,payload);
  }catch{return json(res,502,{error:'Inference service unavailable'})}
}
