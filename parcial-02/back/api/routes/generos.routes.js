/**
 * api/routes/generos.routes.js
 *
 * Rutas de la API REST para el recurso "generos".
 * Montadas bajo el prefijo /api en main.js.
 *
 * GET    /api/generos       → público (sin JWT) — para el dropdown del navbar del front
 * GET    /api/generos/:id   → público (sin JWT)
 * POST   /api/generos       → requiere JWT
 * PUT    /api/generos/:id   → requiere JWT
 * PATCH  /api/generos/:id   → requiere JWT
 * DELETE /api/generos/:id   → requiere JWT
 */

import express from 'express';
import * as controllers from '../controllers/generos.controllers.js';
import { tokenValidate } from '../../middlewares/token.validate.js';

const router = express.Router();

// Rutas públicas — los géneros se usan para el dropdown del navbar (visible para todos)
router.get('/generos',     controllers.obtenerGeneros);
router.get('/generos/:id', controllers.obtenerGeneroPorId);

// Rutas protegidas — solo empleados autenticados pueden modificar géneros
router.post('/generos',       tokenValidate, controllers.crearGenero);
router.put('/generos/:id',    tokenValidate, controllers.reemplazarGenero);
router.patch('/generos/:id',  tokenValidate, controllers.actualizarGenero);
router.delete('/generos/:id', tokenValidate, controllers.eliminarGenero);

export default router;
