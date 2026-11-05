import {notifyInquiry} from '../../../../lib/notify-inquiry';
import { json,adminUser,readJson,runtime,sameOrigin } from '../../../../lib/inquiry-server';
import { STATUSES,UUID } from '../../../../lib/inquiry-validation.mjs';
export const dynamic='force-dynamic';

export async function GET(request:Request){
  if(!await adminUser())return json({error:'Acceso restringido.'},403);
  const url=new URL(request.url),status=url.searchParams.get('status')||'all',q=(url.searchParams.get('q')||'').trim().slice(0,100);
  const page=Math.min(400,Math.max(0,Number.parseInt(url.searchParams.get('page')||'0',10)||0));
  if(status!=='all'&&!Object.hasOwn(STATUSES,status))return json({error:'Estado no válido.'},400);
  const conditions:string[]=[],params:string[]=[];
  if(status!=='all'){conditions.push('status = ?');params.push(status);}
  if(q){conditions.push("(name LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')");const term='%'+q.replace(/[\\%_]/g,'\\$&')+'%';params.push(term,term,term);}
  const where=conditions.length?' WHERE '+conditions.join(' AND '):'';
  try{
    const db=runtime().DB;
    const count=await db.prepare('SELECT COUNT(*) AS total FROM inquiries'+where).bind(...params).first<{total:number}>();
    const rows=await db.prepare('SELECT id, name, company, phone, space, interest, message, diagnostic, status, email_status, created_at, updated_at FROM inquiries'+where+' ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ?').bind(...params,page*25).all();
    return json({items:rows.results,total:count?.total||0,page,pageSize:25});
  }catch{console.error('Admin inbox read failed');return json({error:'No pudimos cargar las solicitudes. Intentá nuevamente.'},503);}
}
export async function PATCH(request:Request){
  if(!await adminUser())return json({error:'Acceso restringido.'},403);
  if(!sameOrigin(request))return json({error:'Origen no permitido.'},403);
  let input;try{input=await readJson(request,1000);}catch{return json({error:'Datos no válidos.'},400);}
  if(!input||typeof input!=='object'||!UUID.test(input.id||'')||!Object.hasOwn(STATUSES,input.status))return json({error:'Datos no válidos.'},400);
  try{
    const result=await runtime().DB.prepare('UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ? RETURNING id').bind(input.status,new Date().toISOString(),input.id).first();
    return result?json({ok:true}):json({error:'Solicitud no encontrada.'},404);
  }catch{console.error('Admin inbox update failed');return json({error:'No se pudo actualizar el estado.'},503);}
}
export async function DELETE(request:Request){
  if(!await adminUser())return json({error:'Acceso restringido.'},403);
  if(!sameOrigin(request))return json({error:'Origen no permitido.'},403);
  let input;try{input=await readJson(request,1000);}catch{return json({error:'Datos no válidos.'},400);}
  if(!input||!UUID.test(input.id||''))return json({error:'Datos no válidos.'},400);
  try{const removed=await runtime().DB.prepare('DELETE FROM inquiries WHERE id = ? RETURNING id').bind(input.id).first();return removed?json({ok:true}):json({error:'Solicitud no encontrada.'},404);}
  catch{console.error('Admin inquiry deletion failed');return json({error:'No se pudo eliminar la solicitud.'},503);}
}

export async function POST(request:Request){
  if(!await adminUser())return json({error:'Acceso restringido.'},403);
  if(!sameOrigin(request))return json({error:'Origen no permitido.'},403);
  let input;try{input=await readJson(request,1000);}catch{return json({error:'Datos no válidos.'},400);}
  if(!input||!UUID.test(input.id||''))return json({error:'Datos no válidos.'},400);
  try{const result=await notifyInquiry(input.id,new URL(request.url).origin);return json({emailStatus:result},result==='accepted'?200:503);}
  catch{return json({error:'No pudimos enviar el aviso.'},503);}
}
