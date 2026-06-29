/**
 * libros.service.js
 *
 * Capa de servicios para la colección "libros".
 * Contiene toda la lógica de acceso a MongoDB y manejo de archivos de imagen en disco.
 * No sabe nada de HTTP: no usa req, res ni Express.
 *
 * Diferencia clave con generos.service.js:
 *   Los libros tienen imagen asociada en uploads/.
 *   Al eliminar o actualizar con imagen nueva, hay que borrar el archivo viejo del disco
 *   para no acumular archivos huérfanos.
 *   Por eso, eliminar() es un HARD DELETE (deleteOne), no soft delete.
 */

import { MongoClient, ObjectId } from 'mongodb';
import { unlink } from 'fs/promises';

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

/**
 * Borra el archivo de imagen del disco si existe.
 * Función interna: se usa en eliminar() y actualizar() cuando hay imagen nueva.
 *
 * @param {string|null} imagen - Nombre del archivo en uploads/ (ej: "1781835478711.webp").
 *                                 Si es null/undefined, no hace nada.
 */
async function borrarImagenDeDisco(imagen) {
    if (!imagen) return;
    try {
        await unlink(`uploads/${imagen}`);
    } catch {
        // Si el archivo ya no existe en disco, ignoramos el error silenciosamente
        // (puede haberse borrado manualmente o no haberse guardado nunca)
    }
}

/**
 * Obtiene todos los libros, con filtros opcionales.
 *
 * @param {Object} filtro - Filtros opcionales: { seccion, precio_min, precio_max }
 * @returns {Promise<Array>} Array de documentos de la colección libros.
 */
export async function obtenerTodos(filtro = {}) {
    try {
        await client.connect();

        // 1- Excluimos los libros marcados como borrado: true (soft delete)
        // $ne: "not equal" — excluye documentos marcados como borrado: true
        const filtroMongo = { borrado: { $ne: true } };

        // 2- Si llegan filtros de query params, los agregamos al filtro que construimos acá, que además, excluye los borrados. Por ejemplo, si llega ?seccion=narrativa, el filtroMongo final será:
        // { borrado: { $ne: true }, 
        //  seccion: 'narrativa' }
        if (filtro?.seccion) filtroMongo.seccion = filtro.seccion;
        if (filtro?.precio_max) filtroMongo.precio = { $lt: parseInt(filtro.precio_max) };
        if (filtro?.precio_min) filtroMongo.precio = { $gt: parseInt(filtro.precio_min) };

        //3- Si llegan ambos filtros de precio, usamos $and para combinarlos y obtener el rango correcto. $and: combina múltiples condiciones sobre el mismo campo. Esto asegura que el filtro final sea:
        // { borrado: { $ne: true }, 
        //   $and: [
        //     { precio: { $lte: parseInt(filtro.precio_max) } },
        //     { precio: { $gte: parseInt(filtro.precio_min) } }
        //   ]
        // } 
        if (filtro?.precio_min && filtro?.precio_max)
            filtroMongo.$and = [
                { precio: { $lte: parseInt(filtro.precio_max) } },
                { precio: { $gte: parseInt(filtro.precio_min) } }
            ];

        return db.collection('libros').find(filtroMongo).toArray();
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Obtiene un libro por su ObjectId.
 *
 * @param {string} id - ObjectId del libro como string.
 * @returns {Promise<Object|null>} El documento del libro, o null si no existe.
 */
export async function obtenerPorId(id) {
    try {
        await client.connect();
        return db.collection('libros').findOne({ _id: new ObjectId(id) });
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Inserta un nuevo libro en la colección.
 * El campo imagen contiene el filename generado por multer/sharp (ej: "1781835478711.webp").
 *
 * @param {Object} libro - Objeto con todos los campos, incluyendo imagen (filename).
 * @returns {Promise<InsertOneResult>} Resultado de insertOne con el _id generado.
 */
export async function crear(libro) {
    try {
        await client.connect();
        return db.collection('libros').insertOne(libro);
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * reemplazarLibro - Reemplaza un documento completo (PUT) y borra la imagen anterior.
 *
 * Usa replaceOne: el documento entero se sobreescribe con el objeto que se pasa.
 * La imagen es obligatoria (el controller devuelve 400 si no viene req.file).
 * Antes de reemplazar, busca el libro actual para obtener el nombre de la imagen
 * vieja y borrarla del disco.
 *
 * @param {string} id    - ObjectId del libro como string.
 * @param {Object} libro - Objeto completo con todos los campos nuevos (sin _id).
 * @returns {Promise<ReplaceResult>} Resultado de replaceOne.
 */
export async function reemplazarLibro(id, libro) {
    try {
        await client.connect();

        // Buscamos el libro actual para saber qué imagen borrar del disco
        const libroActual = await db.collection('libros').findOne({ _id: new ObjectId(id) });

        const resultado = await db.collection('libros').replaceOne(
            { _id: new ObjectId(id) },
            libro
        );

        // Borramos la imagen anterior del disco si existía
        await borrarImagenDeDisco(libroActual?.imagen);

        return resultado;
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * modificarLibro - Actualiza campos puntuales (PATCH) y borra la imagen anterior si hay nueva.
 *
 * Usa updateOne con $set: solo se tocan los campos que vienen en el body.
 * Si el usuario no subió imagen nueva, el campo imagen de la BD queda intacto.
 * Si subió imagen nueva, busca el libro actual, borra la imagen vieja del disco,y el $set escribe el nuevo filename.
 *
 * @param {string} id    - ObjectId del libro como string.
 * @param {Object} datos - Campos a actualizar (cualquier subconjunto).
 * @returns {Promise<UpdateResult>} Resultado de updateOne.
 */
export async function modificarLibro(id, datos) {
    try {
        await client.connect();

        // Descartamos _id por si llegó en el body — MongoDB no permite modificar el _id con $set
        const { _id, ...campos } = datos;

        // Solo buscamos el libro actual si viene imagen nueva.
        // Si no hay imagen nueva, no tiene sentido hacer un findOne extra al servidor.
        let imagenAnterior = null;
        if (campos.imagen) {
            const libroActual = await db.collection('libros').findOne({ _id: new ObjectId(id) });
            imagenAnterior = libroActual?.imagen;
        }

        const resultado = await db.collection('libros').updateOne(
            { _id: new ObjectId(id) },
            { $set: campos }
        );

        // Borramos la imagen anterior del disco solo si vino imagen nueva
        await borrarImagenDeDisco(imagenAnterior);

        return resultado;
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Hard delete: elimina el libro de MongoDB Y borra su imagen del disco.
 *
 * A diferencia de generos (que usa soft delete), los libros tienen archivos asociados
 * en uploads/. Usar soft delete acumularía imágenes huérfanas en disco.
 * Por eso, usamos deleteOne (eliminación física).
 *
 * @param {string} id - ObjectId del libro a eliminar.
 * @returns {Promise<DeleteResult>} Resultado de deleteOne con deletedCount.
 */
export async function eliminar(id) {
    try {
        await client.connect();

        // Buscamos primero para obtener el filename de la imagen antes de borrar el documento
        const libro = await db.collection('libros').findOne({ _id: new ObjectId(id) });

        // Borramos la imagen del disco (si existe)
        await borrarImagenDeDisco(libro?.imagen);

        // Hard delete: borra el documento de MongoDB permanentemente
        return db.collection('libros').deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
        throw new Error(error);
    }
}
