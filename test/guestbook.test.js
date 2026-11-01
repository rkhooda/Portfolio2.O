import test from 'node:test';
import assert from 'node:assert/strict';
import api from '../api/guestbook.js';

const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
const redisUrl='https://redis.test';
const redisToken='token';

function result(value){return{ok:true,json:async()=>value}}
async function invoke(req,fetchImpl=async()=>result({result:'OK'}),{configured=true,aliases=false}={}){
  globalThis.fetch=fetchImpl;
  if(configured&&!aliases){process.env.KV_REST_API_URL=redisUrl;process.env.KV_REST_API_TOKEN=redisToken}
  else {delete process.env.KV_REST_API_URL;delete process.env.KV_REST_API_TOKEN}
  if(configured&&aliases){process.env.UPSTASH_REDIS_REST_URL=redisUrl;process.env.UPSTASH_REDIS_REST_TOKEN=redisToken}
  else {delete process.env.UPSTASH_REDIS_REST_URL;delete process.env.UPSTASH_REDIS_REST_TOKEN}
  let code=200,body,headers={};
  const res={setHeader:(key,value)=>headers[key]=value,status(n){code=n;return this},json(value){body=value;return this}};
  try{await api(req,res);return{status:code,body,headers}}
  finally{
    globalThis.fetch=originalFetch;
    for(const key of ['KV_REST_API_URL','KV_REST_API_TOKEN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN']){
      if(originalEnv[key]===undefined)delete process.env[key];else process.env[key]=originalEnv[key];
    }
  }
}
const post=(body,extra={})=>({method:'POST',headers:{origin:'https://site.test',host:'site.test',...extra},body});

test('legacy normalizer flattens controls, validates types and caps Unicode input',()=>{
  assert.equal(api.clean('  hi   there ',24),'hi there');
  assert.equal(api.clean('a\t\nb',24),'a b');
  assert.equal(api.clean('',24),null);
  assert.equal(api.clean(' '.repeat(4),24),null);
  assert.equal(api.clean('x'.repeat(25),24),null);
  assert.equal(api.clean('x'.repeat(24),24),'x'.repeat(24));
  assert.equal(api.clean(42,24),null);
  assert.equal(api.clean('héllo 🎧',24),'héllo 🎧');
});
test('every restored legacy blocked word is rejected case-insensitively',()=>{
  assert.ok(api.blocklist.length>30);
  for(const word of api.blocklist)assert.equal(api.containsBlocked(word.toUpperCase()),true,word);
  assert.equal(api.containsBlocked('a kind note'),false);
});
test('POST requires a same-host Origin',async()=>{
  assert.equal((await invoke(post({name:'a',note:'b'},{origin:'https://evil.test'}))).status,403);
  assert.equal((await invoke({method:'POST',headers:{host:'site.test'},body:{name:'a',note:'b'}})).status,403);
});
test('honeypot answers successfully and never touches Redis',async()=>{
  let called=false;
  const out=await invoke(post({name:'bot',note:'buy pills',website:'filled'}),async()=>{called=true;throw Error('unexpected redis')});
  assert.equal(out.status,200);assert.equal(called,false);
});
test('blocked words in either field are rejected before rate limiting',async()=>{
  let called=false;
  for(const body of [{name:'visitor',note:'BUY NOW'},{name:'nazi',note:'hello'},{name:'visitor',note:'https://spam.example'}]){
    const out=await invoke(post(body),async()=>{called=true;return result({result:'OK'})});
    assert.equal(out.status,400);assert.match(out.body.error,/isn.t welcome/);
  }
  assert.equal(called,false);
});
test('valid signature is stored with original Redis retention and lifetime count',async()=>{
  const requests=[];
  const out=await invoke(post({name:'A\nlice',note:'hello'},{'x-forwarded-for':'203.0.113.1'}),async(url,options)=>{
    const path=new URL(url).pathname;
    const body=JSON.parse(options.body);requests.push({path,body});
    if(path.endsWith('/pipeline'))return result([{result:1},{result:'OK'},{result:1}]);
    return result({result:'OK'});
  });
  assert.equal(out.status,201);assert.equal(out.body.entry.n,'A lice');
  assert.deepEqual(requests[0].body.slice(2),['1','NX','EX','3600']);
  assert.deepEqual(requests[1].body.map(row=>row[0]),['LPUSH','LTRIM','INCR']);
  assert.equal(requests[1].body[1][3],'199');
  assert.equal(out.headers['Cache-Control'],'no-store');
});
test('same-IP rate limit and Upstash aliases are preserved',async()=>{
  const blocked=await invoke(post({name:'A',note:'hello'}),async()=>result({result:null}));
  assert.equal(blocked.status,429);
  let auth='';
  const previous={url:process.env.KV_REST_API_URL,token:process.env.KV_REST_API_TOKEN};
  delete process.env.KV_REST_API_URL;delete process.env.KV_REST_API_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL=redisUrl;process.env.UPSTASH_REDIS_REST_TOKEN=redisToken;
  const out=await invoke({method:'GET',headers:{}},async(_url,options)=>{auth=options.headers.Authorization;return result([{result:[]},{result:'0'}])},{aliases:true});
  assert.equal(out.status,200);assert.equal(auth,'Bearer '+redisToken);
  if(previous.url)process.env.KV_REST_API_URL=previous.url;if(previous.token)process.env.KV_REST_API_TOKEN=previous.token;
});
test('GET returns newest entries and lifetime count from a pipeline',async()=>{
  const out=await invoke({method:'GET',headers:{}},async(url,options)=>{
    assert.ok(url.endsWith('/pipeline'));
    assert.deepEqual(JSON.parse(options.body).map(row=>row[0]),['LRANGE','GET']);
    return result([{result:[JSON.stringify({n:'Maya',m:'good taste',t:1})]},{result:'23'}]);
  });
  assert.equal(out.body.count,23);assert.equal(out.body.items[0].n,'Maya');
  assert.match(out.headers['Cache-Control'],/s-maxage=30/);
});
test('missing Redis configuration returns an unavailable response',async()=>{
  const out=await invoke({method:'GET',headers:{}},undefined,{configured:false});
  assert.equal(out.status,500);assert.match(out.body.error,/no redis url/);
});
test('unsupported methods are rejected',async()=>{
  const out=await invoke({method:'DELETE',headers:{}});assert.equal(out.status,405);
});
