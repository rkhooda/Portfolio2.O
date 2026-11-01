import test from 'node:test';
import assert from 'node:assert/strict';
import nowplaying from '../api/nowplaying.js';
import github from '../api/github.js';
import version from '../api/version.js';
const originalNodeEnv=process.env.NODE_ENV;
process.env.NODE_ENV='test';

function response(){
  let status=200,json;
  const headers={};
  return{res:{setHeader:(key,value)=>headers[key]=value,status(n){status=n;return this},json(value){json=value;return this}},out:()=>({status,json,headers})};
}
const originalEnv={...process.env};
const originalFetch=globalThis.fetch;

function setSpotifyCredentials(){
  process.env.SPOTIFY_CLIENT_ID='test-client';
  process.env.SPOTIFY_CLIENT_SECRET='test-secret';
  process.env.SPOTIFY_REFRESH_TOKEN='test-refresh';
  nowplaying._test.reset();
}
function tokenResponse(access='test-access'){
  return{ok:true,status:200,json:async()=>({access_token:access,expires_in:3600,token_type:'Bearer'})};
}
const track={type:'track',name:'Track',artists:[{name:'Artist One'},{name:'Artist Two'}],album:{name:'Album',images:[{url:'https://spotify.test/cover.jpg'}]},external_urls:{spotify:'https://open.spotify.com/track/abc'}};

test('Spotify nowplaying returns offline when credentials are missing',async()=>{
  for(const key of ['SPOTIFY_CLIENT_ID','SPOTIFY_CLIENT_SECRET','SPOTIFY_REFRESH_TOKEN'])delete process.env[key];
  globalThis.fetch=async()=>{throw Error('must not fetch without credentials')};
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.equal(out.out().status,503);assert.deepEqual(out.out().json,{error:'offline'});assert.match(out.out().headers['Cache-Control'],/s-maxage=30/);
});
test('Spotify token refresh maps track, artists, album art and URL',async()=>{
  setSpotifyCredentials();let tokenBody,authorization;
  globalThis.fetch=async(url,options)=>{
    if(String(url).includes('/api/token')){tokenBody=String(options.body);authorization=options.headers.Authorization;return tokenResponse()}
    assert.equal(options.headers.Authorization,'Bearer test-access');
    return{ok:true,status:200,json:async()=>({is_playing:true,item:track})};
  };
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.deepEqual(out.out().json,{live:true,paused:false,artist:'Artist One, Artist Two',track:'Track',album:'Album',image:'https://spotify.test/cover.jpg',url:'https://open.spotify.com/track/abc'});
  assert.match(tokenBody,/grant_type=refresh_token/);assert.match(tokenBody,/refresh_token=test-refresh/);
  assert.equal(authorization,`Basic ${Buffer.from('test-client:test-secret').toString('base64')}`);
  assert.doesNotMatch(JSON.stringify(out.out().json),/test-secret|test-access|test-refresh/);
});
test('Spotify paused playback retains the track but reports live false',async()=>{
  setSpotifyCredentials();globalThis.fetch=async url=>String(url).includes('/api/token')?tokenResponse():{ok:true,status:200,json:async()=>({is_playing:false,item:track})};
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.equal(out.out().json.live,false);assert.equal(out.out().json.paused,true);assert.equal(out.out().json.track,'Track');
});
test('Spotify 204 maps to the established empty playback shape',async()=>{
  setSpotifyCredentials();globalThis.fetch=async url=>String(url).includes('/api/token')?tokenResponse():{ok:false,status:204};
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.deepEqual(out.out().json,{live:false,paused:false,artist:'',track:'',album:'',image:'',url:''});
});
test('Spotify retries an expired access token once',async()=>{
  setSpotifyCredentials();let refreshes=0,plays=0;
  globalThis.fetch=async url=>{
    if(String(url).includes('/api/token'))return tokenResponse(`access-${++refreshes}`);
    if(++plays===1)return{ok:false,status:401};
    return{ok:true,status:200,json:async()=>({is_playing:true,item:track})};
  };
  const out=response();await nowplaying({method:'GET'},out.res);
  assert.equal(refreshes,2);assert.equal(plays,2);assert.equal(out.out().json.live,true);
});
test('Spotify rate limits and upstream errors use a safe offline fallback',async()=>{
  setSpotifyCredentials();globalThis.fetch=async url=>String(url).includes('/api/token')?tokenResponse():{ok:false,status:429,headers:{get:()=> '30'}};
  const limited=response();await nowplaying({method:'GET'},limited.res);
  assert.equal(limited.out().status,503);assert.deepEqual(limited.out().json,{error:'offline'});assert.equal(limited.out().headers['Retry-After'],'30');
  nowplaying._test.reset();globalThis.fetch=async()=>({ok:false,status:400});
  const failed=response();await nowplaying({method:'GET'},failed.res);
  assert.deepEqual(failed.out().json,{error:'offline'});
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
  for(const key of ['SPOTIFY_CLIENT_ID','SPOTIFY_CLIENT_SECRET','SPOTIFY_REFRESH_TOKEN','GH_TOKEN','GH_USER','VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF']){
    if(originalEnv[key]===undefined)delete process.env[key];else process.env[key]=originalEnv[key];
  }
  if(originalNodeEnv===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=originalNodeEnv;
});
