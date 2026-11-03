export const SERVICES = [
  {id:'ambientacion',name:'Ambientación vegetal',short:'Plantas, macetas y composición decorativa para dar vida a tu ambiente.',includes:['Análisis de las condiciones del ambiente','Selección de especies y macetas','Composición y ubicación de los elementos'],spaces:'Interiores, recepciones y espacios de atención.',action:'Pedir asesoramiento'},
  {id:'verticales',name:'Jardines verticales',short:'Soluciones vegetales para muros y espacios reducidos.',includes:['Evaluación de la superficie y su iluminación','Definición del sistema según viabilidad','Propuesta de instalación y cuidados'],spaces:'Muros interiores o exteriores sujetos a evaluación técnica.',action:'Consultar viabilidad'},
  {id:'paisajismo',name:'Paisajismo',short:'Diseño y transformación de espacios exteriores según su entorno.',includes:['Revisión del espacio y sus usos','Diseño de la distribución vegetal','Selección de especies según las condiciones del lugar'],spaces:'Jardines y áreas exteriores.',action:'Solicitar propuesta'},
  {id:'corporativa',name:'Espacios corporativos',short:'Ambientación vegetal para oficinas, locales comerciales e instituciones.',includes:['Revisión de circulación e identidad del espacio','Propuesta para áreas de trabajo y atención','Coordinación de ubicación e instalación'],spaces:'Oficinas, comercios, recepciones e instituciones.',action:'Solicitar propuesta'},
  {id:'mantenimiento',name:'Mantenimiento vegetal',short:'Cuidado periódico de las plantas y las instalaciones.',includes:['Evaluación del estado de la vegetación','Tareas y frecuencia de visitas acordadas','Seguimiento de las necesidades del espacio'],spaces:'Ambientes con vegetación existente o instalaciones nuevas.',action:'Consultar plan'},
  {id:'integrales',name:'Proyectos integrales',short:'Diseño, provisión e instalación en una propuesta coordinada.',includes:['Diagnóstico y diseño personalizado','Provisión de los elementos acordados','Coordinación de instalación y cuidados iniciales'],spaces:'Espacios que requieren una intervención completa.',action:'Solicitar presupuesto'}
];
export const PLANS=[
  {id:'esencial',name:'Verde Esencial',subtitle:'Ambientación vegetal para espacios pequeños.',items:['Análisis inicial del ambiente','Selección de plantas y macetas','Composición según el alcance acordado']},
  {id:'integral',name:'Verde Integral',subtitle:'Diseño e instalación personalizada.',items:['Propuesta adaptada al espacio','Provisión de los elementos acordados','Instalación y orientación de cuidados']},
  {id:'continuo',name:'Verde Continuo',subtitle:'Mantenimiento y seguimiento periódico.',items:['Evaluación de las plantas existentes','Plan de cuidado para el ambiente','Visitas con frecuencia a definir']}
];
export const QUESTIONS=[
  {key:'space',title:'¿Qué espacio querés transformar?',options:['Oficina','Recepción','Sala de reuniones','Comercio','Hotel / restaurante','Otro']},
  {key:'size',title:'¿Qué tamaño tiene?',options:['Pequeño','Mediano','Grande']},
  {key:'light',title:'¿Cuánta luz natural recibe?',options:['Mucha','Media','Poca']},
  {key:'style',title:'¿Qué estilo preferís?',options:['Minimalista','Natural','Elegante','Tropical','Corporativo']},
  {key:'service',title:'¿Qué servicio te interesa?',options:['Diseño','Instalación','Mantenimiento','Solución integral']}
];
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validPhone(value){return /^\+?[\d\s().-]{6,25}$/.test(value)&&value.replace(/\D/g,'').length>=6;}
export function businessPhone(value){const p=value.replace(/\D/g,'');return p.length>=8&&p.length<=15?p:'';}
export function completedAnswers(answers){return QUESTIONS.every(q=>q.options.includes(answers[q.key]));}
export function messageFor(record){
  const lines=['Hola, VERDEAR. Quisiera solicitar una propuesta.','',`Nombre: ${record.name}`,record.company?`Empresa: ${record.company}`:'',`Teléfono / WhatsApp: ${record.phone}`,`Tipo de espacio: ${record.space}`,record.interest?`Interés: ${record.interest}`:''];
  if(record.diagnostic) for(const q of QUESTIONS) lines.push(`${q.title} ${record.diagnostic[q.key]}`);
  if(record.message) lines.push('',`Mensaje: ${record.message}`);
  lines.push('','Quedo pendiente de confirmar el alcance, la cobertura y el costo del diagnóstico.');return lines.filter(x=>x!==undefined).join('\n');
}
export function contactLinks(settings,record){const text=messageFor(record),phone=businessPhone(settings.whatsapp||'');return {whatsapp:phone?`https://wa.me/${phone}?text=${encodeURIComponent(text)}`:'',email:settings.email?`mailto:${encodeURIComponent(settings.email)}?subject=${encodeURIComponent('Consulta VERDEAR — '+record.name)}&body=${encodeURIComponent(text)}`:''};}
