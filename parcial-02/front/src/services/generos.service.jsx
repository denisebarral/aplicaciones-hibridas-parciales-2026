/**
 * services/generos.service.jsx
 *
 * Hook con funciones para interactuar con los endpoints de géneros.
 * Solo expone las operaciones de lectura (GET), que son públicas.
 * El CRUD de géneros solo se usa desde Postman/Swagger en este proyecto.
 */

import { useApi } from './api.service.jsx';

/**
 * Hook que expone las operaciones de lectura del recurso géneros.
 *
 * @returns {{ getGeneros, getGeneroPorId }}
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

    return { getGeneros, getGeneroPorId };
}
