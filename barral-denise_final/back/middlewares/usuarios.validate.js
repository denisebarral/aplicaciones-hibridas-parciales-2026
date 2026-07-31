/**
 * middlewares/usuarios.validate.js
 *
 * Middlewares de validación para las rutas de usuarios (login y registro).
 * Validan el body contra los schemas Yup definidos en schemas/usuarios.js
 * antes de que la petición llegue al controller.
 *
 * Si la validación falla, responden 400 con el array de errores — el controller
 * nunca se ejecuta en ese caso.
 */

import { loginSchema, registerSchema, googleAuthSchema } from '../schemas/usuarios.js';

/**
 * Valida el body de la petición de login contra loginSchema.
 *
 * @param {import('express').Request}       req
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export async function validateLogin(req, res, next) {
    try {
        // abortEarly: false → Yup acumula TODOS los errores en lugar de parar al primero
        // Así el cliente recibe todos los problemas de una sola vez
        await loginSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        // error.errors: array de strings con todos los mensajes de error que devuelve Yup
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: error.errors });
    }
}

/**
 * Valida el body de la petición de registro contra registerSchema.
 * Incluye validación de fortaleza de contraseña y confirmación.
 *
 * @param {import('express').Request}       req
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export async function validateRegister(req, res, next) {
    try {
        await registerSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: error.errors });
    }
}

/**
 * Valida el body de la petición de login/registro con Google contra googleAuthSchema.
 * Solo chequea que venga el campo "credential" — la verificación real del
 * token (firma, expiración, audience) la hace el service con google-auth-library,
 * porque Yup no puede validar eso.
 *
 * @param {import('express').Request}       req
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export async function validateGoogleAuth(req, res, next) {
    try {
        await googleAuthSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: error.errors });
    }
}
