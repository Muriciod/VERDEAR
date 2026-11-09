import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendInquiryEmail} from '../lib/inquiry-email.mjs';
const record={id:'12345678-1234-4000-8000-123456789abc',name:'Prueba',company:'Empresa',phone:'0984 206 767',space:'Oficina',interest:'Diagnóstico Verde',message:'Mensaje completo',created_at:'2026-11-05T12:00:00Z',diagnostic:JSON.stringify({space:'Oficina',size:'Pequeño',light:'Media',style:'Natural',care:'Bajo'})};
test('envía datos completos y cuestionario al destinatario fijo',async()=>{
  let payload;const result=await sendInquiryEmail(record,'https://verdear-beta.muriciod.chatgpt.site',async(url,options)=>{assert.equal(url,'https://formsubmit.co/ajax/verdearrr@gmail.com');assert.equal(options.headers.Referer,'https://verdearpy.lat/');payload=JSON.parse(options.body);return Response.json({success:'true'});});
  assert.equal(result,'accepted');assert.equal(payload.Telefono,record.phone);assert.match(payload.Consulta,/Mensaje completo/);assert.match(payload.Consulta,/Oficina/);assert.equal(payload.Referencia,'VRD-12345678-123');assert.equal(payload._url,'https://verdearpy.lat/#contacto');
});
test('no confirma avisos rechazados, fallos HTTP o respuestas inválidas',async()=>{
  for(const response of [Response.json({success:false}),new Response('failed',{status:503}),new Response('<html>')])await assert.rejects(sendInquiryEmail(record,'https://verdearpy.lat',async()=>response));
});
