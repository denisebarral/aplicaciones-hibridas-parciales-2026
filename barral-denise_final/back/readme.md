# Parcial 02 — Backend (API REST)

API REST para la librería **Los 7 Locos**, construida con Node.js + Express + MongoDB Atlas.
Gestiona libros, géneros y autenticación de empleados.

---

## Índice

- [¿De qué trata?](#de-qué-trata)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura de archivos](#estructura-de-archivos)
- [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
- [Endpoints disponibles](#endpoints-disponibles)
- [Documentación Swagger](#documentación-swagger)

---

## ¿De qué trata?

Backend de la librería Los 7 Locos (San Telmo, Buenos Aires).
Expone una API REST que permite:

- Consultar el catálogo de libros con filtros por sección y precio (público)
- Crear, editar y eliminar libros con imagen de portada (requiere JWT)
- Consultar géneros literarios (público)
- Registrar e iniciar sesión como empleado (devuelve JWT)

Los libros tienen imagen de portada: al subir una imagen, el back la convierte automáticamente a `.webp` (500px de ancho, calidad 85) usando **Sharp**.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 22+ | Runtime |
| Express | 5 | Framework HTTP |
| MongoDB | Driver nativo 7 | Base de datos |
| MongoDB Atlas | — | Base de datos en la nube |
| bcryptjs | 3 | Hasheo de contraseñas |
| jsonwebtoken | 9 | Autenticación JWT |
| multer | 2 | Procesamiento de archivos (FormData) |
| sharp | 0.33 | Conversión y redimensión de imágenes |
| yup | 1 | Validación de datos en el servidor |
| swagger-autogen | 2 | Generación de documentación |
| swagger-ui-express | 5 | UI de Swagger en `/api-docs` |
| dotenv (env-file) | built-in Node | Variables de entorno |

---

## Estructura de archivos

```
back/
├── api/
│   ├── controllers/
│   │   ├── libros.controllers.js    # Lógica HTTP de libros (GET, POST, PUT, PATCH, DELETE)
│   │   ├── generos.controllers.js   # Lógica HTTP de géneros
│   │   └── usuarios.controllers.js  # Login y registro
│   └── routes/
│       ├── libros.routes.js         # Rutas /api/libros
│       ├── generos.routes.js        # Rutas /api/generos
│       └── usuarios.routes.js       # Rutas /api/ (register) y /api/login
├── middlewares/
│   ├── imagenes.upload.js           # Multer (subida) + Sharp (conversión a webp)
│   ├── libros.validate.js           # Validación Yup para libros
│   ├── usuarios.validate.js         # Validación Yup para usuarios
│   └── token.validate.js            # Verificación del JWT en el header Authorization
├── schemas/
│   ├── libros.js                    # Schema Yup para campos de libro
│   └── usuarios.js                  # Schema Yup para registro/login
├── services/
│   ├── libros.service.js            # Acceso a MongoDB para libros + manejo de imágenes en disco
│   ├── generos.service.js           # Acceso a MongoDB para géneros (soft delete)
│   ├── usuarios.service.js          # Acceso a MongoDB para usuarios (bcrypt + insert)
│   └── token.service.js             # Generación y validación de JWT
├── uploads/                         # Imágenes subidas (generadas en tiempo de ejecución)
├── main.js                          # Punto de entrada: middlewares globales + montaje de rutas
├── swagger.js                       # Script para generar swagger.json
├── swagger.json                     # Especificación OpenAPI generada (no editar a mano)
├── .env                             # Variables de entorno (no subir a git)
├── .env.example                     # Plantilla de variables de entorno
└── pnpm-workspace.yaml              # Configuración de pnpm (ignora @scarf/scarf)
```

---

## Cómo levantar el proyecto

### 1. Pre-requisitos

- Node.js 22 o superior
- pnpm instalado globalmente (`npm install -g pnpm`)
- Acceso a una instancia de MongoDB Atlas (o URI de conexión)

### 2. Instalar dependencias

Desde la carpeta `back/`:

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` como `.env` y completar los valores:

```
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/
DB_NAME=AH20232CP1
JWT_SECRET=una_clave_secreta_larga_y_dificil_de_adivinar
PORT=3333
```

### 4. Levantar el servidor

```bash
pnpm dev       # Modo desarrollo con nodemon (auto-reinicia al guardar)
pnpm start     # Modo producción (sin nodemon)
```

El servidor queda escuchando en `http://localhost:3333`.

---

## Endpoints disponibles

### Libros

| Método | Ruta | Autenticación | Body | Descripción |
|---|---|---|---|---|
| GET | `/api/libros` | No | — | Todos los libros. Acepta `?seccion=`, `?precio_min=`, `?precio_max=` |
| GET | `/api/libros/:id` | No | — | Un libro por su ObjectId |
| POST | `/api/libros` | JWT | FormData + imagen | Crea un libro nuevo |
| PUT | `/api/libros/:id` | JWT | FormData + imagen | Reemplaza un libro completo |
| PATCH | `/api/libros/:id` | JWT | FormData (parcial) + imagen opcional | Actualiza campos puntuales |
| DELETE | `/api/libros/:id` | JWT | — | Elimina el libro y su imagen del disco |

### Géneros

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/generos` | No | Todos los géneros |
| GET | `/api/generos/:id` | No | Un género por su ObjectId |
| POST | `/api/generos` | JWT | Crea un género nuevo |
| PUT | `/api/generos/:id` | JWT | Edita un género |
| DELETE | `/api/generos/:id` | JWT | Soft delete (marca `borrado: true`) |

### Usuarios

| Método | Ruta | Autenticación | Body | Descripción |
|---|---|---|---|---|
| POST | `/api/` | No | `{ email, password, passwordConfirm }` | Registra un empleado |
| POST | `/api/login` | No | `{ email, password }` | Inicia sesión, devuelve JWT |

---

## Documentación Swagger

La documentación interactiva está disponible en `http://localhost:3333/api-docs` con el servidor corriendo.

Para regenerar la documentación después de modificar rutas o controllers:

```bash
pnpm swagger
```

Esto actualiza el archivo `swagger.json`. Luego reiniciar el servidor para que sirva la versión nueva.

Para probar endpoints protegidos desde Swagger UI:
1. Hacer login con `POST /api/login` y copiar el `token` de la respuesta
2. Hacer clic en el botón **Authorize** (🔒) en la parte superior de la página
3. Ingresar `Bearer <el_token>` y confirmar
4. Todos los endpoints con el candado van a enviar el token automáticamente
