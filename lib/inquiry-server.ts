import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';

export const runtime = () => env as unknown as {DB:D1Database;ADMIN_EMAIL?:string;RATE_LIMIT_SALT?:string};
export function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
export async function adminUser(){
  const user=await getChatGPTUser();
  const allowed=runtime().ADMIN_EMAIL?.trim().toLowerCase();
  return user?.userId&&allowed&&user.email?.trim().toLowerCase()===allowed?user:null;
}
export async function readJson(request:Request,max=12000){
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new Error('content-type');
  if(Number(request.headers.get('content-length')||0)>max)throw new Error('body-size');
  const reader=request.body?.getReader();if(!reader)throw new Error('body-empty');
  const chunks:Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new Error('body-size');}chunks.push(value);}
  const buffer=new Uint8Array(length);let pos=0;for(const chunk of chunks){buffer.set(chunk,pos);pos+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(buffer));
}
