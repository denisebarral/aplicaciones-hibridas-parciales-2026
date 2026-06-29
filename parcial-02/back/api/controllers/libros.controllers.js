/**
 * api/controllers/libros.controllers.js
 *
 * Controladores de la API REST para el recurso "libros".
 * Responden siempre con JSON. Delegan toda la lógica de BD al service.
 *
 * Cambios respecto al parcial-01:
 *   - Las rutas de escritura (POST, PUT, PATCH, DELETE) ahora requieren JWT
 *   - POST y PUT esperan imagen como archivo (req.file), no como URL en el body
 *   - DELETE hace hard delete (el service elimina el archivo del disco)
 *   - precio y anio_publicacion se parsean a número (FormData los envía como string)
 *   - PUT usa service.reemplazarLibro (replaceOne), PATCH usa service.modificarLibro (updateOne + $set)
 */

import * as service from '../../services/libros.service.js';

/**
 * Devuelve todos los libros. Acepta filtros opcionales por query params.
 * Ruta pública — no requiere JWT.
 *
 * GET /api/libros
 * GET /api/libros?seccion=narrativa
 * GET /api/libros?precio_min=1000&precio_max=5000
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function obtenerLibros(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Obtiene todos los libros (público). Acepta ?seccion=, ?precio_min=, ?precio_max='
    try {
        const filtro = {};
        // Pregunto si llegaron query params y los agrego al filtro.
        // Si por ejemplo llegan 2 filtros como ?seccion=narrativa&precio_max=5000, el filtro final que pasaría a obtenerTodos será: filtro { seccion: 'narrativa', precio_max: '5000' }
        if (req.query.seccion)     filtro.seccion     = req.query.seccion;
        if (req.query.precio_min)  filtro.precio_min  = req.query.precio_min;
        if (req.query.precio_max)  filtro.precio_max  = req.query.precio_max;

        const libros = await service.obtenerTodos(filtro);
        res.status(200).json(libros);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Devuelve un libro por su ObjectId.
 * Ruta pública — no requiere JWT.
 *
 * GET /api/libros/:id
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del libro
 * @param {import('express').Response} res
 */
export async function obtenerLibroPorId(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Obtiene un libro por ID (público)'
    try {
        const libro = await service.obtenerPorId(req.params.id);
        if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
        res.status(200).json(libro);
    } catch (error) {
        console.error('Error al obtener libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Crea un nuevo libro con imagen de portada.
 * Requiere JWT. La imagen llega procesada por multer + sharp (req.file.filename = .webp).
 *
 * POST /api/libros
 * Body: FormData con campos de texto + campo "imagen" (file)
 *
 * @param {import('express').Request}  req - req.body (campos de texto) + req.file (imagen procesada)
 * @param {import('express').Response} res
 */
export async function crearLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Crea un nuevo libro con imagen (requiere JWT)'
    // #swagger.consumes = ['multipart/form-data']
    // #swagger.security = [{ "Bearer": [] }]
    // #swagger.parameters['imagen'] = { in: 'formData', type: 'file', required: true, description: 'Imagen de portada (jpg, png, webp — el back la convierte a .webp)' }
    // #swagger.parameters['titulo'] = { in: 'formData', type: 'string', required: true, description: 'Título del libro' }
    // #swagger.parameters['autor'] = { in: 'formData', type: 'string', required: true, description: 'Nombre del autor' }
    // #swagger.parameters['genero'] = { in: 'formData', type: 'string', required: true, description: 'Género: crónica, poesía, ensayo, cuentos, novela' }
    // #swagger.parameters['descripcion'] = { in: 'formData', type: 'string', required: true, description: 'Descripción o sinopsis' }
    // #swagger.parameters['precio'] = { in: 'formData', type: 'number', required: true, description: 'Precio en ARS' }
    // #swagger.parameters['anio_publicacion'] = { in: 'formData', type: 'integer', required: true, description: 'Año de publicación' }
    // #swagger.parameters['editorial'] = { in: 'formData', type: 'string', required: true, description: 'Editorial' }
    // #swagger.parameters['seccion'] = { in: 'formData', type: 'string', required: true, description: 'Sección: cronica, poesia, ensayo, cuentos, narrativa' }
    // #swagger.parameters['link'] = { in: 'formData', type: 'string', description: 'URL externa opcional (ej: Google Books)' }

    // Hago una segunda validación de la imagen, aunque multer + sharp ya deberían haberla procesado. Esto es para devolver un error 400 si no viene imagen, en lugar de un 500 por intentar acceder a req.file.filename.
    try {
        if (!req.file) return res.status(400).json({ mensaje: 'La imagen del libro es requerida' });

        const libro = {
            titulo:           req.body.titulo,
            autor:            req.body.autor,
            genero:           req.body.genero,
            descripcion:      req.body.descripcion,
            // FormData envía todo como string — Number() convierte al tipo correcto
            precio:           Number(req.body.precio),
            anio_publicacion: Number(req.body.anio_publicacion),
            editorial:        req.body.editorial,
            link:             req.body.link || null,
            seccion:          req.body.seccion,
            // req.file.filename: nombre del .webp generado por sharp (ej: "1781835478711.webp")
            imagen:           req.file.filename
        };

        const resultado = await service.crear(libro);
        res.status(201).json(resultado);
        console.log('Libro creado con éxito:', resultado);
    } catch (error) {
        console.error('Error al crear libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * reemplazarLibro - Reemplaza un libro completo (PUT).
 * Requiere JWT e imagen obligatoria (400 si no viene req.file).
 * El service usa replaceOne: el documento entero se sobreescribe.
 * El service borra automáticamente la imagen anterior del disco.
 *
 * PUT /api/libros/:id
 * Body: FormData con TODOS los campos del libro + campo "imagen" (requerido)
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function reemplazarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Reemplaza un libro completo con replaceOne (requiere JWT + imagen obligatoria)'
    // #swagger.consumes = ['multipart/form-data']
    // #swagger.security = [{ "Bearer": [] }]
    // #swagger.parameters['imagen'] = { in: 'formData', type: 'file', required: true, description: 'Nueva imagen de portada (obligatoria en PUT — reemplaza todo el documento)' }
    // #swagger.parameters['titulo'] = { in: 'formData', type: 'string', required: true, description: 'Título del libro' }
    // #swagger.parameters['autor'] = { in: 'formData', type: 'string', required: true, description: 'Nombre del autor' }
    // #swagger.parameters['genero'] = { in: 'formData', type: 'string', required: true, description: 'Género: crónica, poesía, ensayo, cuentos, novela' }
    // #swagger.parameters['descripcion'] = { in: 'formData', type: 'string', required: true, description: 'Descripción o sinopsis' }
    // #swagger.parameters['precio'] = { in: 'formData', type: 'number', required: true, description: 'Precio en ARS' }
    // #swagger.parameters['anio_publicacion'] = { in: 'formData', type: 'integer', required: true, description: 'Año de publicación' }
    // #swagger.parameters['editorial'] = { in: 'formData', type: 'string', required: true, description: 'Editorial' }
    // #swagger.parameters['seccion'] = { in: 'formData', type: 'string', required: true, description: 'Sección: cronica, poesia, ensayo, cuentos, narrativa' }
    // #swagger.parameters['link'] = { in: 'formData', type: 'string', description: 'URL externa opcional' }
    try {
        // PUT reemplaza el documento entero: sin imagen se perdería el campo imagen en la BD, por eso la validamos aquí y devolvemos 400 si no viene.
        if (!req.file) return res.status(400).json({ mensaje: 'La imagen es requerida para reemplazar el libro' });

        const libro = {
            titulo:           req.body.titulo,
            autor:            req.body.autor,
            genero:           req.body.genero,
            descripcion:      req.body.descripcion,
            precio:           Number(req.body.precio),
            anio_publicacion: Number(req.body.anio_publicacion),
            editorial:        req.body.editorial,
            link:             req.body.link || null,
            seccion:          req.body.seccion,
            imagen:           req.file.filename
        };

        const resultado = await service.reemplazarLibro(req.params.id, libro);
        // matchedCount: cuántos documentos se encontraron con ese _id (0 = no existía). Si no se encontró, devolvemos 404. Si se encontró, devolvemos 200 con el resultado de replaceOne.
        if (resultado.matchedCount === 0) return res.status(404).json({ mensaje: 'Libro no encontrado' });
        res.status(200).json({ mensaje: 'Libro reemplazado', resultado });
    } catch (error) {
        console.error('Error al reemplazar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * modificarLibro - Actualiza campos puntuales de un libro (PATCH).
 * Requiere JWT. Solo se actualizan los campos que vienen en el body.
 * Imagen opcional: si viene archivo nuevo, el service borra el anterior del disco.
 *
 * PATCH /api/libros/:id
 * Body: FormData con los campos a modificar (cualquier subconjunto) + imagen opcional
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function modificarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Actualiza parcialmente un libro con $set (requiere JWT). Imagen opcional.'
    // #swagger.consumes = ['multipart/form-data']
    // #swagger.security = [{ "Bearer": [] }]
    // #swagger.parameters['imagen'] = { in: 'formData', type: 'file', description: 'Nueva imagen opcional — si no se envía, se conserva la actual' }
    // #swagger.parameters['titulo'] = { in: 'formData', type: 'string', description: 'Título del libro' }
    // #swagger.parameters['autor'] = { in: 'formData', type: 'string', description: 'Nombre del autor' }
    // #swagger.parameters['genero'] = { in: 'formData', type: 'string', description: 'Género: crónica, poesía, ensayo, cuentos, novela' }
    // #swagger.parameters['descripcion'] = { in: 'formData', type: 'string', description: 'Descripción o sinopsis' }
    // #swagger.parameters['precio'] = { in: 'formData', type: 'number', description: 'Precio en ARS' }
    // #swagger.parameters['anio_publicacion'] = { in: 'formData', type: 'integer', description: 'Año de publicación' }
    // #swagger.parameters['editorial'] = { in: 'formData', type: 'string', description: 'Editorial' }
    // #swagger.parameters['seccion'] = { in: 'formData', type: 'string', description: 'Sección: cronica, poesia, ensayo, cuentos, narrativa' }
    // #swagger.parameters['link'] = { in: 'formData', type: 'string', description: 'URL externa opcional' }
    try {
        // Tomamos todos los campos de texto que vienen en el body
        const datos = { ...req.body };

        // Si el usuario subió imagen nueva, la agregamos a los datos a actualizar.
        // Si no subió nada (req.file es undefined), el campo imagen en la BD queda intacto.
        if (req.file) datos.imagen = req.file.filename;

        const resultado = await service.modificarLibro(req.params.id, datos);
        if (resultado.matchedCount === 0) return res.status(404).json({ mensaje: 'Libro no encontrado' });
        res.status(200).json({ mensaje: 'Libro actualizado', resultado });
    } catch (error) {
        console.error('Error al modificar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * Elimina un libro físicamente de MongoDB y borra su imagen del disco.
 * Requiere JWT. Hard delete (el service usa deleteOne).
 *
 * DELETE /api/libros/:id
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del libro
 * @param {import('express').Response} res
 */
export async function eliminarLibro(req, res) {
    // #swagger.tags = ['Libros']
    // #swagger.summary = 'Elimina un libro permanentemente, incluyendo su imagen (requiere JWT)'
    // #swagger.security = [{ "Bearer": [] }]
    try {
        const resultado = await service.eliminar(req.params.id);
        // deletedCount: cuántos documentos se borraron (0 = no existía el _id)
        if (resultado.deletedCount === 0) return res.status(404).json({ mensaje: 'Libro no encontrado' });
        res.status(200).json({ mensaje: 'Libro eliminado', resultado });
    } catch (error) {
        console.error('Error al eliminar libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
