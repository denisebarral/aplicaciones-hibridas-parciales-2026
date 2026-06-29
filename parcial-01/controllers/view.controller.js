/**
 * controllers/view.controller.js
 *
 * Controladores para las páginas HTML del sitio.
 * Obtienen datos de MongoDB via services, construyen el HTML via views y lo envían al navegador.
 */

import * as librosService from '../services/libros.service.js';
import * as generosService from '../services/generos.service.js';
import { createHomePage } from '../views/home.views.js';
import { createCatalogoPage } from '../views/catalogo.views.js';
import { createQuienesSomosPage } from '../views/quienes-somos.views.js';
import { createContactoPage } from '../views/contacto.views.js';

/**
 * Renderiza la página Home (/).
 * Obtiene géneros (para el navbar) y los últimos libros (para la sección destacados) de los servicios.
 * Envía a la vista "home" el HTML completo generado con esos datos para mostrar la página.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function home(req, res) {
    try {
        // Obtenemos géneros y libros en paralelo para no esperar dos llamadas secuenciales
        const [generos, libros] = await Promise.all([
            generosService.obtenerTodos(),
            librosService.obtenerTodos()
        ]);
        // Enviamos a la vista "home" el HTML completo generado con los libros y géneros obtenidos
        res.send(createHomePage(libros, generos));
    } catch (error) {
        console.error('Error al renderizar home:', error);
        res.status(500).send('<p>Error interno del servidor.</p>');
    }
}

/**
 * Renderiza la página Catálogo (/catalogo o /catalogo/:seccion).
 * Sin parámetro: muestra todos los libros.
 * Con :seccion: filtra por ese slug.
 *
 * @param {import('express').Request}  req - req.params.seccion: slug opcional.
 * @param {import('express').Response} res
 */
export async function catalogo(req, res) {
    try {
        // Extraemos el slug de sección de la URL (puede ser undefined si no se pasó)
        const seccion = req.params.seccion || null;

        // Construimos el filtro solo si hay sección activa, sino dejamos un objeto vacío para obtener todos los libros
        const filtro = seccion ? { seccion } : {};

        // Obtenemos géneros y libros (filtrados) en paralelo
        // El método obtenerTodos de librosService acepta un filtro para traer solo los libros de esa sección si se indicó, o todos si el filtro está vacío.
        const [generos, libros] = await Promise.all([
            generosService.obtenerTodos(),
            librosService.obtenerTodos(filtro)
        ]);

        res.send(createCatalogoPage(libros, generos, seccion));
    } catch (error) {
        console.error('Error al renderizar catálogo:', error);
        res.status(500).send('<p>Error interno del servidor.</p>');
    }
}

/**
 * Renderiza la página Quiénes Somos (/quienes-somos).
 * Solo necesita los géneros para el navbar.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function quienesSomos(req, res) {
    try {
        const generos = await generosService.obtenerTodos();
        res.send(createQuienesSomosPage(generos));
    } catch (error) {
        console.error('Error al renderizar quiénes somos:', error);
        res.status(500).send('<p>Error interno del servidor.</p>');
    }
}

/**
 * Renderiza la página Contacto (/contacto).
 * Solo necesita los géneros para el navbar.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function contacto(req, res) {
    try {
        const generos = await generosService.obtenerTodos();
        res.send(createContactoPage(generos));
    } catch (error) {
        console.error('Error al renderizar contacto:', error);
        res.status(500).send('<p>Error interno del servidor.</p>');
    }
}
