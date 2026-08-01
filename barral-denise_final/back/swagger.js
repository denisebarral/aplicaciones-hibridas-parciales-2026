/**
 * swagger.js
 *
 * Script de generación de documentación Swagger (OpenAPI).
 * Se corre UNA VEZ (o cuando se modifican las rutas) para generar swagger.json:
 *
 *   pnpm swagger
 *
 * Luego el servidor sirve esa especificación en /api-docs via swagger-ui-express.
 */

import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title:       'API — Librería Los 7 Locos',
        description: 'API REST para gestionar libros, géneros y autenticación de empleados. ' +
                     'Las rutas GET son públicas. Las rutas de escritura requieren Bearer token JWT.'
    },
    // En local (sin SWAGGER_HOST seteado) usa localhost:3333/http, igual que siempre.
    // En Render, SWAGGER_HOST=los7locos.onrender.com hace que Swagger UI arme las
    // pruebas de "Try it out" contra el back real, no contra localhost del visitante.
    host:     process.env.SWAGGER_HOST || 'localhost:3333',
    basePath: '/api',
    schemes:  [process.env.SWAGGER_HOST ? 'https' : 'http'],
    securityDefinitions: {
        // Define el esquema de seguridad Bearer para que Swagger UI muestre el botón "Authorize"
        Bearer: {
            type: 'apiKey',
            in:   'header',
            name: 'Authorization',
            description: 'Ingresá: Bearer {token}'
        }
    },
    tags: [
        { name: 'Libros',   description: 'CRUD de libros — GET público, escritura requiere JWT' },
        { name: 'Generos',  description: 'CRUD de géneros — GET público, escritura requiere JWT' },
        { name: 'Usuarios', description: 'Registro y login de empleados' }
    ],
    definitions: {
        Libro: {
            titulo:           'Rayuela',
            autor:            'Julio Cortázar',
            genero:           'Novela',
            descripcion:      'Una novela que puede leerse en múltiples órdenes...',
            precio:           4200,
            anio_publicacion: 1963,
            editorial:        'Sudamericana',
            link:             'https://books.google.com/books?id=rayuela-cortazar',
            seccion:          'narrativa',
            imagen:           '1781835478711.webp'
        },
        Genero: {
            nombre:      'Narrativa',
            slug:        'narrativa',
            descripcion: 'Novelas que sacudieron la literatura del continente.'
        },
        LoginBody: {
            email:    'empleado@los7locos.com',
            password: 'MiPass123!'
        },
        RegisterBody: {
            email:           'empleado@los7locos.com',
            password:        'MiPass123!',
            passwordConfirm: 'MiPass123!'
        }

    }
};

const endpointsFiles = [
    './api/routes/libros.routes.js',
    './api/routes/generos.routes.js',
    './api/routes/usuarios.routes.js'
];

const swagger = swaggerAutogen();
swagger('swagger.json', endpointsFiles, doc);
