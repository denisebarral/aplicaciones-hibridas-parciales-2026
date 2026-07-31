/**
 * main.js
 *
 * Punto de entrada del servidor Express — API REST de la Librería Los 7 Locos.
 * Puerto: 3333 (o el que esté en .env).
 *
 * Iniciar:
 *   pnpm start    → producción
 *   pnpm dev      → desarrollo con nodemon (auto-reinicio)
 *   pnpm swagger  → regenerar swagger.json
 *
 * Este back es una API REST pura: no sirve HTML.
 * El front React (carpeta ../front/) consume esta API.
 */

import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import swaggerUI from 'swagger-ui-express';

// Rutas de la API REST (todas bajo el prefijo /api)
import librosRoutesApi    from './api/routes/libros.routes.js';
import generosRoutesApi   from './api/routes/generos.routes.js';
import usuariosRoutesApi  from './api/routes/usuarios.routes.js';

const app  = express();
const PORT = process.env.PORT || 3333;

// ─── MIDDLEWARES GLOBALES ────────────────────────────────────────────────────

// CORS: permite requests desde el front React en localhost:5173
// Sin esto, el navegador bloquea las peticiones por política de same-origin
app.use(cors({
    origin:         'http://localhost:5173',
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsea bodies JSON (para las rutas que NO usan FormData)
app.use(express.json());

// Parsea bodies de formularios URL-encoded (por si se necesita)
app.use(express.urlencoded({ extended: true }));

// Sirve las imágenes subidas por multer desde http://localhost:3333/uploads/{filename}
// El front construye la URL completa para mostrar las portadas
app.use('/uploads', express.static('uploads'));

// ─── RUTAS API REST ──────────────────────────────────────────────────────────

// Montamos todas las rutas bajo /api
// usuariosRoutesApi: POST /api/ (registro) y POST /api/login
app.use('/api', librosRoutesApi);
app.use('/api', generosRoutesApi);
app.use('/api', usuariosRoutesApi);

// ─── SWAGGER UI ──────────────────────────────────────────────────────────────

// Swagger UI se sirve en /api-docs si ya existe el swagger.json generado
// Para generarlo: pnpm swagger (corre swagger.js una sola vez)
if (existsSync('./swagger.json')) {
    const require    = createRequire(import.meta.url);
    const swaggerFile = require('./swagger.json');
    app.use('/api-docs', ...swaggerUI.serve, swaggerUI.setup(swaggerFile));
    console.log(`📖 Swagger en http://localhost:${PORT}/api-docs`);
} else {
    app.get('/api-docs', (req, res) => {
        res.send('<h2>Swagger no generado. Corré: <code>pnpm swagger</code> y reiniciá el servidor.</h2>');
    });
    console.log('⚠️  swagger.json no encontrado. Corré: pnpm swagger');
}

// ─── INICIO DEL SERVIDOR ─────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`📚 Los 7 Locos — Back corriendo en http://localhost:${PORT}`);
    console.log(`🔌 API REST: http://localhost:${PORT}/api`);
    console.log(`🖼  Imágenes: http://localhost:${PORT}/uploads`);
});
