/**
 * api/routes/generos.routes.js
 *
 * Rutas de la API REST para el recurso "generos".
 * Montadas bajo el prefijo /api en main.js.
 *
 * GET    /api/generos       → todos los géneros (excluye borrados)
 * GET    /api/generos/:id   → un género por ObjectId
 * POST   /api/generos       → crea un nuevo género
 * PUT    /api/generos/:id   → reemplaza un género (enviar objeto completo)
 * PATCH  /api/generos/:id   → actualización parcial (enviar solo los campos a cambiar)
 * DELETE /api/generos/:id   → soft delete: marca el género como borrado
 */

import express from 'express';
import * as controllers from '../controllers/generos.controllers.js';

const router = express.Router();

// GET /api/generos → devuelve todos los géneros (filtra los marcados con borrado: true)
router.get('/generos', controllers.obtenerGeneros);

// GET /api/generos/:id → devuelve un género por su ObjectId
router.get('/generos/:id', controllers.obtenerGeneroPorId);

// POST /api/generos → crea un nuevo género con los datos del body
router.post('/generos', controllers.crearGenero);

// PUT /api/generos/:id → reemplaza el género completo (todos los campos del body)
router.put('/generos/:id', controllers.reemplazarGenero);

// PATCH /api/generos/:id → actualización parcial: busca el género y sobreescribe solo los campos recibidos
router.patch('/generos/:id', controllers.actualizarGenero);

// DELETE /api/generos/:id → soft delete: setea { borrado: true }, no elimina el documento
router.delete('/generos/:id', controllers.eliminarGenero);

export default router;
