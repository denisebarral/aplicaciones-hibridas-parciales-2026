/**
 * api/routes/libros.routes.js
 *
 * Rutas de la API REST para el recurso "libros".
 * Montadas bajo el prefijo /api en main.js.
 *
 * GET    /api/libros        → todos los libros (acepta ?seccion=, ?precio_min=, ?precio_max=)
 * GET    /api/libros/:id    → un libro por ObjectId
 * POST   /api/libros        → crea un nuevo libro
 * PUT    /api/libros/:id    → reemplaza un libro (enviar objeto completo)
 * PATCH  /api/libros/:id    → actualización parcial (enviar solo los campos a cambiar)
 * DELETE /api/libros/:id    → elimina un libro
 */

import express from 'express';
import * as controllers from '../controllers/libros.controllers.js';

const router = express.Router();

// GET /api/libros → devuelve todos los libros (acepta ?seccion=narrativa, ?precio_min=, ?precio_max=)
router.get('/libros', controllers.obtenerLibros);

// GET /api/libros/:id → devuelve un libro por su ObjectId
router.get('/libros/:id', controllers.obtenerLibroPorId);

// POST /api/libros → crea un nuevo libro con los datos del body
router.post('/libros', controllers.crearLibro);

// PUT /api/libros/:id → reemplaza el libro completo (todos los campos del body)
router.put('/libros/:id', controllers.reemplazarLibro);

// PATCH /api/libros/:id → actualización parcial: busca el libro, y sobreescribe solo los campos recibidos
router.patch('/libros/:id', controllers.actualizarLibro);

// DELETE /api/libros/:id → elimina un libro de la colección
router.delete('/libros/:id', controllers.eliminarLibro);

export default router;
