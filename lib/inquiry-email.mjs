import {messageFor} from '../public/core.mjs';
export const INQUIRY_EMAIL='verdearrr@gmail.com';
export async function sendInquiryEmail(record,origin,fetcher=fetch){
  origin='https://verdearpy.lat';
  const reference='VRD-'+record.id.slice(0,12).toUpperCase();
  const response=await fetcher('https://formsubmit.co/ajax/'+INQUIRY_EMAIL,{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Referer':origin+'/'},
    signal:AbortSignal.timeout(15000),
    body:JSON.stringify({_subject:`VERDEAR · Nueva solicitud ${reference}`,_template:'table',_url:origin+'/#contacto',_captcha:'false',Referencia:reference,Nombre:record.name,Empresa:record.company||'Particular',Telefono:record.phone,Espacio:record.space,Interes:record.interest||'Asesoramiento',Consulta:messageFor({...record,diagnostic:typeof record.diagnostic==='string'?JSON.parse(record.diagnostic):record.diagnostic}),Fecha:record.created_at})
  });
  if(!response.ok)throw new Error('email-provider-http-'+response.status);
  const result=await response.json();
  if(result.success!==true&&result.success!=='true')throw new Error(/activat/i.test(String(result.message))?'email-provider-activation-required':'email-provider-rejected');
  return 'accepted';
}
