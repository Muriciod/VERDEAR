# VERDEAR

Primera versión operativa: servicios, proceso, propuestas conceptuales, planes, cuestionario y recepción de solicitudes.

## Recepción y administración

El visitante envía el formulario sin crear una cuenta. El servidor valida los datos y los guarda en D1. Solo se muestra la confirmación después de guardar. Un identificador evita duplicados por doble clic o al reintentar el mismo envío desde la página abierta; ante errores se conservan los datos en memoria.

La bandeja `/admin` requiere inicio de sesión con ChatGPT y el correo autorizado por `ADMIN_EMAIL`. La autorización se comprueba en cada operación. Incluye búsqueda, filtros, cuestionario, estados, exportación de la página a CSV y eliminación con confirmación. Los enlaces de WhatsApp preparan mensajes que el administrador revisa y envía.

Cada solicitud nueva se guarda y genera un aviso por correo mediante FormSubmit. El contacto comercial es verdearrr@gmail.com. Se retiró el paso opcional de envío de la solicitud al WhatsApp comercial. El destino fijo es verdearrr@gmail.com. Activar EMAIL_NOTIFICATIONS_ENABLED=true en producción. FormSubmit envía una activación inicial al destinatario, que debe pulsar el enlace para habilitar la recepción. No se usa ni almacena la contraseña de Gmail. El proveedor acepta el aviso, pero esto no garantiza llegada a la bandeja principal: revisar spam. Compartir la URL no habilita a otros administradores.

## Contenido

Servicios y planes alineados con el documento verdear.pdf suministrado por el usuario. Las propuestas e imágenes siguen identificadas como conceptuales o ilustrativas. Los costos, cobertura y alcance del diagnóstico se acuerdan al coordinar.

## Arquitectura

- `site/index.html`: documento público servido por la ruta raíz.
- `public/`: JavaScript, CSS e imágenes.
- `app/`: rutas de Vinext y API pública/privada.
- `db/schema.ts` y `drizzle/`: esquema y migraciones.
- `.openai/hosting.json`: identidad del Site y binding DB.

Publicar con los helpers de Sites. Las migraciones se aplican al desplegar. `dist/` es generado y está ignorado. Esta versión requiere servidor y D1: para cambiar a otro hosting hay que adaptar también el servidor, la autenticación y migrar la base; copiar únicamente archivos estáticos no conserva la recepción.

## Configuración y controles

Configurar `ADMIN_EMAIL` y `RATE_LIMIT_SALT` en el runtime de Sites como valores privados del servidor. Para desarrollo, usar el archivo ignorado `.dev.vars` y una sal diferente de producción. Los datos de los clientes nunca se incluyen en el repositorio ni en el paquete de despliegue.

El formulario exige consentimiento, valida los campos y tamaños, rechaza orígenes ajenos, incluye un campo para detectar automatismos y limita envíos por conexión. El límite usa un identificador derivado con sal secreta y vencimiento; no guarda la IP en las consultas. Las respuestas con datos de clientes no se almacenan en caché.

## Verificación

- `node --test tests/*.test.mjs`: validación, diagnóstico, escape, enlaces y CSV.
- `node tests/http.integration.mjs`: prueba el Worker compilado en Miniflare con D1 efímero; comprueba autorización, persistencia, reintentos, filtros, estados y límites. No modifica producción y elimina los registros de prueba.
- TypeScript y compilación del starter.
- Prueba en navegador del formulario hasta la confirmación guardada en la base local.

Compilar antes de ejecutar la integración. Las migraciones no contienen registros de ejemplo.

## Entrega de avisos

La migración 0001 agrega estado de notificación y fecha de intento. El envío es del servidor a FormSubmit; solo se marca aceptado si responde con éxito. Las solicitudes guardadas no se pierden ante fallos de correo: el visitante puede reintentar el mismo envío y el administrador puede reintentar avisos pendientes desde /admin. Una reserva temporal evita envíos concurrentes duplicados. No hay garantía de entrega exactamente una vez si el proveedor acepta el mensaje pero la conexión se corta antes de confirmar. No hay proceso de reintentos en segundo plano. La eliminación de una consulta en VERDEAR no borra copias ya enviadas al buzón o al proveedor.

Las pruebas locales no envían mensajes reales: el indicador de envío está desactivado y las pruebas unitarias usan un proveedor simulado.
