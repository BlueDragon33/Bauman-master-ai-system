import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  handleManagedSso, hasManagedSsoSession, managedSsoEnabled, requiresManagedBrowserSso
} from "../cloudflare/app-manager-sso.mjs";
if(!globalThis.crypto)globalThis.crypto=webcrypto;

const base="https://bauman-preview.example.org";
const callback=base+"/__sso/callback";
const env={
 BAUMAN_ACCESS_MODE:"managed",BAUMAN_SSO_ENABLED:"true",
 BAUMAN_SSO_CALLBACK_URL:callback,
 BAUMAN_SSO_SESSION_KEY:"test-only-key-never-used-in-prod-".repeat(2)
};
const cookie=r=>r.headers.get("set-cookie")?.split(";")[0]??"";

test("SSO opt-in cannot silently alter offline standalone mode",async()=>{
 assert.equal(managedSsoEnabled({...env,BAUMAN_ACCESS_MODE:"standalone"}),false);
 assert.equal(await hasManagedSsoSession(new Request(base+"/"),{...env,BAUMAN_ACCESS_MODE:"standalone"}),true);
 const result=await handleManagedSso(new Request(base+"/__sso/start"),{...env,BAUMAN_ACCESS_MODE:"standalone"});
 assert.equal(result.status,404);
 assert.equal(await handleManagedSso(new Request(base+"/"),{...env,BAUMAN_ACCESS_MODE:"standalone"}),null);
});

test("registration requires exact HTTPS callback and configured secret",async()=>{
 assert.equal((await handleManagedSso(new Request(base+"/__sso/start"),{...env,BAUMAN_SSO_CALLBACK_URL:"https://evil.test/__sso/callback"})).status,503);
 assert.equal((await handleManagedSso(new Request(base+"/__sso/start"),{...env,BAUMAN_SSO_SESSION_KEY:"weak"})).status,503);
 assert.equal(await hasManagedSsoSession(new Request(base+"/"),env),false);
 assert.equal(requiresManagedBrowserSso("/subjects/private.json"),true);
 assert.equal(requiresManagedBrowserSso("/index.html"),true);
 assert.equal(requiresManagedBrowserSso("/assets/css/main.css"),false);
});

test("PKCE initiates exact gateway client and protects flow cookie",async()=>{
 const r=await handleManagedSso(new Request(base+"/__sso/start"),env);
 assert.equal(r.status,303);
 const target=new URL(r.headers.get("location"));
 assert.equal(target.origin,"https://application-management.boiech-ai.workers.dev");
 assert.equal(target.pathname,"/__sso/v2/authorize");
 assert.equal(target.searchParams.get("client_id"),"bauman-master-ai");
 assert.equal(target.searchParams.get("redirect_uri"),callback);
 assert.equal(target.searchParams.get("code_challenge_method"),"S256");
 assert.equal(target.searchParams.get("state")?.length,32);
 assert.equal(target.searchParams.get("code_challenge")?.length,43);
 assert.equal(cookie(r).startsWith("__Host-bauman_sso_flow="),true);
 assert.equal(r.headers.get("cache-control"),"no-store, private");
 const wrong=new Request(callback+"?state=bad&code="+"a".repeat(43),{headers:{cookie:cookie(r)}});
 assert.equal((await handleManagedSso(wrong,env)).status,401);
});

test("verified backend assertion establishes only a short-lived scoped session; bad audience fails",async()=>{
 const starter=await handleManagedSso(new Request(base+"/__sso/start"),env);
 const state=new URL(starter.headers.get("location")).searchParams.get("state");
 const code="a".repeat(43);
 const original=globalThis.fetch;
 let seenBody;
 globalThis.fetch=async (_url,opts)=>{
  seenBody=JSON.parse(opts.body);
  return Response.json({
   issuer:"https://application-management.boiech-ai.workers.dev",
   audience:"bauman-master-ai",subject:"owner@example.com",email:"owner@example.com",
   authMethod:"google",emailVerified:true,appManageRole:"owner",
   expiresAt:Math.floor(Date.now()/1000)+45
  });
 };
 try{
  const request=new Request(callback+"?state="+state+"&code="+code,{headers:{cookie:cookie(starter)}});
  const r=await handleManagedSso(request,env);
  assert.equal(r.status,303);
  assert.equal(r.headers.get("location"),base+"/");
  assert.equal(seenBody.client_id,"bauman-master-ai");
  assert.equal(seenBody.redirect_uri,callback);
  assert.equal(typeof seenBody.code_verifier,"string");
  const all=r.headers.get("set-cookie")??"";
  const session=all.match(/__Host-bauman_sso_session=([^;]+)/)?.[0];
  assert.ok(session);
  assert.equal(await hasManagedSsoSession(new Request(base+"/",{headers:{cookie:session}}),env),true);
  assert.equal(await hasManagedSsoSession(new Request(base+"/",{headers:{cookie:session+"x"}}),env),false);
 }finally{globalThis.fetch=original}
});

test("invalid issuer claim is rejected, no session ever minted",async()=>{
 const starter=await handleManagedSso(new Request(base+"/__sso/start"),env);
 const state=new URL(starter.headers.get("location")).searchParams.get("state");
 const orig=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({
  issuer:"https://evil.example",audience:"bauman-master-ai",subject:"owner@example.com",email:"owner@example.com",
  authMethod:"google",emailVerified:true,appManageRole:"owner",expiresAt:Math.floor(Date.now()/1000)+30
 });
 try{
  const r=await handleManagedSso(new Request(callback+"?state="+state+"&code="+"a".repeat(43),{headers:{cookie:cookie(starter)}}),env);
  assert.equal(r.status,401);
  assert.equal(r.headers.get("set-cookie"),null);
 }finally{globalThis.fetch=orig}
});

test("runtime preserves Device Gate after SSO and additionally protects Python",()=>{
 const w=readFileSync("cloudflare/runtime-worker.mjs","utf8");
 const p=readFileSync("cloudflare/runtime-worker-python.mjs","utf8");
 assert.match(w,/handleManagedSso\(request,env\)/);
 assert.match(w,/hasManagedSsoSession\(request,env\)/);
 assert.match(w,/validateDeviceSession\(request,controlOrigin,token\)/);
 assert.match(p,/APP_MANAGER_SSO_REQUIRED/);
 assert.match(p,/return pythonApi\(request, env, url\)/);
});
