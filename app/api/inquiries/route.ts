import {notifyInquiry} from '../../../lib/notify-inquiry';
import { InputError,validateInquiry } from '../../../lib/inquiry-validation.mjs';
import { json,readJson,runtime,sameOrigin } from '../../../lib/inquiry-server';

export async function POST(request:Request){
  if(!sameOrigin(request))return json({error:'El envío debe realizarse desde esta página.'},403);
  let input;try{input=validateInquiry(await readJson(request));}catch(error){return json({error:error instanceof InputError?error.message:'El formulario no es válido o supera el tamaño permitido.'},400);}
  const {DB,RATE_LIMIT_SALT}=runtime();
  if(!DB||!RATE_LIMIT_SALT)return json({error:'El formulario no está disponible. Contactanos a verdearrr@gmail.com.'},503);
  async function receipt(id:string,status:number){
    // A persisted inquiry is received even when its email notification needs retrying.
    let emailStatus='pending';
    try{emailStatus=await notifyInquiry(id,new URL(request.url).origin);}
    catch{console.error('Saved inquiry notification remains pending');}
    return json({id,reference:'VRD-'+id.slice(0,12).toUpperCase(),emailStatus},status);
  }
  try{
    const previous=await DB.prepare('SELECT id FROM inquiries WHERE request_key = ?').bind(input.requestKey).first<{id:string}>();
    if(previous)return await receipt(previous.id,200);
    const now=new Date(),hour=Math.floor(now.getTime()/3600000),ip=request.headers.get('cf-connecting-ip')||'unknown';
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${RATE_LIMIT_SALT}:${ip}:${hour}`));
    const bucket=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
    await DB.prepare('DELETE FROM submission_limits WHERE expires_at < ?').bind(now.getTime()).run();
    const allowed=await DB.prepare('INSERT INTO submission_limits (bucket, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET count = count + 1 WHERE count < 5 RETURNING count').bind(bucket,(hour+2)*3600000).first();
    if(!allowed)return json({error:'Recibimos varias solicitudes desde tu conexión. Intentá más tarde o escribinos a verdearrr@gmail.com.'},429);
    const id=crypto.randomUUID(),date=now.toISOString();
    const saved=await DB.prepare('INSERT INTO inquiries (id, request_key, name, company, phone, space, interest, message, diagnostic, status, created_at, updated_at, consent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(request_key) DO NOTHING RETURNING id').bind(id,input.requestKey,input.name,input.company,input.phone,input.space,input.interest,input.message,input.diagnostic?JSON.stringify(input.diagnostic):null,'new',date,date,date).first<{id:string}>();
    const finalId=saved?.id||(await DB.prepare('SELECT id FROM inquiries WHERE request_key = ?').bind(input.requestKey).first<{id:string}>())?.id;
    if(!finalId)throw new Error('inquiry-write-failed');
    return await receipt(finalId,201);
  }catch{console.error('Inquiry submission failed');return json({error:'No pudimos confirmar el envío. Tus datos siguen en el formulario; intentá nuevamente o contactanos a verdearrr@gmail.com.'},503);}
}
