// Server-side proxy to the existing BourgeoisAI inference service.
// No model credentials are stored in this public repository.
const buckets = new Map();
const MAX_REQUESTS = 12;
const WINDOW_MS = 60 * 60 * 1000;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'POST required'});
  const host = String(req.headers.host || '').toLowerCase().split(':')[0];
  const origin = String(req.headers.origin || '');
  if (origin) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      if (originHost !== host && !originHost.endsWith('.vercel.app')) return res.status(403).json({error:'Origin denied'});
    } catch { return res.status(403).json({error:'Invalid origin'}); }
  }
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0,64);
  const now = Date.now();
  for (const [key, value] of buckets) if (now-value.start>WINDOW_MS) buckets.delete(key);
  const bucket = buckets.get(ip) || {start:now,count:0};
  if (bucket.count>=MAX_REQUESTS) return res.status(429).json({error:'Demo hourly limit reached'});
  bucket.count++;
  buckets.set(ip,bucket);
  const body = typeof req.body==='string' ? (()=>{try{return JSON.parse(req.body)}catch{return null}})() : req.body;
  if (!body || typeof body.prompt !== 'string' || body.prompt.length<1 || body.prompt.length>16000) {
    return res.status(400).json({error:'Invalid prompt length'});
  }
  const upstream = process.env.BOURGEOISAI_INFERENCE_URL || 'https://www.bourgeoisai.com/api/inference';
  let url;
  try { url = new URL(upstream); } catch { return res.status(503).json({error:'Inference endpoint not configured'}); }
  if (url.protocol!=='https:' || !['www.bourgeoisai.com','bourgeoisai.com'].includes(url.hostname) || url.pathname!=='/api/inference') {
    return res.status(503).json({error:'Inference upstream is not allowlisted'});
  }
  try {
    const headers = {'content-type':'application/json'};
    if (process.env.BOURGEOISAI_INFERENCE_TOKEN) headers.authorization='Bearer '+process.env.BOURGEOISAI_INFERENCE_TOKEN;
    const response = await fetch(url, {method:'POST',headers,body:JSON.stringify({prompt:body.prompt,research:false,orchestration:'quality'}),signal:AbortSignal.timeout(45000)});
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { return res.status(502).json({error:'Inference upstream returned invalid JSON'}); }
    if (!response.ok) return res.status(response.status===429?429:502).json({error:'Inference unavailable',upstreamStatus:response.status});
    return res.status(200).json({text:data.text||data.answer||data.output||''});
  } catch { return res.status(502).json({error:'Inference upstream connection failed'}); }
}
