import { getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath } from '../chatgpt-auth';
import { adminUser } from '../../lib/inquiry-server';
import html from '../../site/admin.html?raw';
export const dynamic='force-dynamic';
export async function GET(){
  if(await adminUser())return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  const signedIn=!!await getChatGPTUser();
  const body=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Administración · VERDEAR</title><link rel="stylesheet" href="/styles.css"></head><body><main class="narrow"><p class="eyebrow">VERDEAR · Administración</p><h1>${signedIn?'Esta cuenta no tiene acceso.':'Ingresá a la bandeja de solicitudes.'}</h1><p>${signedIn?'Usá la cuenta autorizada para administrar VERDEAR.':'El acceso está reservado a la administración de VERDEAR.'}</p><div class="actions"><a class="button primary" target="_top" href="${signedIn?chatGPTSignOutPath('/admin'):chatGPTSignInPath('/admin')}">${signedIn?'Cambiar de cuenta':'Ingresar con ChatGPT'}</a><a class="button" href="/">Volver a VERDEAR</a></div></main></body></html>`;
  return new Response(body,{status:signedIn?403:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
