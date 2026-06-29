# Datos de la alumna

| | |
|---|---|
| **Nombre y apellido** | Denise Barral |
| **DNI** | 38390537 |
| **Materia** | Aplicaciones Híbridas |
| **Comisión y cuatrimestre** | DWN4AV — 1° cuatrimestre 2026 |
| **Profesor** | Victor Emanuel Villafañe |

---

# Flujos de archivos — Parcial 02

Dos flujos completos: registro de usuario y operaciones con libros (crear + editar).
Cada paso indica qué archivo interviene y qué hace puntualmente.

---

## Índice

- [Flujo 1 — Registro de usuario](#flujo-1--registro-de-usuario)
- [Flujo 2 — Crear un libro](#flujo-2--crear-un-libro)
- [Flujo 3 — Editar un libro (PATCH)](#flujo-3--editar-un-libro-patch)
- [Diferencias clave entre los tres flujos](#diferencias-clave-entre-los-tres-flujos)

---

## Flujo 1 — Registro de usuario

```
Register.jsx
  ↓
usuarios.service.jsx → useApi() → api.service.jsx
  ↓                                     ↓
(construye JSON)             fetch POST http://localhost:3333/api/
  ↓
────────────────── LLEGA AL BACK ──────────────────
  ↓
main.js
  ↓
api/routes/usuarios.routes.js
  ↓
middlewares/usuarios.validate.js  +  schemas/usuarios.js
  ↓
api/controllers/usuarios.controllers.js
  ↓
services/usuarios.service.js
  ↓
MongoDB Atlas
```

### Paso a paso

**1. `front/src/pages/auth/Register.jsx`**
El usuario llena el formulario (email, password, passwordConfirm) y hace click en "Crear cuenta".
React Hook Form valida los campos del lado del cliente antes de dejar avanzar:
- email con formato válido
- password con mayúscula + minúscula + número + símbolo
- passwordConfirm igual al password

Si todo está bien, llama a `registrar(datos)` del service.

---

**2. `front/src/services/usuarios.service.jsx` → función `registrar()`**
Recibe el objeto `{ email, password, passwordConfirm }` y lo pasa a `call()`:
```js
const registrar = (datos) => call('/', 'POST', datos);
```
No hace nada más — delega toda la lógica a `useApi`.

---

**3. `front/src/services/api.service.jsx` → función `call()`**
- Detecta que el body **no es FormData** → agrega `Content-Type: application/json`
- No hay token aún (es una ruta de entrada al sistema) → no agrega Authorization
- Hace el `fetch` a `http://localhost:3333/api/` con el body en JSON

---

**4. `back/main.js`**
Recibe la request. Los middlewares globales se ejecutan en orden:
- `cors(...)` → permite la request desde `http://localhost:5173`
- `express.json()` → parsea el body JSON y lo pone en `req.body`

Luego el router monta la ruta: `app.use('/api', usuariosRoutesApi)` → la request llega a las rutas de usuarios.

---

**5. `back/api/routes/usuarios.routes.js`**
Matchea `POST /` → ejecuta la cadena de middlewares:
```
validateRegister → controllers.createUser
```

---

**6. `back/middlewares/usuarios.validate.js` → `validateRegister`**
Toma `req.body` y lo valida con Yup usando el schema de registro.
Si algo falla (ej: contraseña sin símbolo), **detiene la cadena** y responde `400` con la lista de errores.
Si todo está bien, llama a `next()` y la request sigue.

---

**7. `back/schemas/usuarios.js` → `registerSchema`**
Es el "reglamento" que usa Yup. Define las reglas de validación:
- email: requerido, formato válido
- password: mínimo 8 chars, debe tener mayúscula/minúscula/número/símbolo
- passwordConfirm: debe ser igual a `password` (usando `yup.ref('password')`)

Este archivo no hace nada por sí solo — solo describe las reglas. `usuarios.validate.js` lo usa para ejecutar la validación.

---

**8. `back/api/controllers/usuarios.controllers.js` → `createUser`**
Extrae `email` y `password` de `req.body` y llama a `service.createUser()`.
No hace lógica de negocio: solo traduce HTTP → función del service.

---

**9. `back/services/usuarios.service.js` → `createUser()`**
Acá está la lógica real:
1. Busca si ya existe un usuario con ese email (`findOne`) → si existe, lanza error
2. Hashea la contraseña con bcrypt (salt rounds = 11) → nunca guarda texto plano
3. Hace `insertOne({ email, password: hash })` en MongoDB Atlas

---

**10. MongoDB Atlas**
Guarda el documento `{ _id, email, password: "$2b$11$..." }` en la colección `usuarios`.

---

**Respuesta de vuelta:**
`services` → `controllers` (responde `201 Created`) → `routes` → `main.js` → `fetch` en `api.service.jsx` → `usuarios.service.jsx` devuelve el JSON → `Register.jsx` muestra mensaje de éxito y redirige al login.

---
---

## Flujo 2 — Crear un libro

```
NuevoLibro.jsx
  ↓
libros.service.jsx → buildFormData() → useApi() → api.service.jsx
  ↓                                                       ↓
(construye FormData con imagen)         fetch POST http://localhost:3333/api/libros
                                        con header Authorization: Bearer <token>
  ↓
────────────────── LLEGA AL BACK ──────────────────
  ↓
main.js
  ↓
api/routes/libros.routes.js
  ↓
middlewares/imagenes.upload.js → upload.single()  (multer guarda el archivo)
  ↓
middlewares/imagenes.upload.js → resizeImage()    (sharp convierte a .webp)
  ↓
middlewares/libros.validate.js  +  schemas/libros.js
  ↓
middlewares/token.validate.js   +  services/token.service.js
  ↓
api/controllers/libros.controllers.js → crearLibro
  ↓
services/libros.service.js → crear()
  ↓
MongoDB Atlas
```

### Paso a paso

**1. `front/src/pages/admin/NuevoLibro.jsx`**
El empleado llena el formulario (todos los campos + imagen requerida).
React Hook Form valida del lado del cliente.
Al submitear llama a `crearLibro(datos)` del service.

---

**2. `front/src/services/libros.service.jsx` → `crearLibro()` + `buildFormData()`**
`buildFormData()` convierte el objeto plano de RHF en un `FormData`:
- Los campos de texto se agregan con `fd.append('titulo', valor)`, etc.
- El campo imagen: `datos.imagen` es un `FileList` (lo que devuelve un `<input type="file">`). Se accede con `datos.imagen[0]` para obtener el archivo real.

Luego llama a `call('/libros', 'POST', formData)`.

---

**3. `front/src/services/api.service.jsx` → `call()`**
- Detecta que el body **es FormData** → **NO** agrega `Content-Type` (el navegador lo hace solo, con el boundary necesario para que multer lo pueda leer)
- Hay token en el contexto → agrega `Authorization: Bearer <token>`
- Hace el `fetch`

---

**4. `back/main.js`**
Igual que antes: CORS + montaje de rutas.
`express.json()` no afecta este request porque el body es multipart, no JSON.

---

**5. `back/api/routes/libros.routes.js`**
Matchea `POST /libros` → ejecuta la cadena:
```
upload.single('imagen') → resizeImage → libroValidate → tokenValidate → crearLibro
```
El orden importa: primero procesamos el archivo, después validamos texto, después el token.

---

**6. `back/middlewares/imagenes.upload.js` → `upload.single('imagen')`**
Multer intercepta el `FormData`, extrae el campo `imagen` (el archivo) y lo guarda en `uploads/` con un nombre temporal basado en el timestamp (`Date.now() + extensión`).
Popula `req.file` con información del archivo guardado.

---

**7. `back/middlewares/imagenes.upload.js` → `resizeImage()`**
Sharp toma el archivo guardado por multer (`req.file.path`), lo redimensiona a 500px de ancho, lo convierte a `.webp` con calidad 85, y guarda el nuevo archivo.
Borra el archivo original (la imagen antes de convertir).
Actualiza `req.file.filename` con el nombre del nuevo `.webp`.

---

**8. `back/middlewares/libros.validate.js` → `libroValidate`**
Valida `req.body` con Yup usando `libroSchema`.
Si algo falla (ej: precio vacío), responde `400` y **detiene la cadena**.

---

**9. `back/schemas/libros.js` → `libroSchema`**
Define las reglas de validación para los campos del libro: titulo, autor, genero, descripcion, precio (número), anio_publicacion (entero), editorial, link (URL opcional), seccion.

---

**10. `back/middlewares/token.validate.js` → `tokenValidate`**
Extrae el token del header `Authorization: Bearer <token>`.
Llama a `validateToken()` del service de tokens.

---

**11. `back/services/token.service.js` → `validateToken()`**
`jwt.verify(token, JWT_SECRET)` → si el token es válido, devuelve el payload `{ email }`.
Si es inválido o expiró, lanza un error → `tokenValidate` responde `401` y el front redirige al login.
Si es válido, adjunta el payload a `req.usuario` y llama a `next()`.

---

**12. `back/api/controllers/libros.controllers.js` → `crearLibro`**
Construye el objeto libro con los campos de `req.body` y el filename de `req.file`.
Parsea precio y año a número (FormData los envía como strings).
Llama a `service.crear(libro)`.

---

**13. `back/services/libros.service.js` → `crear()`**
`insertOne(libro)` en MongoDB Atlas.
Devuelve el `InsertOneResult` con el `insertedId` generado.

---
---

## Flujo 3 — Editar un libro (PATCH)

```
EditarLibro.jsx
  ↓  (primero carga el libro con getLibroPorId — flujo GET, más simple)
  ↓  (el usuario edita campos y opcionalmente elige imagen nueva)
  ↓
libros.service.jsx → buildFormData() → useApi() → api.service.jsx
  ↓
fetch PATCH http://localhost:3333/api/libros/:id
  con Authorization: Bearer <token>
  ↓
────────────────── LLEGA AL BACK ──────────────────
  ↓
main.js
  ↓
api/routes/libros.routes.js
  ↓
middlewares/imagenes.upload.js → upload.single()   (solo actúa si viene imagen)
  ↓
middlewares/imagenes.upload.js → resizeImage()     (solo actúa si viene imagen)
  ↓
middlewares/token.validate.js  +  services/token.service.js
  ↓                ← ⚠️ PATCH no pasa por libroValidate (campos son opcionales)
api/controllers/libros.controllers.js → modificarLibro
  ↓
services/libros.service.js → modificarLibro()
  ↓  (si hay imagen nueva: findOne para obtener nombre anterior → updateOne → borrar imagen vieja)
  ↓  (si no hay imagen nueva: updateOne directo, sin findOne extra)
  ↓
MongoDB Atlas
```

### Diferencias clave respecto al flujo de creación

**En el front — `EditarLibro.jsx`:**
Antes de mostrar el formulario, hace un GET con `getLibroPorId(id)` y pre-carga los campos con `reset(datos)` de React Hook Form.
La imagen **no** puede pre-cargarse (restricción de seguridad del navegador con `<input type="file">`), por eso se muestra la imagen actual como preview y el campo file queda vacío.

**`buildFormData()` en `libros.service.jsx`:**
Si el empleado no eligió imagen nueva, `datos.imagen` es un `FileList` vacío (`length === 0`) → `buildFormData` lo saltea → el FormData se envía sin campo `imagen`.

**En la route — sin `libroValidate`:**
PATCH acepta body parcial. No tiene sentido validar "todos los campos requeridos" cuando el empleado puede estar cambiando solo el precio.

**En el controller — `modificarLibro`:**
```js
const datos = { ...req.body };
if (req.file) datos.imagen = req.file.filename;
// Si no vino imagen, datos.imagen no existe → el $set no la toca
```

**En el service — `modificarLibro()`:**
- Si viene imagen nueva → hace `findOne` para obtener el nombre de la imagen anterior → `updateOne` con `$set` → borra la imagen vieja del disco
- Si **no** viene imagen nueva → solo hace `updateOne` con `$set` (sin `findOne` extra — ahorra una consulta innecesaria)

---

## Diferencias clave entre los tres flujos

| | Registro | Crear libro | Editar libro |
|---|---|---|---|
| **Verbo HTTP** | POST | POST | PATCH |
| **Body** | JSON | FormData | FormData |
| **¿Lleva imagen?** | No | Sí (obligatoria) | Opcional |
| **¿Lleva token?** | No | Sí | Sí |
| **Validación Yup en back** | `registerSchema` | `libroSchema` | ❌ sin Yup (parcial) |
| **Multer/Sharp** | ❌ | ✅ | ✅ (si hay imagen) |
| **Operación en MongoDB** | `insertOne` | `insertOne` | `updateOne` + `$set` |
| **¿Borra imagen del disco?** | ❌ | ❌ | Sí, si viene imagen nueva |
