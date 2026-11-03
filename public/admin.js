import {esc,QUESTIONS} from './core.mjs';
const statuses={new:'Nueva',contacted:'En contacto',proposed:'Presupuestada',closed:'Cerrada',archived:'Archivada'};
const inbox=document.querySelector('#inbox'),feedback=document.querySelector('#admin-feedback');
let page=0,items=[],loading=false,sequence=0;
function date(value){return new Date(value).toLocaleString('es-PY',{dateStyle:'medium',timeStyle:'short'});}
function render(record){
  let diagnostic=null;try{diagnostic=record.diagnostic?JSON.parse(record.diagnostic):null;}catch{}
  const phone=record.phone.replace(/\D/g,'');let destination=phone;
  if(/^0\d{8,9}$/.test(phone))destination='595'+phone.slice(1);
  const whatsapp=destination.length>=8&&destination.length<=15?'https://wa.me/'+destination+'?text='+encodeURIComponent(`Hola ${record.name}, te contactamos de VERDEAR por tu consulta sobre ${record.interest||record.space}.`):'';
  return `<article class="inquiry"><div class="section-top"><div><span class="tag">${esc(statuses[record.status]||record.status)}</span><h2>${esc(record.name)}</h2><p class="muted">${esc(record.company||'Particular')} · ${esc(date(record.created_at))}</p></div><small>${esc('VRD-'+record.id.slice(0,12).toUpperCase())}</small></div><dl class="review"><div><dt>Teléfono</dt><dd>${esc(record.phone)}</dd></div><div><dt>Espacio</dt><dd>${esc(record.space)}</dd></div><div><dt>Interés</dt><dd>${esc(record.interest||'Asesoramiento')}</dd></div><div><dt>Mensaje</dt><dd>${esc(record.message)}</dd></div></dl>${diagnostic?`<details class="admin-diagnostic"><summary>Ver cuestionario del espacio</summary><dl class="review">${QUESTIONS.map(q=>`<div><dt>${q.title}</dt><dd>${esc(diagnostic[q.key])}</dd></div>`).join('')}</dl></details>`:''}<div class="actions"><label class="admin-status-label">Estado<select data-status="${esc(record.id)}">${Object.entries(statuses).map(([value,label])=>`<option value="${value}" ${record.status===value?'selected':''}>${label}</option>`).join('')}</select></label><button class="primary" data-save="${esc(record.id)}">Guardar estado</button>${whatsapp?`<a class="button" href="${esc(whatsapp)}" target="_blank" rel="noopener noreferrer">Responder por WhatsApp</a>`:''}<a class="button" href="tel:${esc(record.phone.replace(/[^+\d]/g,''))}">Llamar</a><button data-delete="${esc(record.id)}">Eliminar datos</button></div></article>`;
}
async function load(){
  const current=++sequence;loading=true;inbox.setAttribute('aria-busy','true');feedback.textContent='Cargando…';
  const params=new URLSearchParams(new FormData(document.querySelector('#admin-filters')));params.set('page',page);
  try{
    const response=await fetch('/api/admin/inquiries?'+params,{cache:'no-store'}),data=await response.json();
    if(current!==sequence)return;if(!response.ok)throw new Error(data.error||'No pudimos cargar las solicitudes.');
    items=data.items;inbox.innerHTML=items.length?items.map(render).join(''):'<div class="empty">No hay solicitudes que coincidan con esta búsqueda.</div>';
    feedback.textContent=`${data.total} solicitud${data.total===1?'':'es'}.`;
    document.querySelector('#page-label').textContent=`Página ${page+1} de ${Math.max(1,Math.ceil(data.total/data.pageSize))}`;
    document.querySelector('#previous').disabled=page===0;document.querySelector('#next').disabled=(page+1)*data.pageSize>=data.total;document.querySelector('#export').disabled=!items.length;
    inbox.querySelectorAll('[data-save]').forEach(button=>button.onclick=()=>save(button));inbox.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>remove(button));
  }catch(error){if(current!==sequence)return;feedback.textContent=error.message;inbox.innerHTML='<div class="empty">No se pudieron cargar las solicitudes. Podés volver a intentar con Actualizar.</div>';document.querySelector('#export').disabled=true;}
  finally{if(current===sequence){loading=false;inbox.setAttribute('aria-busy','false');}}
}
async function save(button){
  const id=button.dataset.save,status=inbox.querySelector(`[data-status="${id}"]`).value;button.disabled=true;feedback.textContent='Guardando estado…';
  try{const response=await fetch('/api/admin/inquiries',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})}),data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo guardar.');await load();feedback.textContent='Estado guardado.';}catch(error){feedback.textContent=error.message;button.disabled=false;}
}
document.querySelector('#admin-filters').onsubmit=e=>{e.preventDefault();page=0;load();};
document.querySelector('#refresh').onclick=()=>load();
document.querySelector('#previous').onclick=()=>{if(!loading&&page>0){page--;load();}};
document.querySelector('#next').onclick=()=>{if(!loading){page++;load();}};
document.querySelector('#export').onclick=()=>{
  const cell=value=>{const text=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(text)?"'"+text:text).replace(/"/g,'""')+'"';};
  const fields=['Referencia','Nombre','Empresa','Teléfono','Espacio','Interés','Mensaje','Estado','Creada'];
  const lines=[fields,...items.map(r=>['VRD-'+r.id.slice(0,12).toUpperCase(),r.name,r.company,r.phone,r.space,r.interest,r.message,statuses[r.status],r.created_at])];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='verdear-solicitudes-pagina-'+(page+1)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
load();

async function remove(button){
  if(!confirm('¿Eliminar definitivamente esta solicitud y sus datos de contacto? Esta acción no se puede deshacer.'))return;
  button.disabled=true;
  try{const response=await fetch('/api/admin/inquiries',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:button.dataset.delete})}),data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo eliminar.');await load();feedback.textContent='Solicitud eliminada.';}catch(error){feedback.textContent=error.message;button.disabled=false;}
}
