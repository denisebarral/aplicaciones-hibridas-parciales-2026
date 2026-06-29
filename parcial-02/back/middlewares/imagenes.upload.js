/**
 * middlewares/imagenes.upload.js
 *
 * Middlewares para recibir y procesar imágenes de portada de libros:
 *
 *   1. upload        → multer: recibe el archivo del FormData y lo guarda temporalmente en uploads/
 *   2. resizeImage   → sharp: convierte el archivo a .webp, lo redimensiona a 500px y borra el original
 *
 * Ambos se encadenan en las rutas de libros antes del controller:
 *   [upload.single('imagen'), resizeImage, libroValidate, tokenValidate, controller]
 *
 * Si la petición no trae imagen (ej: PATCH sin nueva imagen), resizeImage pasa directo.
 */

import multer from 'multer';
import sharp from 'sharp';
import { unlink } from 'fs/promises';
import path from 'path';

// multer.diskStorage: configura dónde y con qué nombre guardar el archivo recibido
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Date.now() genera un timestamp en milisegundos — prácticamente único
        // Lo usamos como nombre para evitar colisiones entre archivos con el mismo nombre original
        const timestamp = Date.now();
        // extname() es un método de path que devuelve la extensión del archivo (ej: .jpg, .png)
        const ext = path.extname(file.originalname);
        // Finalmente, multer guarda el archivo en uploads/ con nombre timestamp + extensión original
        cb(null, `${timestamp}${ext}`);
    }
});

/**
 * upload — instancia de multer lista para usar como middleware.
 *
 * Se usa como upload.single("imagen") en las rutas: intercepta el campo "imagen"
 * del FormData, guarda el archivo en uploads/ y pone la info en req.file.
 
 */
export const upload = multer({ storage });

/**
 * Convierte la imagen temporal a .webp, la redimensiona y borra el archivo original.
 * Si la petición no trae imagen (req.file undefined), pasa al siguiente middleware sin hacer nada.
 *
 * @param {import('express').Request}       req - req.file viene de multer con el archivo temporal
 * @param {import('express').Response}      res
 * @param {import('express').NextFunction}  next
 */
export async function resizeImage(req, res, next) {
    try {
        // Sin archivo (PATCH sin imagen nueva) → saltamos el procesamiento
        if (!req.file) return next();

        // 1- obtengo la ruta del archivo temporal que multer guardó en uploads/
        const inputPath  = req.file.path;
        // 2- genero un nombre único para el archivo final en .webp
        const outputFilename = `${Date.now()}.webp`;
        // 3- ruta final del archivo procesado
        const outputPath = `uploads/${outputFilename}`;

        // sharp: lee el archivo original, lo convierte a .webp 
        // resize(500, null): ancho máximo 500px, alto se ajusta proporcionalmente (null = auto)
        // withoutEnlargement: true: si la imagen es más chica de 500px, no la agranda
        // webp({ quality: 85 }): calidad 85% — buen balance entre tamaño y calidad visual
        await sharp(inputPath)
            .resize(500, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

        // Borramos el archivo temporal original (ya tenemos el .webp procesado)
        await unlink(inputPath);

        // Actualizamos req.file para que el controller use el nombre .webp correcto
        req.file.filename = outputFilename;
        req.file.path     = outputPath;

        next();
    } catch (error) {
        console.error('Error al procesar imagen:', error);
        return res.status(500).json({ mensaje: 'Error al procesar la imagen' });
    }
}
