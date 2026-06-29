/**
 * views/home.views.js
 *
 * Vista de la página Home (/).
 * Genera el hero section y la grilla de libros destacados.
 */

import { createPage } from './layout.js';

/**
 * Formatea un precio numérico como moneda argentina y le agrega el símbolo $ al comienzo.
 *
 * @param {number} precio - Precio a formatear.
 * @returns {string} Precio formateado (ej: $4.200).
 */
function formatearPrecio(precio) {
    // Number es  un constructor global nativo de JavaScript que también puede ser usado como función para convertir un valor a número. En este caso, nos aseguramos de que el precio sea un número antes de formatearlo.
    // toLocaleString es un método de los objetos Number que formatea el número según las convenciones locales. Con 'es-AR' formatea el número según las convenciones argentinas (punto como separador de miles y coma como decimal). Agregamos el símbolo $ al principio.
    return '$' + Number(precio).toLocaleString('es-AR');
}

/**
 * Genera el HTML de una card de libro para la sección destacados.
 *
 * @param {Object} libro - Documento de la colección libros.
 * @returns {string} HTML de la card del libro.
 */
function buildLibroCard(libro) {
    return `
        <div class="col-6 col-md-4 col-lg-2 mb-4">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${libro.imagen || 'https://picsum.photos/seed/' + libro._id + '/400/600'}"
                     class="card-img-top"
                     alt="Portada de ${libro.titulo}"
                     onerror="this.src='https://picsum.photos/seed/${libro._id}/400/600'">
                <div class="card-body d-flex flex-column p-3">
                    <span class="badge-genero mb-2 align-self-start">${libro.genero || libro.seccion}</span>
                    <h6 class="card-title serif mb-1">${libro.titulo}</h6>
                    <p class="card-text small text-muted mb-1">${libro.autor}</p>
                    <p class="precio mt-auto mb-2">${formatearPrecio(libro.precio)}</p>
                    <div class="d-flex gap-2">
                        <a href="#" class="btn btn-primary btn-sm flex-fill">Comprar</a>
                        <a href="${libro.link || '#'}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm flex-fill">Ver más</a>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Genera la página Home completa con hero y libros destacados.
 * Recibe los libros y géneros provistos por el controller "home" para construir el contenido dinámico.
 * @param {Array} libros  - Libros a mostrar en la sección destacados (últimos 6).
 * @param {Array} generos - Géneros para el navbar dinámico.
 * @returns {string} Página HTML completa.
 */
export function createHomePage(libros, generos) {
    // Tomamos los últimos 6 libros para mostrar como destacados
    const destacados = libros.slice(-6).reverse();

    // El map() genera un array de strings con las cards, y join('') los concatena sin separador
    const libroCards = destacados.map(buildLibroCard).join('');

    const content = `
        <!-- Hero Section -->
        <section class="hero-section position-relative overflow-hidden"
                 style="background-color:#1a1008; min-height:90vh; display:flex; align-items:center;">
            <div class="container position-relative" style="z-index:2;">
                <div class="row align-items-center gy-5">
                    <div class="col-lg-6">
                        <p class="small text-uppercase letter-spacing mb-2" style="color:#c8a96e; letter-spacing:0.2em;">
                            San Telmo, Buenos Aires — Desde 2009
                        </p>
                        <h1 class="display-3 fw-bold mb-3" style="color:#f5f0e8; font-family:'Playfair Display',serif; line-height:1.1;">
                            Librería<br>
                            <span style="color:#8b2020;">Los 7 Locos</span>
                        </h1>
                        <p class="lead mb-4" style="color:#c8a96e; font-style:italic;">
                            "El hombre es como los libros que lee."
                        </p>
                        <p class="mb-5" style="color:#c8a96e; max-width:480px;">
                            Un espacio de culto para los amantes de Cortázar, Borges, Galeano,
                            García Márquez y la literatura latinoamericana que rompió las reglas.
                            Estanterías hasta el techo, olor a papel viejo y Macedonio durmiendo entre los ensayos.
                        </p>
                        <div class="d-flex gap-3 flex-wrap">
                            <a href="/catalogo" class="btn btn-primary btn-lg px-4">Ver catálogo</a>
                            <a href="/quienes-somos" class="btn btn-outline-light btn-lg px-4">Conocernos</a>
                        </div>
                    </div>
                    <div class="col-lg-6 d-flex align-items-center justify-content-center py-4">
                        <div style="position:relative; max-width:400px; width:100%;">
                            <!-- Marco decorativo desplazado -->
                            <div style="position:absolute; top:16px; left:16px; width:100%; height:100%; border:2px solid rgba(200,169,110,0.35); z-index:0;"></div>
                            <img src="/assets/referencia-estilo-del-sitio/hombre-sombrero-libro.jpg"
                                 alt="Librería Los 7 Locos"
                                 style="position:relative; z-index:1; width:100%; height:480px; object-fit:cover; object-position:center top; border:2px solid var(--gold); display:block;"
                                 onerror="this.src='/assets/referencia-estilo-del-sitio/hombre-lentes-libro.jpg'">
                            <!-- Chip decorativo -->
                            <div style="position:absolute; z-index:2; bottom:20px; left:-16px; background:var(--red); color:#f5f0e8; font-family:'Playfair Display',serif; font-size:0.8rem; padding:6px 16px; letter-spacing:0.05em;">
                                San Telmo · Desde 2009
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Decoración de fondo -->
            <div style="position:absolute;top:0;right:0;width:50%;height:100%;background:linear-gradient(to left, rgba(139,32,32,0.08), transparent);z-index:1;"></div>
        </section>

        <!-- Datos destacados -->
        <section style="background-color:#8b2020; padding:3rem 0;">
            <div class="container">
                <div class="row text-center gy-3">
                    <div class="col-6 col-md-3">
                        <h3 class="serif fw-bold mb-0" style="color:#f5f0e8;">15+</h3>
                        <p class="small mb-0" style="color:#c8a96e;">Años en San Telmo</p>
                    </div>
                    <div class="col-6 col-md-3">
                        <h3 class="serif fw-bold mb-0" style="color:#f5f0e8;">5.000+</h3>
                        <p class="small mb-0" style="color:#c8a96e;">Títulos disponibles</p>
                    </div>
                    <div class="col-6 col-md-3">
                        <h3 class="serif fw-bold mb-0" style="color:#f5f0e8;">1</h3>
                        <p class="small mb-0" style="color:#c8a96e;">Gato (Macedonio)</p>
                    </div>
                    <div class="col-6 col-md-3">
                        <h3 class="serif fw-bold mb-0" style="color:#f5f0e8;">∞</h3>
                        <p class="small mb-0" style="color:#c8a96e;">Lecturas posibles</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Libros destacados -->
        <section class="container my-5 py-3">
            <div class="d-flex justify-content-between align-items-end mb-4">
                <h2 class="section-title mb-0">Selección destacada</h2>
                <a href="/catalogo" class="btn btn-outline-primary btn-sm">Ver todos →</a>
            </div>
            ${destacados.length > 0
                ? `<div class="row">${libroCards}</div>`
                : `<div class="text-center py-5">
                       <img src="/assets/iconos/libros/libros-apilados-sombrero.svg" height="80" style="opacity:0.4" onerror="this.style.display='none'">
                       <p class="text-muted mt-3">Aún no hay libros cargados. <a href="/api-docs" class="text-decoration-none" style="color:var(--red)">Cargar desde la API →</a></p>
                   </div>`
            }
        </section>

        <!-- Horarios y ubicación -->
        <section style="background-color:#2a1a10; padding:4rem 0; color:#f5f0e8;">
            <div class="container">
                <div class="row gy-4 align-items-center">
                    <div class="col-md-6">
                        <h3 class="serif mb-3" style="color:#c8a96e;">Visitanos en San Telmo</h3>
                        <div class="d-flex align-items-start mb-3">
                            <img src="/assets/iconos/generales/Map_Marker-black.svg" width="20"
                                 style="filter:invert(75%) sepia(30%) saturate(500%) hue-rotate(5deg); margin-top:2px"
                                 class="me-2 flex-shrink-0" onerror="this.style.display='none'">
                            <div>
                                <p class="mb-0 fw-semibold">Defensa 742, San Telmo, CABA</p>
                                <p class="small mb-0" style="color:#c8a96e;">A dos cuadras de la Plaza Dorrego</p>
                            </div>
                        </div>
                        <p class="mb-1">🕐 Lunes a Sábado: 10:00 – 20:00</p>
                        <p class="mb-3">🕐 Domingos: 12:00 – 18:00</p>
                        <a href="/contacto" class="btn btn-outline-light btn-sm">Cómo llegar →</a>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="/assets/iconos/libros/libros-apilados-sombrero-ojo.svg"
                             alt="Libros decoración"
                             style="max-height:200px; opacity:0.6;"
                             onerror="this.style.display='none'">
                    </div>
                </div>
            </div>
        </section>`;
    // Le enviamos a la función createPage del layout el contenido específico de Home, junto con los géneros para el menú, la ruta actual (para resaltar el ítem activo) y el título de la página.  
    return createPage(content, generos, '/', 'Home');
}


/**
 * Sobre map() y join() en la generación de las cards de libros:
 * - map()  es un método de Array que puede recibir una función como argumento y la aplica a cada elemento del array, devolviendo un nuevo array con los resultados. En este caso, usamos map() para transformar cada objeto libro del array destacados en un string HTML de su card correspondiente, llamando a buildLibroCard(libro) para cada uno.
 * - join() es un método de Array que concatena todos los elementos del array en un solo string, separados por el carácter especificado. En este caso, usamos join('') para unir todas las cards sin ningún separador entre ellas, ya que el HTML de cada card ya incluye su propio espacio y estructura.
 *   Si no usáramos join('') y solo hiciéramos ${destacados.map(buildLibroCard)}, el resultado sería un array de strings (HTML de cada card) en lugar de un string único con todas las cards concatenadas, lo que no se renderizaría correctamente en el HTML final.
 */