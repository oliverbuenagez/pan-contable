# AGENTS.md

## Contexto
- App "Contabilidad de Ventas": registro de clientes, panes y ventas de una panadería.
- Solo HTML, CSS y JavaScript (módulos ES). Sin frameworks, bundler ni build.
- El usuario está aprendiendo: explicar en español, trabajar por fases y verificar en el navegador antes de seguir.
- Datos en Cloud Firestore: proyecto `contabilidad-de-ventas`, base `(default)`, región `us-central1`, plan Spark. Login anónimo habilitado.
- Repo público `oliverbuenagez/pan-contable`; publicación prevista con GitHub Pages desde `main` (raíz).

## Comandos
- Servir en local: `npx serve .` → `http://localhost:3000` (Node v24 disponible).
- Alternativa: extensión Live Server de VS Code.
- Abrir siempre por HTTP; `file://` rompe los módulos ES y Firebase Auth.
- No hay `package.json`, build, tests, lint ni typecheck. No agregarlos sin pedirlo.

## Stack
- Firebase JS SDK 13.1.0 por CDN de gstatic; usar la misma versión en todos los imports: `firebase-app.js`, `firebase-auth.js`, `firebase-firestore.js`.
- `js/firebase-config.js` exporta `app`, `auth` y `db`. El `firebaseConfig` es público; nunca commitear service accounts ni secretos.
- Chart.js por CDN solo para el dashboard.
- UI en español, mobile-first, moneda COP entera (`$1.500`) con `Intl.NumberFormat("es-CO")`.

## Datos (Firestore)
- Colecciones: `clientes`, `productos`, `ventas`.
- Ventas por unidad, solo contado, sin recibos por ahora.
- Guardar en cada venta copia de `nombre` y `precio` de cada producto (histórico inmutable).
- `fecha` como Timestamp y `fechaDia` como `"YYYY-MM-DD"` para agrupar; `creadoEn` con `serverTimestamp()`.
- Borrado lógico con `activo: false` en clientes y productos; no borrar historial.
- Reglas: `allow read, write: if request.auth != null;`. Iniciar sesión anónima antes de leer/escribir.
- No agregar login con contraseña todavía; es una fase futura.

## Git y GitHub
- Hay dos cuentas SSH; usar el alias personal: `git@github-personal:oliverbuenagez/pan-contable.git` (no `git@github.com:`).
- Identidad local del repo: cuenta personal (`rodriguezoliverb@gmail.com`), no la profesional.
- Flujo por fase: `git add .` → `git commit -m "Fase N: ..."` → `git push`.
- Repo público obligatorio para GitHub Pages gratis.
- Tras publicar, agregar `oliverbuenagez.github.io` en Firebase Auth → Settings → Authorized domains.

## Estructura
- `index.html` — esqueleto y navegación por pestañas.
- `css/estilos.css` — estilos mobile-first.
- `js/app.js` — navegación entre secciones.
- JS modular previsto en `js/`: `firebase-config.js`, `db.js`, `utilidades.js`, `clientes.js`, `productos.js`, `ventas.js`, `dashboard.js`.
