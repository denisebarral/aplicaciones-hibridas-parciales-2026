/**
 * swagger.js
 *
 * Script de generación de documentación Swagger (OpenAPI).
 * Se corre UNA VEZ (o cuando se modifican las rutas) para generar swagger.json:
 *
 *   npm run swagger
 *
 * Luego el servidor sirve esa especificación en /api-docs via swagger-ui-express.
 */

import swaggerAutogen from 'swagger-autogen';

// Metadata general de la API visible en Swagger UI
const doc = {
    info: {
        title: 'API — Librería Los 7 Locos',
        description: 'API REST para gestionar libros y géneros de la librería Los 7 Locos. ' +
                     'Permite operaciones CRUD completas sobre ambas colecciones de MongoDB.'
    },
    host: 'localhost:3333',
    basePath: '/api',
    schemes: ['http'],
    tags: [
        { name: 'Libros', description: 'CRUD de libros — colección "libros" de MongoDB. GET acepta ?seccion=, ?precio_min= y ?precio_max=' },
        { name: 'Generos', description: 'CRUD de géneros — colección "generos" de MongoDB' }
    ],
    definitions: {
        Libro: {
            titulo: 'Rayuela',
            autor: 'Julio Cortázar',
            genero: 'novela',
            descripcion: 'Una novela que puede leerse en múltiples órdenes...',
            precio: 4200,
            anio_publicacion: 1963,
            editorial: 'Sudamericana',
            imagen: 'https://picsum.photos/seed/rayuela/400/600',
            link: 'https://books.google.com/books?id=rayuela-cortazar',
            seccion: 'narrativa'
        },
        Genero: {
            nombre: 'Narrativa',
            slug: 'narrativa',
            descripcion: 'Novelas que sacudieron la literatura del continente.'
        }
    }
};

// Archivos de rutas que swagger-autogen escanea para detectar los endpoints
const endpointsFiles = [
    './api/routes/libros.routes.js',
    './api/routes/generos.routes.js'
];

// Genera swagger.json leyendo los endpointsFiles con la metadata del doc
const swagger = swaggerAutogen();
swagger('swagger.json', endpointsFiles, doc);
