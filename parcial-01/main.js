/**
 * main.js
 *
 * Punto de entrada del servidor Express para la Librería Los 7 Locos.
 * Puerto: 3333 (configurado en .env)
 *
 * Iniciar:
 *   npm start       → producción
 *   npm run dev     → desarrollo con nodemon (auto-reinicio)
 *   npm run swagger → regenerar swagger.json
 */

import express from 'express';

// Rutas del frontend (devuelven HTML al navegador)
import viewRoutes from './routes/view.routes.js';

// Rutas de la API REST (devuelven JSON)
import librosRoutesApi from './api/routes/libros.routes.js';
import generosRoutesApi from './api/routes/generos.routes.js';

// Swagger: documentación visual de la API en /api-docs
import { createRequire } from 'module';
import { existsSync } from 'fs';
import swaggerUI from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware para servir archivos estáticos (CSS, imágenes, SVGs) desde /public
app.use('/assets', express.static('public/assets'));
app.use(express.static('public'));

// Middleware para parsear bodies JSON (necesario para la API REST)
app.use(express.json());

// Middleware para parsear bodies de formularios HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Montamos las rutas del frontend — responden con HTML
app.use(viewRoutes);

// Montamos las rutas de la API REST bajo el prefijo /api
app.use('/api', librosRoutesApi);
app.use('/api', generosRoutesApi);

// Montamos Swagger UI si swagger.json ya fue generado (npm run swagger)
if (existsSync('./swagger.json')) {
    // Importamos swagger.json dinámicamente con assert { type: "json" }
    const require = createRequire(import.meta.url);
    const swaggerFile = require('./swagger.json');
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));
    console.log('📖 Swagger disponible en http://localhost:' + PORT + '/api-docs');
} else {
    // Si swagger.json no existe todavía, mostramos instrucciones
    app.get('/api-docs', (req, res) => {
        res.send(`
            <h2>Swagger no generado</h2>
            <p>Corré <code>npm run swagger</code> para generar la documentación y reiniciá el servidor.</p>
        `);
    });
    console.log('⚠️  swagger.json no encontrado. Corré: npm run swagger');
}

// Iniciamos el servidor en el puerto configurado en .env
app.listen(PORT, () => {
    console.log(`📚 Librería Los 7 Locos corriendo en http://localhost:${PORT}`);
    console.log(`🔌 API REST disponible en http://localhost:${PORT}/api`);
});
