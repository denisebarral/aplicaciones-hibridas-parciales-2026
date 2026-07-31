/**
 * middlewares/libros.validate.js
 *
 * Middleware de validación para POST y PUT de libros.
 * Valida el body contra el schema Yup de libros antes de que llegue al controller.
 *
 * Se aplica en:
 *   POST /api/libros       → todos los campos son requeridos
 *   PUT  /api/libros/:id   → se envía el libro completo, todos los campos requeridos
 *
 * NO se aplica en:
 *   PATCH /api/libros/:id  → actualización parcial, cualquier subconjunto de campos es válido
 */

import { libroSchema } from '../schemas/libros.js';

/**
 * Valida el body del libro contra libroSchema.
 * stripUnknown: true descarta silenciosamente los campos que no están en el schema.
 *
 * @param {import('express').Request}       req
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export async function libroValidate(req, res, next) {
    try {
        // validate() devuelve una promesa que se resuelve si los datos son válidos o se rechaza con un error si no lo son. req.body contiene los campos del libro enviados en la petición (title, author, price, etc.). Se valida contra el schema definido en schemas/libros.js.
        await libroSchema.validate(req.body,{
              // abortEarly: false → NO para en el primer error; recorre TODOS los campos y acumula todos los mensajes antes de rechazar. Sin esta opción (abortEarly: true por defecto) solo se vería el primer error. 
              abortEarly: false, 
              // stripUnknown: true → elimina del objeto cualquier campo que no esté en el schema. Si el cliente manda { titulo: "x", campoRaro: true }, "campoRaro" se descarta antes de pasar al controller. Protege contra inyección de campos no esperados.
              stripUnknown: true 
            });
        next(); // válido → sigue al controller
    } catch (error) {
        return res.status(400).json({ mensaje: 'Datos inválidos', errores: error.errors });
    }
}
