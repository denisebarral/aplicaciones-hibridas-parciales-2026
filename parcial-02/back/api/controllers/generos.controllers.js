/**
 * api/controllers/generos.controllers.js
 *
 * Controladores de la API REST para el recurso "generos".
 * Responden siempre con JSON. Delegan toda la lógica de BD al service.
 *
 * Rutas GET son públicas. Rutas de escritura (POST, PUT, PATCH, DELETE) requieren JWT.
 */

import * as service from '../../services/generos.service.js';

/**
 * Devuelve todos los géneros (excluye los marcados como borrado: true).
 * Ruta pública — no requiere JWT.
 *
 * GET /api/generos
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function obtenerGeneros(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Obtiene todos los géneros (público)'
    try {
        const generos = await service.obtenerTodos();
        res.status(200).json(generos);
    } catch (error) {
        console.error('Error al obtener géneros:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Devuelve un género por su ObjectId.
 * Ruta pública — no requiere JWT.
 *
 * GET /api/generos/:id
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del género
 * @param {import('express').Response} res
 */
export async function obtenerGeneroPorId(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Obtiene un género por ID (público)'
    try {
        const genero = await service.obtenerPorId(req.params.id);
        if (!genero) return res.status(404).json({ mensaje: 'Género no encontrado' });
        res.status(200).json(genero);
    } catch (error) {
        console.error('Error al obtener género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Crea un nuevo género. Requiere JWT.
 *
 * POST /api/generos
 * Body: { nombre, slug, descripcion }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function crearGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Crea un nuevo género (requiere JWT)'
    try {
        const genero = {
            nombre:      req.body.nombre,
            slug:        req.body.slug,
            descripcion: req.body.descripcion
        };
        const resultado = await service.crear(genero);
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Reemplaza un género completo (PUT). Requiere JWT.
 *
 * PUT /api/generos/:id
 * Body: { nombre, slug, descripcion } — todos los campos
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function reemplazarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Reemplaza un género completo (requiere JWT)'
    try {
        const genero = {
            nombre:      req.body?.nombre,
            slug:        req.body?.slug,
            descripcion: req.body?.descripcion
        };
        const resultado = await service.actualizar(req.params.id, genero);
        if (resultado.matchedCount === 0) return res.status(404).json({ mensaje: 'Género no encontrado' });
        res.status(202).json({ mensaje: 'Género reemplazado', resultado });
    } catch (error) {
        console.error('Error al reemplazar género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Actualiza parcialmente un género (PATCH). Requiere JWT.
 *
 * PATCH /api/generos/:id
 * Body: solo los campos a modificar
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function actualizarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Actualiza parcialmente un género (requiere JWT)'
    try {
        const id = req.params.id;
        const generoAntiguo = await service.obtenerPorId(id);
        if (!generoAntiguo) return res.status(404).json({ mensaje: 'Género no encontrado' });

        const genero = {
            nombre:      req.body?.nombre      ? req.body.nombre      : generoAntiguo.nombre,
            slug:        req.body?.slug        ? req.body.slug        : generoAntiguo.slug,
            descripcion: req.body?.descripcion ? req.body.descripcion : generoAntiguo.descripcion
        };

        const resultado = await service.actualizar(id, genero);
        res.status(202).json({ mensaje: 'Género actualizado', resultado });
    } catch (error) {
        console.error('Error al actualizar género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Soft delete: marca el género como borrado. Requiere JWT.
 *
 * DELETE /api/generos/:id
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function eliminarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Soft delete de género (requiere JWT)'
    try {
        const resultado = await service.eliminar(req.params.id);
        if (resultado.matchedCount === 0) return res.status(404).json({ mensaje: 'Género no encontrado' });
        res.status(200).json({ mensaje: 'Género marcado como borrado', resultado });
    } catch (error) {
        console.error('Error al borrar género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
