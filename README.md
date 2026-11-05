# VERDEAR

Primera versión operativa: servicios, proceso, propuestas conceptuales, planes, cuestionario y recepción de solicitudes.

## Recepción y administración

El visitante envía el formulario sin crear una cuenta. El servidor valida los datos y los guarda en D1. Solo se muestra la confirmación después de guardar. Un identificador evita duplicados por doble clic o al reintentar el mismo envío desde la página abierta; ante errores se conservan los datos en memoria.

La bandeja `/admin` requiere inicio de sesión con ChatGPT y el correo autorizado por `ADMIN_EMAIL`. La autorización se comprueba en cada operación. Incluye búsqueda, filtros, cuestionario, estados, exportación de la página a CSV y eliminación con confirmación. Los enlaces de WhatsApp preparan mensajes que el administrador revisa y envía.

No hay notificaciones automáticas por correo ni WhatsApp. El contacto comercial es verdearrr@gmail.com. Se retiró el paso opcional de envío de la solicitud al WhatsApp comercial. La entrega automática al correo requiere configurar un proveedor de envío; publicar el enlace mailto no activa notificaciones. Compartir la URL no habilita a otros administradores.

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
