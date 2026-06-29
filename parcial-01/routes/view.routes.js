/**
 * routes/view.routes.js
 *
 * Rutas del frontend — devuelven HTML al navegador.
 *
 * GET /                    → Home
 * GET /quienes-somos       → Quiénes Somos
 * GET /catalogo            → Catálogo completo (todos los libros)
 * GET /catalogo/:seccion   → Catálogo filtrado por sección
 * GET /contacto            → Contacto
 */

import express from 'express';
import * as controller from '../controllers/view.controller.js';

const router = express.Router();

// GET / → página principal con hero y libros destacados
router.get('/', controller.home);

// GET /quienes-somos → historia e información de la librería
router.get('/quienes-somos', controller.quienesSomos);

// GET /catalogo → muestra todos los libros (sin filtro)
// IMPORTANTE: la ruta base debe ir ANTES de la ruta con parámetro para evitar conflictos
router.get('/catalogo', controller.catalogo);

// GET /catalogo/:seccion → filtra libros por el slug de la sección (ej: /catalogo/narrativa)
router.get('/catalogo/:seccion', controller.catalogo);

// GET /contacto → formulario y datos de contacto
router.get('/contacto', controller.contacto);

export default router;
