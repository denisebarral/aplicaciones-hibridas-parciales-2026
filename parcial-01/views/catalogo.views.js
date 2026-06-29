/**
 * views/catalogo.views.js
 *
 * Vista de la página Catálogo (/catalogo y /catalogo/:seccion).
 * Muestra cards de libros con todos los datos requeridos.
 */

import { createPage } from './layout.js';

/**
 * Formatea un precio numérico como moneda argentina.
 *
 * @param {number} precio - Precio a formatear.
 * @returns {string} Precio formateado (ej: $4.200).
 */
function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
}

/**
 * Genera la card HTML de un libro con todos los campos requeridos.
 *
 * @param {Object} libro - Documento de la colección libros.
 * @returns {string} HTML de la card del libro.
 */
function buildLibroCard(libro) {
    const generoLabel = libro.genero || libro.seccion || 'Literatura';
    const precio = formatearPrecio(libro.precio);
    const anio = libro.anio_publicacion || '';
    const editorial = libro.editorial || '';
    const descripcion = libro.descripcion
        ? libro.descripcion.length > 120
            ? libro.descripcion.substring(0, 120) + '…'
            : libro.descripcion
        : '';

    return `
        <div class="col-sm-6 col-md-4 col-xl-3 mb-4">
            <div class="card h-100">
                <div class="position-relative">
                    <img src="${libro.imagen || 'https://picsum.photos/seed/' + libro._id + '/400/600'}"
                         class="card-img-top"
                         alt="Portada de ${libro.titulo}"
                         onerror="this.src='https://picsum.photos/seed/libro/400/600'">
                    <span class="badge-genero position-absolute top-0 end-0 m-2">${generoLabel}</span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title serif mb-1" style="font-size:1rem;">${libro.titulo}</h5>
                    <p class="small fw-semibold mb-1" style="color:#8b2020;">${libro.autor}</p>
                    <p class="small text-muted mb-1">${anio}${editorial ? ' · ' + editorial : ''}</p>
                    <p class="card-text small text-muted mb-3 flex-grow-1">${descripcion}</p>
                    <div class="mt-auto">
                        <p class="precio mb-2">${precio}</p>
                        <div class="d-flex gap-2">
                            <a href="#" class="btn btn-primary btn-sm flex-fill">Comprar</a>
                            <a href="${libro.link || '#'}"
                               target="_blank" rel="noopener"
                               class="btn btn-outline-primary btn-sm flex-fill">Ver más</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Genera la página Catálogo con filtro opcional por sección.
 *
 * @param {Array}        libros   - Libros a mostrar (ya filtrados por el controller).
 * @param {Array}        generos  - Géneros para el navbar dinámico.
 * @param {string|null}  seccion  - Slug de la sección activa (null = todas).
 * @returns {string} Página HTML completa.
 */
export function createCatalogoPage(libros, generos, seccion = null) {
    // Buscamos el nombre legible del género activo para el título de sección
    const generoActivo = seccion
        ? generos.find(g => g.slug === seccion)
        : null;
    const tituloSeccion = generoActivo ? generoActivo.nombre : 'Catálogo completo';
    const subtituloSeccion = generoActivo
        ? generoActivo.descripcion || ''
        : 'Toda la literatura latinoamericana que necesitás.';

    // Generamos los chips de filtro rápido por género
    const filtros = `
        <div class="d-flex flex-wrap gap-2 mb-4">
            <a href="/catalogo"
               class="btn btn-sm ${!seccion ? 'btn-primary' : 'btn-outline-primary'}">
                Todas
            </a>
            ${generos.map(g => `
                <a href="/catalogo/${g.slug}"
                   class="btn btn-sm ${seccion === g.slug ? 'btn-primary' : 'btn-outline-primary'}">
                    ${g.nombre}
                </a>`).join('')}
        </div>`;

    const libroCards = libros.length > 0
        ? `<div class="row">${libros.map(buildLibroCard).join('')}</div>`
        : `<div class="text-center py-5">
               <img src="/assets/iconos/libros/libros-apilados-sombrero.svg" height="80"
                    style="opacity:0.3" onerror="this.style.display='none'">
               <p class="text-muted mt-3">No hay libros en esta sección todavía.</p>
               <a href="/catalogo" class="btn btn-outline-primary btn-sm mt-2">Ver todos los libros</a>
           </div>`;

    const content = `
        <!-- Cabecera de sección -->
        <div style="background-color:#2a1a10; padding:3rem 0 2.5rem;">
            <div class="container">
                <p class="small text-uppercase mb-1" style="color:#c8a96e; letter-spacing:0.15em;">
                    ${seccion ? 'Categoría' : 'Colección'}
                </p>
                <h1 class="serif mb-2" style="color:#f5f0e8;">${tituloSeccion}</h1>
                ${subtituloSeccion
                    ? `<p style="color:#c8a96e; max-width:600px;">${subtituloSeccion}</p>`
                    : ''}
                <p class="small mb-0" style="color:#888;">${libros.length} título${libros.length !== 1 ? 's' : ''} encontrado${libros.length !== 1 ? 's' : ''}</p>
            </div>
        </div>

        <!-- Filtros y libros -->
        <div class="container my-5">
            ${filtros}
            ${libroCards}
        </div>`;

    const currentPath = seccion ? `/catalogo/${seccion}` : '/catalogo';
    return createPage(content, generos, currentPath, tituloSeccion);
}
