/**
 * libros.service.js
 *
 * Capa de servicios para la colección "libros".
 * Contiene toda la lógica de acceso a MongoDB.
 * No sabe nada de HTTP: no usa req, res ni Express.
 */

import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

/**
 * Obtiene todos los libros de la base de datos.
 * Permite filtrar opcionalmente por sección y/o rango de precio.
 *
 * @param {Object} filtro             - Objeto con los filtros a aplicar (puede estar vacío).
 * @param {string} [filtro.seccion]   - Slug de la sección para filtrar.
 * @param {string} [filtro.precio_min] - Precio mínimo (inclusivo). Ej: "1000"
 * @param {string} [filtro.precio_max] - Precio máximo (inclusivo). Ej: "5000"
 * @returns {Promise<Array>} Array de documentos de la colección libros.
 */
export async function obtenerTodos(filtro = {}) {
    try {
        await client.connect();

        // Base del filtro: excluye los documentos marcados como borrados (soft delete)
        // $ne: "not equal" — trae todos los docs donde borrado NO sea true (incluye los que no tienen el campo)
        const filtroMongo = { borrado: { $ne: true } };

        if (filtro?.seccion) filtroMongo.seccion = filtro.seccion;

        // Si viene precio_max, agrega condición $lt (less than) sobre el campo precio
        if (filtro?.precio_max) filtroMongo.precio = { $lt: parseInt(filtro.precio_max) };

        // Si viene precio_min, agrega condición $gt (greater than) sobre el campo precio
        if (filtro?.precio_min) filtroMongo.precio = { $gt: parseInt(filtro.precio_min) };

        // Si vienen ambos filtros de precio, los combinamos con $and para que se apliquen simultáneamente
        // $and: https://www.mongodb.com/es/docs/manual/reference/operator/query/and/
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
 *
 * @param {Object} libro - Objeto con todos los campos del libro.
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
 * Actualiza los campos de un libro existente.
 *
 * @param {string} id     - ObjectId del libro a modificar.
 * @param {Object} campos - Campos a actualizar (puede ser parcial).
 * @returns {Promise<UpdateResult>} Resultado de updateOne.
 */
export async function actualizar(id, campos) {
    try {
        await client.connect();
        // Excluimos _id del $set por si viene en el body (MongoDB no permite modificar el _id)
        const { _id, ...camposSinId } = campos;
        // Filtramos los campos undefined: el driver v7 los convierte en null en la BD
        // Object.entries() convierte el objeto en array de pares [clave, valor]
        // filter() descarta los pares cuyo valor sea undefined
        // Object.fromEntries() reconstruye el objeto limpio
        const camposDefinidos = Object.fromEntries(
            Object.entries(camposSinId).filter(([_, v]) => v !== undefined)
        );
        return db.collection('libros').updateOne(
            { _id: new ObjectId(id) },
            { $set: camposDefinidos }
        );
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Soft delete: marca el libro como borrado sin eliminarlo físicamente de la colección.
 *
 * En lugar de deleteOne (irreversible), usa updateOne con $set para agregar { borrado: true }.
 * El documento sigue existiendo en MongoDB pero obtenerTodos() lo excluye automáticamente
 * gracias al filtro base { borrado: { $ne: true } }.
 * Esto permite recuperar el historial o restaurar un libro si fuera necesario.
 *
 * @param {string} id - ObjectId del libro a marcar como borrado.
 * @returns {Promise<UpdateResult>} Resultado de updateOne con matchedCount y modifiedCount.
 */
export async function eliminar(id) {
    try {
        await client.connect();
        // $set solo modifica el campo especificado; el resto del documento queda intacto
        return db.collection('libros').updateOne(
            { _id: new ObjectId(id) },
            { $set: { borrado: true } }
        );
    } catch (error) {
        throw new Error(error);
    }
}
