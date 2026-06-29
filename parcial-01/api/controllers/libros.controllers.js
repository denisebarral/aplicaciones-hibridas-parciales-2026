/**
 * api/controllers/libros.controllers.js
 *
 * Controladores de la API REST para el recurso "libros".
 * Responden siempre con JSON. Delegan toda la lógica de BD al service.
 */

import * as service from '../../services/libros.service.js';

/**
 * Devuelve todos los libros en formato JSON.
 * Acepta filtros opcionales por query params.
 *
 * GET /api/libros
 * GET /api/libros?seccion=narrativa
 * GET /api/libros?precio_min=1000
 * GET /api/libros?precio_max=5000
 * GET /api/libros?seccion=narrativa&precio_min=1000&precio_max=5000
 *
 * @param {import('express').Request}  req - Puede contener req.query.seccion, req.query.precio_min y/o req.query.precio_max.
 * @param {import('express').Response} res
 */
export async function obtenerLibros(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Obtiene todos los libros, con filtros opcionales por seccion y rango de precio'
    try {
        // Construimos el filtro dinámicamente según los query params recibidos
        const filtro = {};
        if (req.query.seccion) filtro.seccion = req.query.seccion;
        if (req.query.precio_min) filtro.precio_min = req.query.precio_min;
        if (req.query.precio_max) filtro.precio_max = req.query.precio_max;

        // Llamamos al service — toda la lógica de BD está allá
        const libros = await service.obtenerTodos(filtro);
        res.status(200).json(libros);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Devuelve un libro por su ObjectId.
 *
 * GET /api/libros/:id
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del libro.
 * @param {import('express').Response} res
 */
export async function obtenerLibroPorId(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Obtiene un libro por ID'
    try {
        const libro = await service.obtenerPorId(req.params.id);
        if (!libro) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }
        res.status(200).json(libro);
    } catch (error) {
        console.error('Error al obtener libro por id:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Crea un nuevo libro en la colección.
 *
 * POST /api/libros
 * Body: { titulo, autor, genero, descripcion, precio, anio_publicacion, editorial, imagen, link, seccion }
 *
 * @param {import('express').Request}  req - Body con los datos del libro.
 * @param {import('express').Response} res
 */
export async function crearLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Crea un nuevo libro'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Datos del nuevo libro',
            schema: { $ref: '#/definitions/Libro' }
        } */
        // Construimos el objeto explícitamente para controlar qué campos entran a la BD
        const libro = {
            titulo: req.body.titulo,
            autor: req.body.autor,
            genero: req.body.genero,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            anio_publicacion: req.body.anio_publicacion,
            editorial: req.body.editorial,
            imagen: req.body.imagen,
            link: req.body.link,
            seccion: req.body.seccion
        };
        const resultado = await service.crear(libro);
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Reemplaza un libro existente (PUT — reemplazo total).
 *
 * PUT /api/libros/:id
 * Body: el libro COMPLETO con todos sus campos.
 *
 * Se construye el objeto explícitamente con todos los campos del libro.
 * Los campos que no vengan en el body quedan undefined y MongoDB los omite del $set,
 * por eso PUT se usa cuando se envía el objeto completo.
 * Para actualizar solo algunos campos, usar PATCH /api/libros/:id.
 *
 * @param {import('express').Request}  req - req.params.id + body con TODOS los campos del libro.
 * @param {import('express').Response} res
 */
export async function reemplazarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Reemplaza un libro completo (PUT). Enviar todos los campos.'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Libro completo. Enviar todos los campos.',
            schema: { $ref: '#/definitions/Libro' }
        } */
        // Mapeamos explícitamente cada campo: los que no vienen en el body quedan undefined
        const libro = {
            titulo:            req.body?.titulo,
            autor:             req.body?.autor,
            genero:            req.body?.genero,
            descripcion:       req.body?.descripcion,
            precio:            req.body?.precio,
            anio_publicacion:  req.body?.anio_publicacion,
            editorial:         req.body?.editorial,
            imagen:            req.body?.imagen,
            link:              req.body?.link,
            seccion:           req.body?.seccion
        };
        const resultado = await service.actualizar(req.params.id, libro);
        // matchedCount: https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/#return-value
        // Sirve para saber si el _id que queremos modificar existe o no. Si es 0, no se encontró el libro.
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }
        res.status(202).json({ mensaje: 'Libro reemplazado', resultado });
    } catch (error) {
        console.error('Error al reemplazar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Actualiza parcialmente un libro existente (PATCH — actualización parcial).
 *
 * PATCH /api/libros/:id
 * Body: solo los campos que se quieren modificar.
 *   Ej: { "precio": 3500 }  → solo cambia el precio, el resto queda intacto.
 *
 * Diferencia con PUT:
 *   PUT   → el cliente manda el libro COMPLETO; lo que no manda se omite del $set.
 *   PATCH → el cliente manda solo lo que cambia; los demás campos se preservan
 *           porque primero buscamos el doc actual y lo usamos como base.
 *
 * Flujo:
 *   1. Busca el libro actual en la BD (obtenerPorId).
 *   2. Para cada campo: si vino en el body usa el valor nuevo, si no conserva el viejo.
 *   3. Llama al service con el objeto completo resultante.
 *
 * @param {import('express').Request}  req - req.params.id + body con los campos a modificar.
 * @param {import('express').Response} res
 */
export async function actualizarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Actualiza parcialmente un libro (PATCH). Solo enviar los campos a cambiar.'
    try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Solo los campos a modificar. El resto se preserva.',
            schema: { $ref: '#/definitions/Libro' }
        } */
        const id = req.params.id;

        // Traemos el documento actual ANTES de modificar para poder hacer el merge campo por campo
        const libroAntiguo = await service.obtenerPorId(id);
        if (!libroAntiguo) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }

        // Por cada campo: si el body lo trae usamos el valor nuevo, si no conservamos el viejo
        const libro = {
            titulo:           req.body?.titulo           ? req.body.titulo           : libroAntiguo.titulo,
            autor:            req.body?.autor            ? req.body.autor            : libroAntiguo.autor,
            genero:           req.body?.genero           ? req.body.genero           : libroAntiguo.genero,
            descripcion:      req.body?.descripcion      ? req.body.descripcion      : libroAntiguo.descripcion,
            precio:           req.body?.precio           ? req.body.precio           : libroAntiguo.precio,
            anio_publicacion: req.body?.anio_publicacion ? req.body.anio_publicacion : libroAntiguo.anio_publicacion,
            editorial:        req.body?.editorial        ? req.body.editorial        : libroAntiguo.editorial,
            imagen:           req.body?.imagen           ? req.body.imagen           : libroAntiguo.imagen,
            link:             req.body?.link             ? req.body.link             : libroAntiguo.link,
            seccion:          req.body?.seccion          ? req.body.seccion          : libroAntiguo.seccion
        };

        const resultado = await service.actualizar(id, libro);
        res.status(202).json({ mensaje: 'Libro actualizado', resultado });
    } catch (error) {
        console.error('Error al actualizar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Soft delete: marca el libro como borrado sin eliminarlo físicamente (DELETE).
 *
 * DELETE /api/libros/:id
 *
 * No borra el documento de MongoDB: setea { borrado: true } via el service.
 * El libro deja de aparecer en GET /api/libros porque obtenerTodos() lo filtra.
 * Para ver libros borrados se puede consultar directamente en MongoDB Atlas.
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del libro.
 * @param {import('express').Response} res
 */
export async function eliminarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Soft delete: marca el libro como borrado (no lo elimina físicamente)'
    try {
        const resultado = await service.eliminar(req.params.id);
        // matchedCount === 0 significa que no existe ningún libro con ese _id
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }
        res.status(200).json({ mensaje: 'Libro marcado como borrado', resultado });
    } catch (error) {
        console.error('Error al borrar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
