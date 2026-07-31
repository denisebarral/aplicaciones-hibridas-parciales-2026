/**
 * api/controllers/usuarios.controllers.js
 *
 * Controladores de la API REST para el recurso "usuarios".
 * Solo maneja registro y login. Delega toda la lógica al service.
 * Responden siempre con JSON.
 */

import * as service from '../../services/usuarios.service.js';

/**
 * Registra un nuevo usuario.
 *
 * POST /api/
 * Body: { email, password, passwordConfirm }
 *
 * El middleware validateRegister ya garantizó que el body es válido
 * antes de que llegue aquí.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function createUser(req, res) {
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Registra un nuevo usuario (empleado de la librería)'
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RegisterBody' } }
    try {
        const resultado = await service.createUser({
            email:    req.body.email,
            password: req.body.password
            // passwordConfirm no se pasa al service: ya fue validado por el middleware
        });
        res.status(201).json({ mensaje: 'Usuario registrado correctamente', resultado });
    } catch (error) {
        // El service lanza un error con mensaje descriptivo si el email ya existe
        console.error('Error al registrar usuario:', error.message);
        res.status(400).json({ mensaje: error.message });
    }
}

/**
 * Autentica un usuario y devuelve un JWT.
 *
 * POST /api/login
 * Body: { email, password }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function login(req, res) {
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Inicia sesión y devuelve un JWT con expiración de 2 horas'
    try {
        const resultado = await service.login({
            email:    req.body.email,
            password: req.body.password
        });
        // resultado = { email, token } — sin contraseña ni _id
        res.status(200).json(resultado);
    } catch (error) {
        // Mensaje genérico para no revelar si el email existe o no
        console.error('Error en login:', error.message);
        res.status(400).json({ mensaje: error.message });
    }
}

/**
 * Autentica (o registra, si es la primera vez) a un usuario con Google y devuelve un JWT.
 *
 * POST /api/google
 * Body: { credential } — el ID Token que genera el botón <GoogleLogin> del frontend
 *
 * El middleware validateGoogleAuth ya garantizó que vino el credential
 * antes de que llegue acá. La verificación de que ese credential sea
 * realmente válido (firmado por Google, no vencido, etc.) la hace el service.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function loginConGoogle(req, res) {
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Registra o autentica un usuario con su cuenta de Google y devuelve un JWT'
    try {
        const resultado = await service.loginConGoogle({
            credential: req.body.credential
        });
        // resultado = { email, token } — mismo formato que login()
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en login con Google:', error.message);
        res.status(400).json({ mensaje: error.message });
    }
}
