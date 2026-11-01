import test from 'node:test';
import assert from 'node:assert/strict';
import nowplaying from '../api/nowplaying.js';
import github from '../api/github.js';
import version from '../api/version.js';

function response(){
  let status=200,json;
  const headers={};
  return{res:{setHeader:(key,value)=>headers[key]=value,status(n){status=n;return this},json(value){json=value;return this}},out:()=>({status,json,headers})};
}
const originalEnv={...process.env};
const originalFetch=globalThis.fetch;

test('nowplaying is an offline-safe GET when credentials are absent',async()=>{
  delete process.env.LASTFM_KEY;delete process.env.LASTFM_USER;
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.equal(out.out().status,503);assert.match(out.out().headers['Cache-Control'],/s-maxage=30/);
});
test('nowplaying maps the original bare-object and array response shapes plus album art',async()=>{
  process.env.LASTFM_KEY='test';process.env.LASTFM_USER='test';
  globalThis.fetch=async()=>({json:async()=>({recenttracks:{track:[{'@attr':{nowplaying:'true'},name:'Track',artist:{'#text':'Artist'},album:{'#text':'Album'},image:[{size:'large','#text':'https://last.fm/large'},{size:'extralarge','#text':'https://last.fm/cover'}]}]}})});
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.deepEqual(out.out().json,{live:true,artist:'Artist',track:'Track',album:'Album',image:'https://last.fm/cover'});
});
test('nowplaying omits Last.fm placeholder artwork and retains scrobble time',async()=>{
  globalThis.fetch=async()=>({json:async()=>({recenttracks:{track:{name:'Track',artist:{name:'Artist'},album:{'#text':'Album'},image:[{size:'extralarge','#text':'https://last.fm/2a96cbd8b46e442fc41c2b86b821562f'}],date:{uts:'1793510400'}}}})});
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.deepEqual(out.out().json,{live:false,artist:'Artist',track:'Track',album:'Album',image:'',playedAt:new Date(1793510400*1000).toISOString()});
});
test('GitHub endpoint preserves the original count calendar contract',async()=>{
  process.env.GH_TOKEN='test';process.env.GH_USER='rkhooda';
  let sent;
  globalThis.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return{status:200,json:async()=>({data:{user:{contributionsCollection:{contributionCalendar:{totalContributions:3,weeks:[{contributionDays:[{date:'2026-10-30',contributionCount:1},{date:'2026-10-31',contributionCount:1},{date:'2026-11-01',contributionCount:0}]}]}}}}})}};
  const out=response();await github({method:'GET'},out.res);
  assert.deepEqual(out.out().json,{total:3,streak:2,from:'2026-10-30',days:[1,1,0]});
  assert.equal(sent.variables.login,'rkhooda');assert.match(out.out().headers['Cache-Control'],/s-maxage=3600/);
});
test('GitHub and version expose documented fallbacks and fields',async()=>{
  delete process.env.GH_TOKEN;
  const gh=response();await github({method:'GET'},gh.res);assert.equal(gh.out().status,500);
  process.env.VERCEL_GIT_COMMIT_SHA='1234567890';process.env.VERCEL_GIT_COMMIT_REF='main';
  const v=response();version({method:'GET'},v.res);assert.deepEqual(v.out().json,{sha:'1234567',ref:'main'});
  assert.deepEqual(Object.keys(v.out().json).sort(),['ref','sha']);
  const denied=response();version({method:'POST'},denied.res);assert.equal(denied.out().status,405);
});
test.after(()=>{
  globalThis.fetch=originalFetch;
  for(const key of ['LASTFM_KEY','LASTFM_USER','GH_TOKEN','GH_USER','VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF']){
    if(originalEnv[key]===undefined)delete process.env[key];else process.env[key]=originalEnv[key];
  }
});
