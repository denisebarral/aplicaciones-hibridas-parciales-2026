/**
 * api/controllers/generos.controllers.js
 *
 * Controladores de la API REST para el recurso "generos".
 * Responden siempre con JSON. Delegan toda la lógica de BD al service.
 */

import * as service from '../../services/generos.service.js';

/**
 * Devuelve todos los géneros en formato JSON.
 * Los géneros marcados con borrado: true son excluidos por el service.
 *
 * GET /api/generos
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function obtenerGeneros(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Obtiene todos los géneros (excluye los borrados)'
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
 *
 * GET /api/generos/:id
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del género.
 * @param {import('express').Response} res
 */
export async function obtenerGeneroPorId(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Obtiene un género por ID'
    try {
        const genero = await service.obtenerPorId(req.params.id);
        if (!genero) {
            return res.status(404).json({ mensaje: 'Género no encontrado' });
        }
        res.status(200).json(genero);
    } catch (error) {
        console.error('Error al obtener género por id:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Crea un nuevo género.
 *
 * POST /api/generos
 * Body: { nombre, slug, descripcion }
 *
 * @param {import('express').Request}  req - Body con los datos del género.
 * @param {import('express').Response} res
 */
export async function crearGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Crea un nuevo género'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Datos del nuevo género',
            schema: { $ref: '#/definitions/Genero' }
        } */
        // Construimos el objeto explícitamente para controlar qué campos entran a la BD
        const genero = {
            nombre: req.body.nombre,
            slug: req.body.slug,
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
 * Reemplaza un género existente (PUT — reemplazo total).
 *
 * PUT /api/generos/:id
 * Body: el género COMPLETO con todos sus campos.
 *
 * Se construye el objeto explícitamente con todos los campos del género.
 * Los campos que no vengan en el body quedan undefined y MongoDB los omite del $set,
 * por eso PUT se usa cuando se envía el objeto completo.
 * Para actualizar solo algunos campos, usar PATCH /api/generos/:id.
 *
 * @param {import('express').Request}  req - req.params.id + body con TODOS los campos del género.
 * @param {import('express').Response} res
 */
export async function reemplazarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Reemplaza un género completo (PUT). Enviar todos los campos.'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Género completo. Enviar todos los campos.',
            schema: { $ref: '#/definitions/Genero' }
        } */
        // Mapeamos explícitamente cada campo: los que no vienen en el body quedan undefined
        const genero = {
            nombre:      req.body?.nombre,
            slug:        req.body?.slug,
            descripcion: req.body?.descripcion
        };
        const resultado = await service.actualizar(req.params.id, genero);
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ mensaje: 'Género no encontrado' });
        }
        res.status(202).json({ mensaje: 'Género reemplazado', resultado });
    } catch (error) {
        console.error('Error al reemplazar género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Actualiza parcialmente un género existente (PATCH — actualización parcial).
 *
 * PATCH /api/generos/:id
 * Body: solo los campos que se quieren modificar.
 *   Ej: { "descripcion": "Nueva descripción" } → solo cambia la descripción, el resto queda intacto.
 *
 * Diferencia con PUT:
 *   PUT   → el cliente manda el género COMPLETO; lo que no manda se omite del $set.
 *   PATCH → el cliente manda solo lo que cambia; los demás campos se preservan
 *           porque primero buscamos el doc actual y lo usamos como base.
 *
 * Flujo:
 *   1. Busca el género actual en la BD (obtenerPorId).
 *   2. Para cada campo: si vino en el body usa el valor nuevo, si no conserva el viejo.
 *   3. Llama al service con el objeto completo resultante.
 *
 * @param {import('express').Request}  req - req.params.id + body con los campos a modificar.
 * @param {import('express').Response} res
 */
export async function actualizarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Actualiza parcialmente un género (PATCH). Solo enviar los campos a cambiar.'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Solo los campos a modificar. El resto se preserva.',
            schema: { $ref: '#/definitions/Genero' }
        } */
        const id = req.params.id;

        // Traemos el documento actual ANTES de modificar para poder hacer el merge campo por campo
        const generoAntiguo = await service.obtenerPorId(id);
        if (!generoAntiguo) {
            return res.status(404).json({ mensaje: 'Género no encontrado' });
        }

        // Por cada campo: si el body lo trae usamos el valor nuevo, si no conservamos el viejo
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
 * Soft delete: marca el género como borrado sin eliminarlo físicamente (DELETE).
 *
 * DELETE /api/generos/:id
 *
 * No borra el documento de MongoDB: setea { borrado: true } via el service.
 * El género deja de aparecer en GET /api/generos porque obtenerTodos() lo filtra.
 * También deja de aparecer en el dropdown del navbar del sitio.
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del género.
 * @param {import('express').Response} res
 */
export async function eliminarGenero(req, res) {
    // #swagger.tags = ['Generos']
    // #swagger.summary = 'Soft delete: marca el género como borrado (no lo elimina físicamente)'
    try {
        const resultado = await service.eliminar(req.params.id);
        // matchedCount === 0 significa que no existe ningún género con ese _id
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ mensaje: 'Género no encontrado' });
        }
        res.status(200).json({ mensaje: 'Género marcado como borrado', resultado });
    } catch (error) {
        console.error('Error al borrar género:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
