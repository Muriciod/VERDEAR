import { QUESTIONS, SERVICES, PLANS, validPhone } from '../public/core.mjs';

export const STATUSES = {new:'Nueva',contacted:'En contacto',proposed:'Presupuestada',closed:'Cerrada',archived:'Archivada'};
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class InputError extends Error { constructor(message){super(message);this.name='InputError';} }
export function validateInquiry(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new InputError('La solicitud no es válida.');
  if(typeof input.website==='string'&&input.website.trim())throw new InputError('No pudimos procesar la solicitud. Contactanos por WhatsApp.');
  const clean=(key,max,required=false)=>{const value=input[key];if(value!==undefined&&typeof value!=='string')throw new InputError('Revisá los campos del formulario.');const text=(value||'').trim();if(text.length>max||(required&&!text))throw new InputError('Completá los campos obligatorios y respetá su longitud máxima.');if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))throw new InputError('El formulario contiene caracteres no válidos.');return text;};
  const name=clean('name',100,true),company=clean('company',120),phone=clean('phone',25,true),space=clean('space',50,true),interest=clean('interest',100),message=clean('message',2000,true);
  if(!validPhone(phone))throw new InputError('Ingresá un teléfono válido.');
  if(!QUESTIONS[0].options.includes(space))throw new InputError('Seleccioná un tipo de espacio válido.');
  if(interest&&!['Diagnóstico Verde',...SERVICES.map(s=>s.name),...PLANS.map(p=>'Plan '+p.name)].includes(interest))throw new InputError('Seleccioná un servicio o plan válido.');
  if(!UUID.test(input.requestKey||''))throw new InputError('Actualizá la página e intentá enviar nuevamente.');
  if(input.consent!==true)throw new InputError('Necesitamos tu autorización para contactarte sobre la solicitud.');
  let diagnostic=null;
  if(input.diagnostic!==undefined&&input.diagnostic!==null){
    if(typeof input.diagnostic!=='object'||Array.isArray(input.diagnostic))throw new InputError('El diagnóstico no es válido.');
    diagnostic={};for(const q of QUESTIONS){if(!q.options.includes(input.diagnostic[q.key]))throw new InputError('Completá las cinco respuestas del diagnóstico.');diagnostic[q.key]=input.diagnostic[q.key];}
    if(diagnostic.space!==space)throw new InputError('El tipo de espacio debe coincidir con el cuestionario. Revisá tus respuestas.');
  }
  return {requestKey:input.requestKey,name,company,phone,space,interest,message,diagnostic};
}
export function csvCell(value){const s=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';}
