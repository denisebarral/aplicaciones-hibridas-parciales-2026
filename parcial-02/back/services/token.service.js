/**
 * token.service.js
 *
 * Servicio de JWT: genera y valida tokens de autenticación.
 * No sabe nada de HTTP — solo maneja la firma y verificación del token.
 * El JWT_SECRET vive en .env para que nunca quede expuesto en el código.
 */

import jwt from 'jsonwebtoken';

/**
 * Genera un JWT firmado con la clave secreta del .env.
 *
 * @param {Object} payload - Datos a incluir en el token (ej: { email }).
 * No incluimos contraseñas ni datos sensibles aquí (en el servicio de login, le pasamos solo email a createToken).
 * @returns {string} Token JWT firmado, con expiración de 2 horas.
 */
export function createToken(payload) {
    // jwt.sign(payload, secret, options): firma el payload con la clave secreta
    // expiresIn: '2h' hace que el token expire a las 2 horas de ser emitido
    // Después de ese tiempo, validateToken() lanzará un error
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
}

/**
 * Verifica y decodifica un JWT.
 * Lanza un error si el token está vencido, fue manipulado o es inválido.
 *
 * @param {string} token - Token a verificar.
 * @returns {Object} Payload decodificado si el token es válido (ej: { email, iat, exp }).
 * @throws {Error} Si el token es inválido o expiró — el middleware lo captura y responde 401.
 */
export function validateToken(token) {
    // jwt.verify() re-hashea el token con el secret y compara
    // Si no coincide o expiró, lanza JsonWebTokenError o TokenExpiredError
    return jwt.verify(token, process.env.JWT_SECRET);
}
