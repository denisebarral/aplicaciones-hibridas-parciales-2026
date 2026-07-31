/**
 * schemas/libros.js
 *
 * Esquema de validación Yup para el recurso "libros".
 * Se usa en el middleware libros.validate.js para validar el body
 * de las peticiones POST y PUT antes de que lleguen al controller.
 *
 * Para PATCH no se aplica este schema porque actualización parcial
 * puede venir con cualquier subconjunto de campos.
 */

import * as yup from 'yup';

export const libroSchema = yup.object({
    titulo:           yup.string().required('El título es requerido'),
    autor:            yup.string().required('El autor es requerido'),
    genero:           yup.string().required('El género es requerido'),
    descripcion:      yup.string().required('La descripción es requerida'),

    // typeError: mensaje cuando el valor no puede convertirse a número (ej: "abc")
    // FormData envía todo como string — Yup lo convierte a número automáticamente
    precio:           yup.number()
        .typeError('El precio debe ser un número')
        .positive('El precio debe ser mayor a 0')
        .required('El precio es requerido'),

    anio_publicacion: yup.number()
        .typeError('El año debe ser un número')
        .integer('El año debe ser un número entero')
        .min(1000, 'El año parece inválido')
        // Aquí usamos new Date().getFullYear() para obtener el año actual dinámicamente: si el año es mayor al actual, se rechaza.
        .max(new Date().getFullYear(), `El año no puede ser mayor a ${new Date().getFullYear()}`)
        .required('El año de publicación es requerido'),

    editorial:        yup.string().required('La editorial es requerida'),

    // url() valida que sea una URL bien formada — no es requerido (el libro puede no tener link)
    link:             yup.string()
        .url('El link debe ser una URL válida')
        .required('El link es requerido'),

    seccion:          yup.string().required('La sección es requerida')
});
