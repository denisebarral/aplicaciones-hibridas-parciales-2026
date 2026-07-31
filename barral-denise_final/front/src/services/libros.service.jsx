/**
 * services/libros.service.jsx
 *
 * Hook con funciones para interactuar con los endpoints de libros.
 * Usa useApi() como base para el fetch con token y manejo de 401.
 *
 * buildFormData() convierte los datos del formulario (React Hook Form)
 * en un objeto FormData que multer puede leer en el back.
 */

import { useApi } from './api.service.jsx';

/**
 * Convierte los datos de React Hook Form en un FormData.
 * Necesario porque el back usa multer para recibir la imagen y FormData para el resto de campos.
 *
 * @param {Object} datos - Objeto con los valores del formulario (de handleSubmit de RHF)
 * @returns {FormData}
 */
function buildFormData(datos) {
    const fd = new FormData();

    Object.entries(datos).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'imagen') {
            // RHF devuelve el campo file como FileList (una lista de archivos)
            // Si el usuario eligió un archivo, lo adjuntamos; si no, lo saltamos
            // (back PATCH lo maneja: sin imagen = conserva la anterior)
            if (value instanceof FileList && value[0]) {
                fd.append('imagen', value[0]);
            }
        } else {
            fd.append(key, value);
        }
    });

    return fd;
}

/**
 * Hook que expone todas las operaciones del recurso libros.
 *
 * @returns {{ getLibros, getLibroPorId, crearLibro, actualizarLibro, eliminarLibro }}
 */
export function useLibrosService() {
    const { call } = useApi();

    /**
     * Obtiene todos los libros. Acepta filtros opcionales.
     * Ruta pública — funciona sin token.
     *
     * @param {Object} filtros - { seccion, precio_min, precio_max } (todos opcionales)
     * @returns {Promise<Array>}
     */
    const getLibros = (filtros = {}) => {
        // URLSearchParams convierte { seccion: 'narrativa' } en 'seccion=narrativa'
        const params = new URLSearchParams(filtros).toString();
        return call(`/libros${params ? `?${params}` : ''}`);
    };

    /**
     * Obtiene un libro por su ObjectId.
     * Ruta pública — funciona sin token.
     *
     * @param {string} id - ObjectId del libro como string
     * @returns {Promise<Object>}
     */
    const getLibroPorId = (id) => call(`/libros/${id}`);

    /**
     * Crea un nuevo libro con imagen de portada.
     * Requiere token — solo empleados autenticados.
     *
     * @param {Object} datos - Datos del formulario (React Hook Form)
     * @returns {Promise<Object>}
     */
    const crearLibro = (datos) => call('/libros', 'POST', buildFormData(datos));

    /**
     * Actualiza parcialmente un libro existente (PATCH).
     * La imagen es opcional: si no se selecciona archivo, el back conserva la anterior.
     * Requiere token.
     *
     * @param {string} id    - ObjectId del libro
     * @param {Object} datos - Datos del formulario (React Hook Form)
     * @returns {Promise<Object>}
     */
    const actualizarLibro = (id, datos) => call(`/libros/${id}`, 'PATCH', buildFormData(datos));

    /**
     * Elimina un libro permanentemente (hard delete).
     * El back también borra la imagen del disco.
     * Requiere token.
     *
     * @param {string} id - ObjectId del libro
     * @returns {Promise<Object>}
     */
    const eliminarLibro = (id) => call(`/libros/${id}`, 'DELETE');

    return { getLibros, getLibroPorId, crearLibro, actualizarLibro, eliminarLibro };
}
