/**
 * api/routes/usuarios.routes.js
 *
 * Rutas de la API REST para el recurso "usuarios".
 * Montadas bajo el prefijo /api en main.js.
 *
 * POST /api/         → registro de nuevo empleado (validateRegister)
 * POST /api/login    → login, devuelve JWT (validateLogin)
 *
 * Ninguna ruta requiere token (son las rutas de entrada al sistema).
 */

import express from 'express';
import * as controllers from '../controllers/usuarios.controllers.js';
import { validateLogin, validateRegister } from '../../middlewares/usuarios.validate.js';

const router = express.Router();

// POST /api/ → registra un nuevo usuario
// validateRegister valida email, fortaleza de contraseña y confirmación antes de llegar al controller
router.post('/', validateRegister, controllers.createUser);

// POST /api/login → autentica y devuelve { email, token }
// validateLogin valida que email y password vengan con formato correcto
router.post('/login', validateLogin, controllers.login);

export default router;
