/**
 * generos.service.js
 *
 * Capa de servicios para la colección "generos".
 * Contiene toda la lógica de acceso a MongoDB.
 * No sabe nada de HTTP: no usa req, res ni Express.
 */

import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

/**
 * Obtiene todos los géneros de la colección.
 *
 * @returns {Promise<Array>} Array de documentos de la colección generos.
 */
export async function obtenerTodos() {
    try {
        await client.connect();
        // Base del filtro: excluye los documentos marcados como borrados (soft delete)
        // $ne: "not equal" — trae todos los docs donde borrado NO sea true (incluye los que no tienen el campo)
        // Usamos toArray() para convertir lo que devuelve find() (un cursor) en un array de documentos que luego podemos manipular o enviar al cliente. Si no usamos toArray(), lo que obtenemos es un cursor que no se puede usar directamente.
        return db.collection('generos').find({ borrado: { $ne: true } }).toArray();
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Obtiene un género por su ObjectId.
 *
 * @param {string} id - ObjectId del género como string.
 * @returns {Promise<Object|null>} El documento del género, o null si no existe.
 */
export async function obtenerPorId(id) {
    try {
        await client.connect();
        return db.collection('generos').findOne({ _id: new ObjectId(id) });
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Inserta un nuevo género en la colección.
 *
 * @param {Object} genero - Objeto con nombre, slug y descripcion.
 * @returns {Promise<InsertOneResult>} Resultado de insertOne con el _id generado.
 */
export async function crear(genero) {
    try {
        await client.connect();
        return db.collection('generos').insertOne(genero);
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Actualiza los campos de un género existente.
 *
 * @param {string} id     - ObjectId del género a modificar.
 * @param {Object} campos - Campos a actualizar (puede ser parcial).
 * @returns {Promise<UpdateResult>} Resultado de updateOne.
 */
export async function actualizar(id, campos) {
    try {
        await client.connect();
        // Excluimos _id del $set por si viene en el body (MongoDB no permite modificar el _id)
        const { _id, ...camposSinId } = campos;
        // Filtramos los campos undefined: el driver v7 los convierte en null en la BD
        const camposDefinidos = Object.fromEntries(
            Object.entries(camposSinId).filter(([_, v]) => v !== undefined)
        );
        return db.collection('generos').updateOne(
            { _id: new ObjectId(id) },
            { $set: camposDefinidos }
        );
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Soft delete: marca el género como borrado sin eliminarlo físicamente de la colección.
 *
 * En lugar de deleteOne (irreversible), usa updateOne con $set para agregar { borrado: true }.
 * El documento sigue existiendo en MongoDB pero obtenerTodos() lo excluye automáticamente
 * gracias al filtro base { borrado: { $ne: true } }.
 *
 * @param {string} id - ObjectId del género a marcar como borrado.
 * @returns {Promise<UpdateResult>} Resultado de updateOne con matchedCount y modifiedCount.
 */
export async function eliminar(id) {
    try {
        await client.connect();
        // $set solo modifica el campo especificado; el resto del documento queda intacto
        return db.collection('generos').updateOne(
            { _id: new ObjectId(id) },
            { $set: { borrado: true } }
        );
    } catch (error) {
        throw new Error(error);
    }
}
