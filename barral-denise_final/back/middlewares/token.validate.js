/**
 * middlewares/token.validate.js
 *
 * Middleware que protege rutas de la API REST.
 * Verifica que el header Authorization contenga un Bearer token válido.
 * Si el token es inválido o expiró, responde 401 — el cliente debe volver a loguearse.
 *
 * Se usa en las rutas que requieren autenticación (POST, PUT, PATCH, DELETE de libros y géneros).
 * Las rutas GET públicas no lo usan.
 */

import { validateToken } from '../services/token.service.js';

/**
 * Extrae, verifica y decodifica el JWT del header Authorization.
 * Si es válido, adjunta el payload a req.usuario y pasa al siguiente middleware.
 *
 * @param {import('express').Request}       req
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export function tokenValidate(req, res, next) {
    try {
        // El header debe venir en el formato: "Authorization: Bearer <token>"
        const authHeader = req.headers['authorization'];
        console.log('Authorization header:', authHeader); // Log para depuración
        if (!authHeader) return res.status(401).json({ mensaje: 'Token requerido' });

        // split(' ')[1]: descartamos "Bearer " y nos quedamos con el token solo
        // NOTA: split() es un método de String que divide la cadena en un array usando el separador daddo. En este caso, el separador es un espacio en blanco y el índice 1 del array resultante contiene el token.
        const token = authHeader.split(' ')[1];
        // Si el token no está presente después de "Bearer ", respondemos con 401
        if (!token) return res.status(401).json({ mensaje: 'Formato de token inválido. Usar: Bearer <token>' });

        // validateToken() lanza error si el token está vencido o fue manipulado
        const payload = validateToken(token);

        // Adjuntamos el payload al objeto request para que el controller pueda  saber quién está haciendo la acción. validateToken() retorna el payload decodificado del JWT, que contiene el email del usuario.
        req.usuario = payload;
        console.log('Token válido. Payload:', payload); // Log para depuración
        next();
    } catch {
        // No exponemos el motivo exacto del fallo para no dar información útil a un atacante
        return res.status(401).json({ mensaje: 'Token inválido o expirado. Volvé a iniciar sesión.' });
    }
}
