/**
 * api/routes/libros.routes.js
 *
 * Rutas de la API REST para el recurso "libros".
 * Montadas bajo el prefijo /api en main.js.
 *
 * GET    /api/libros        → público (sin JWT) — acepta ?seccion=, ?precio_min=, ?precio_max=
 * GET    /api/libros/:id    → público (sin JWT)
 * POST   /api/libros        → requiere JWT + imagen (multer + sharp)
 * PUT    /api/libros/:id    → requiere JWT + imagen opcional
 * PATCH  /api/libros/:id    → requiere JWT + imagen opcional
 * DELETE /api/libros/:id    → requiere JWT
 *
 * Orden de middlewares para rutas con imagen:
 *   1. upload.single('imagen') → multer procesa el FormData y guarda el archivo en uploads/
 *   2. resizeImage             → sharp convierte a .webp y actualiza req.file.filename
 *   3. libroValidate           → Yup valida los campos de texto del body (solo POST y PUT)
 *   4. tokenValidate           → verifica el JWT del header Authorization
 *   5. controller              → ejecuta la lógica de negocio
 */

import express from 'express';
import * as controllers from '../controllers/libros.controllers.js';
import { upload, resizeImage } from '../../middlewares/imagenes.upload.js';
import { libroValidate } from '../../middlewares/libros.validate.js';
import { tokenValidate } from '../../middlewares/token.validate.js';

const router = express.Router();

// Rutas públicas (sin JWT) — el catálogo es visible para todos
router.get('/libros',     controllers.obtenerLibros);
router.get('/libros/:id', controllers.obtenerLibroPorId);

// Rutas protegidas (requieren JWT) — solo empleados autenticados:

// Ruta para crear un libro nuevo: requiere imagen y body completo
router.post('/libros',
    upload.single('imagen'), resizeImage, libroValidate, tokenValidate,
    controllers.crearLibro
);

// Ruta para reemplazar un libro existente: requiere body completo, imagen opcional
router.put('/libros/:id',
    upload.single('imagen'), resizeImage, libroValidate, tokenValidate,
    controllers.reemplazarLibro
);

// Ruta para actualizar parcialmente un libro existente: body parcial, imagen opcional
// PATCH no usa libroValidate (actualización parcial — campos son opcionales)
// Es el endpoint que usa el front para editar; el service borra la imagen anterior si viene una nueva
router.patch('/libros/:id',
    upload.single('imagen'), resizeImage, tokenValidate,
    controllers.modificarLibro
);

// Ruta para eliminar un libro existente: no requiere body ni imagen
router.delete('/libros/:id',
    tokenValidate,
    controllers.eliminarLibro
);

export default router;
