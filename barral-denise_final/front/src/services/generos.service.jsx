/**
 * services/generos.service.jsx
 *
 * Hook con funciones para interactuar con los endpoints de géneros.
 * Ya no es solo lectura: ahora también expone crear/actualizar/eliminar,
 * que usamos desde el ABM de géneros en pages/admin.
 *
 * Requieren token (igual que en libros.service.jsx), pero acá NO usamos
 * FormData/buildFormData: los géneros no tienen campo de imagen, así que
 * viajan como JSON normal, igual que usuarios.service.jsx.
 */

import { useApi } from './api.service.jsx';

/**
 * Hook que expone todas las operaciones del recurso géneros.
 *
 * @returns {{ getGeneros, getGeneroPorId, crearGenero, actualizarGenero, eliminarGenero }}
 */
export function useGenerosService() {
    const { call } = useApi();

    /**
     * Obtiene todos los géneros (excluye los borrados).
     * Se usa en el NavBar para el dropdown de categorías.
     * Ruta pública — funciona sin token.
     *
     * @returns {Promise<Array>}
     */
    const getGeneros = () => call('/generos');

    /**
     * Obtiene un género por su ObjectId.
     *
     * @param {string} id
     * @returns {Promise<Object>}
     */
    const getGeneroPorId = (id) => call(`/generos/${id}`);

    /**
     * Crea un nuevo género.
     * Requiere token — solo empleados autenticados.
     *
     * @param {{ nombre: string, slug: string, descripcion: string }} datos
     * @returns {Promise<Object>} El resultado de insertOne (trae insertedId si salió bien)
     */
    const crearGenero = (datos) => call('/generos', 'POST', datos);

    /**
     * Actualiza parcialmente un género existente (PATCH).
     * Requiere token.
     *
     * @param {string} id    - ObjectId del género
     * @param {Object} datos - Campos a modificar (nombre, slug, descripcion)
     * @returns {Promise<Object>} { mensaje, resultado } — resultado.matchedCount indica si existía
     */
    const actualizarGenero = (id, datos) => call(`/generos/${id}`, 'PATCH', datos);

    /**
     * Elimina un género — OJO: es un soft delete (el back solo marca borrado: true,
     * no lo borra físicamente de la base). Por eso el back devuelve matchedCount,
     * no deletedCount como en libros (que sí hace hard delete).
     * Requiere token.
     *
     * @param {string} id - ObjectId del género
     * @returns {Promise<Object>} { mensaje, resultado } — resultado.matchedCount indica si existía
     */
    const eliminarGenero = (id) => call(`/generos/${id}`, 'DELETE');

    return { getGeneros, getGeneroPorId, crearGenero, actualizarGenero, eliminarGenero };
}
