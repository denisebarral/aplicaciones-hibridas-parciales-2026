# Parcial 02 — Frontend (React SPA)

Interfaz web para la librería **Los 7 Locos**, construida con React + React Router + Bootstrap.
Consume la API REST del `back/`.

---

## Índice

- [¿De qué trata?](#de-qué-trata)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura de archivos](#estructura-de-archivos)
- [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
- [Rutas disponibles](#rutas-disponibles)
- [Notas importantes](#notas-importantes)

---

## ¿De qué trata?

SPA (Single Page Application) de la librería Los 7 Locos.
Tiene dos secciones principales:

**Sección pública** (sin login):
- Home con hero section, datos de la librería y selección de libros destacados
- Catálogo completo con filtros por género/sección
- Vista de detalle de cada libro

**Sección de empleados** (requiere login):
- Panel de administración con listado de libros
- Crear, editar y eliminar libros (con imagen de portada)

La autenticación usa JWT: el token se guarda en `localStorage` y se envía en el header `Authorization: Bearer <token>` en cada request protegido.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| React Router | 7 | Enrutado del lado del cliente |
| React Hook Form | 7 | Manejo y validación de formularios |
| Bootstrap | 5 | Estilos y componentes UI |
| Vite | 6 | Bundler y servidor de desarrollo |
| pnpm | 10+ | Gestor de paquetes |

---

## Estructura de archivos

```
front/src/
├── contexts/
│   └── Session.context.jsx     # Contexto global de sesión (token + email)
├── components/
│   ├── NavBar.jsx              # Barra de navegación (carga géneros para el dropdown)
│   ├── Layout.jsx              # Layout con NavBar envolviendo todas las páginas
│   └── ProtectedRoute.jsx      # Guardia: redirige al login si no hay sesión
├── routes/
│   └── Router.jsx              # Configuración de rutas con createBrowserRouter
├── services/
│   ├── api.service.jsx         # Hook useApi() — fetch centralizado con token y manejo de 401
│   ├── libros.service.jsx      # Hook useLibrosService() — operaciones CRUD de libros
│   ├── generos.service.jsx     # Hook useGenerosService() — obtener géneros
│   └── usuarios.service.jsx    # Hook useUsuariosService() — login y registro
├── pages/
│   ├── Home.jsx                # Página principal con hero y libros destacados
│   ├── Catalogo.jsx            # Catálogo con filtros por sección
│   ├── LibroDetalle.jsx        # Vista de detalle de un libro
│   ├── auth/
│   │   ├── Login.jsx           # Formulario de login — guarda token en localStorage
│   │   ├── Register.jsx        # Formulario de registro de empleados
│   │   └── Logout.jsx          # Limpia localStorage y redirige al home
│   └── admin/
│       ├── Admin.jsx           # Panel de administración — listado de libros
│       ├── NuevoLibro.jsx      # Formulario para crear libro (con imagen obligatoria)
│       ├── EditarLibro.jsx     # Formulario para editar libro (imagen opcional)
│       └── EliminarLibro.jsx   # Confirmación de eliminación
├── index.css                   # Estilos globales y variables CSS de la marca
└── main.jsx                    # Punto de entrada — SessionProvider + RouterProvider
```

---

## Cómo levantar el proyecto

### 1. Pre-requisitos

- Node.js 22 o superior
- pnpm instalado globalmente (`npm install -g pnpm`)
- El servidor **back/** corriendo en `http://localhost:3333`

### 2. Instalar dependencias

Desde la carpeta `front/`:

```bash
pnpm install
```

### 3. Levantar el servidor de desarrollo

```bash
pnpm dev
```

La app queda disponible en `http://localhost:5173`.

> El back debe estar corriendo en `http://localhost:3333` antes de usar la app.
> Si el back no está levantado, las peticiones van a fallar silenciosamente.

---

## Rutas disponibles

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/` | `Home` | Público | Página principal con libros destacados |
| `/catalogo` | `Catalogo` | Público | Todos los libros |
| `/catalogo/:seccion` | `Catalogo` | Público | Libros filtrados por sección |
| `/libro/:id` | `LibroDetalle` | Público | Detalle de un libro |
| `/login` | `Login` | Público | Iniciar sesión |
| `/register` | `Register` | Público | Registrar empleado |
| `/logout` | `Logout` | Público | Cerrar sesión |
| `/admin` | `Admin` | Requiere sesión | Panel de administración |
| `/admin/libros/nuevo` | `NuevoLibro` | Requiere sesión | Crear libro |
| `/admin/libros/:id/editar` | `EditarLibro` | Requiere sesión | Editar libro |
| `/admin/libros/:id/eliminar` | `EliminarLibro` | Requiere sesión | Eliminar libro |

---

## Notas importantes

**Sesión:** El token JWT y el email se guardan en `localStorage`. La sesión persiste al recargar la página. Al cerrar sesión (`/logout`), se hace `localStorage.clear()`.

**Imágenes:** Las imágenes de portada se sirven desde el back en `http://localhost:3333/uploads/<filename>`. Si una imagen no existe, se muestra un placeholder de `picsum.photos`.

**CORS:** El back está configurado para aceptar requests desde `http://localhost:5173`. Si el front corre en otro puerto, hay que actualizar la config de CORS en `back/main.js`.

**FormData vs JSON:** Los endpoints que incluyen imagen (crear y editar libro) envían `FormData`. El hook `useApi()` detecta esto automáticamente y omite el header `Content-Type` para que el navegador lo genere con el boundary correcto que multer necesita.
