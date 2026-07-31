# Datos de la alumna

| | |
|---|---|
| **Nombre y apellido** | Denise Barral |
| **DNI** | 38390537 |
| **Repo GitHub (ver barral-denise_final)** | https://github.com/denisebarral/aplicaciones-hibridas-parciales-2026 |
| **Materia** | Aplicaciones Híbridas |
| **Comisión y cuatrimestre** | DWN4AV — 1° cuatrimestre 2026 |
| **Profesor** | Victor Emanuel Villafañe |

---

# Flujos de archivos — Barral Denise Final

## Descripción general

Librería Los 7 Locos: aplicación full-stack con catálogo público de libros y un panel de
administración (backoffice) protegido, pensado para que empleados de la librería carguen y
mantengan el catálogo.

- **Backend** (`back/`): API REST en Node.js + Express, con MongoDB Atlas como base de datos.
  Expone endpoints públicos (catálogo, géneros) y endpoints protegidos con JWT (ABM de libros
  y géneros, reservado a empleados autenticados).
- **Frontend** (`front/`): SPA en React + Vite. Incluye la vista pública del catálogo y el
  backoffice de administración, con rutas protegidas que redirigen a `/login` si no hay sesión
  activa.
- **Autenticación**: login/registro tradicional (email + password hasheado con bcrypt) y login
  con Google (`@react-oauth/google` en el front + `google-auth-library` en el back, que verifica
  el ID Token de Google antes de confiar en el email). Ambos caminos terminan generando el mismo
  tipo de JWT, así el resto de la app no distingue cómo entró el usuario.

## Stack tecnológico

**Backend:** Node.js, Express 5, MongoDB (driver nativo) + MongoDB Atlas, bcryptjs, jsonwebtoken,
google-auth-library, multer + sharp (subida y conversión de imágenes a `.webp`), yup (validación),
swagger-autogen + swagger-ui-express (documentación interactiva en `/api-docs`).

**Frontend:** React 19, Vite, React Router 7, React Hook Form, Bootstrap 5, @react-oauth/google.

## Índice

- [Flujo 1 — Usuarios](#flujo-1--usuarios)
- [Flujo 2 — Libros](#flujo-2--libros)
- [Flujo 3 — Géneros](#flujo-3--géneros)

---

## Flujo 1 — Usuarios

Registro y login de empleados, con dos caminos posibles:

- **Tradicional** (`Register.jsx` / `Login.jsx`): valida el formulario con React Hook Form,
  envía `{ email, password, passwordConfirm }` (registro) o `{ email, password }` (login) a
  `POST /api/` y `POST /api/login`. El back valida con Yup, hashea el password con bcrypt al
  registrar, y en el login genera un JWT (`token.service.js`) que el front guarda en
  `Session.context` (estado + `localStorage`).
- **Con Google** (mismo botón en ambas pantallas): el front solo reenvía el ID Token que entrega
  Google (`credential`) a `POST /api/google`, sin decodificarlo. El back lo verifica con
  `google-auth-library` (firma, expiración y `audience`) y recién ahí confía en el email del
  payload. Si el email no existe, crea el usuario sin password (`authProvider: 'google'`); si ya
  existe, lo autentica directamente. Devuelve el mismo `{ email, token }` que el login tradicional.

## Flujo 2 — Libros

ABM completo, protegido con JWT salvo la lectura:

- `GET /api/libros` (con filtros opcionales `?seccion=`, `?precio_min=`, `?precio_max=`) y
  `GET /api/libros/:id` son públicos — alimentan `Catalogo.jsx`, `Home.jsx` y `LibroDetalle.jsx`.
- Crear/editar (`NuevoLibro.jsx`, `EditarLibro.jsx`) envían `FormData` (por la imagen) a
  `POST`/`PATCH /api/libros`. La cadena de middlewares procesa la imagen con multer + sharp
  (redimensiona a 500px y convierte a `.webp`) antes de validar el resto de los campos con Yup
  y el token.
- Eliminar (`EliminarLibro.jsx`) es un **hard delete**: `DELETE /api/libros/:id` borra el
  documento de MongoDB y también el archivo de imagen del disco.
- Todo el ABM vive bajo `/admin/libros/*` en el front, dentro de rutas protegidas por
  `ProtectedRoute`.

## Flujo 3 — Géneros

ABM completo, protegido con JWT salvo la lectura — misma estructura que libros pero sin imagen:

- `GET /api/generos` es público y alimenta el dropdown del `NavBar` y los filtros de
  `Catalogo.jsx` (el campo `slug` de cada género debe coincidir con el valor de `seccion` que se
  carga en los libros).
- Crear/editar (`NuevoGenero.jsx`, `EditarGenero.jsx`) envían JSON simple
  `{ nombre, slug, descripcion }` a `POST`/`PATCH /api/generos`.
- Eliminar (`EliminarGenero.jsx`) es un **soft delete**: `DELETE /api/generos/:id` solo marca
  `borrado: true` (no se borra físicamente). El género deja de listarse en el navbar y en el
  catálogo, pero los libros que ya tenían esa sección cargada no se modifican.
- Todo el ABM vive bajo `/admin/generos/*`, accesible desde el hub en `/admin`.
