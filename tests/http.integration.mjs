import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { randomUUID,randomInt } from 'node:crypto';
import { Miniflare } from 'miniflare';
import {resolve} from 'node:path';
const base='https://verdear-test.invalid';
const email='admin@verdear-test.invalid';
const serverRoot=resolve('dist/server');
const moduleFiles=readdirSync(serverRoot,{recursive:true}).filter(p=>/\.m?js$/.test(p));
moduleFiles.sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b));
const mf=new Miniflare({modules:moduleFiles.map(path=>({type:'ESModule',path:resolve(serverRoot,path)})),modulesRoot:serverRoot,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'inquiry-integration-tests'},bindings:{ADMIN_EMAIL:email,RATE_LIMIT_SALT:'ephemeral-test-salt'}});
const database=await mf.getD1Database('DB');
const migration=readFileSync(new URL('../drizzle/0000_secret_maelstrom.sql',import.meta.url),'utf8');
for(const statement of migration.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await database.prepare(statement).run();
const admin={'oai-authenticated-user-id':'local-integration-admin','oai-authenticated-user-email':email};
const origin=new URL(base).origin,ip=`198.18.${randomInt(1,254)}.${randomInt(1,254)}`,created=[];
async function api(path,options={}){const response=await mf.dispatchFetch(base+path,options);const body=await response.json();return {status:response.status,body};}
function options(payload,headers={},method='POST'){return {method,headers:{'Content-Type':'application/json',origin,'cf-connecting-ip':ip,...headers},body:JSON.stringify(payload)};}
const marker='QA-'+randomUUID().slice(0,8);
const payload={requestKey:randomUUID(),name:marker,company:'Prueba local',phone:'0984 206 767',space:'Oficina',interest:'Diagnóstico Verde',message:'Solicitud de integración local. No contactar.',consent:true,website:'',diagnostic:{space:'Oficina',size:'Pequeño',light:'Media',style:'Natural',service:'Solución integral'}};
try{
  assert.equal((await api('/api/admin/inquiries')).status,403);
  assert.equal((await api('/api/admin/inquiries',{headers:{...admin,'oai-authenticated-user-email':'unapproved@example.test'}})).status,403);
  assert.equal((await api('/api/inquiries',options({...payload,consent:false}))).status,400);
  assert.equal((await api('/api/inquiries',options(payload,{origin:'https://other.example'}))).status,403);
  const submitted=await api('/api/inquiries',options(payload));assert.equal(submitted.status,201,JSON.stringify(submitted.body));created.push(submitted.body.id);
  const duplicate=await api('/api/inquiries',options(payload));assert.equal(duplicate.status,200);assert.equal(duplicate.body.id,submitted.body.id);
  const list=await api('/api/admin/inquiries?q='+marker,{headers:admin});assert.equal(list.status,200,JSON.stringify(list.body));assert.equal(list.body.total,1);assert.equal(JSON.parse(list.body.items[0].diagnostic).light,'Media');assert.equal(list.body.items[0].name,marker);
  assert.equal((await api('/api/admin/inquiries',options({id:submitted.body.id,status:'contacted'},{},'PATCH'))).status,403);
  assert.equal((await api('/api/admin/inquiries',options({id:submitted.body.id,status:'contacted'},admin,'PATCH'))).status,200);
  const updated=await api('/api/admin/inquiries?q='+marker+'&status=contacted',{headers:admin});assert.equal(updated.body.total,1);assert.equal(updated.body.items[0].status,'contacted');
  for(let i=0;i<4;i++){const next=await api('/api/inquiries',options({...payload,requestKey:randomUUID()}));assert.equal(next.status,201);created.push(next.body.id);}
  assert.equal((await api('/api/inquiries',options({...payload,requestKey:randomUUID()}))).status,429);
  console.log('PASS: anonymous and unauthorized access denied, input and origin validation, persistent creation, idempotent retry, diagnostic storage, admin filtering/status, hourly rate limit.');
}finally{
  for(const id of created){const r=await api('/api/admin/inquiries',options({id},admin,'DELETE'));assert.equal(r.status,200,JSON.stringify(r.body));}
  console.log('Local test inquiries removed.');
  await mf.dispose();
}
