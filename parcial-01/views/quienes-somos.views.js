/**
 * views/quienes-somos.views.js
 *
 * Vista de la página Quiénes Somos (/quienes-somos).
 * Historia de la librería, datos de contacto e información institucional.
 */

import { createPage } from './layout.js';

/**
 * Genera la página Quiénes Somos completa.
 *
 * @param {Array} generos - Géneros para el navbar dinámico.
 * @returns {string} Página HTML completa.
 */
export function createQuienesSomosPage(generos) {
    const content = `
        <!-- Cabecera -->
        <div style="background-color:#2a1a10; padding:4rem 0 3rem;">
            <div class="container">
                <p class="small text-uppercase mb-1" style="color:#c8a96e; letter-spacing:0.15em;">Historia</p>
                <h1 class="serif mb-3" style="color:#f5f0e8;">Quiénes somos</h1>
                <p class="lead mb-0" style="color:#c8a96e; max-width:600px; font-style:italic;">
                    "Hay que saber perderse para encontrar los libros que uno necesita."
                </p>
            </div>
        </div>

        <div class="container my-5">
            <div class="row gy-5 align-items-start">

                <!-- Historia -->
                <div class="col-lg-7">
                    <h2 class="section-title mb-4">Nuestra historia</h2>

                    <p class="mb-4">
                        <strong>Los 7 Locos</strong> nació en 2009 en el corazón de San Telmo, fundada por un grupo de
                        lectores apasionados que creían que la literatura latinoamericana del siglo XX merecía un espacio
                        propio. El nombre es un homenaje a Roberto Arlt y a esa generación de escritores que rompieron
                        las reglas, que escribieron desde los márgenes y cambiaron la literatura para siempre.
                    </p>

                    <p class="mb-4">
                        Somos una librería independiente especializada en literatura latinoamericana: narrativa, cuentos,
                        ensayo, poesía y crónica. En nuestras estanterías de madera hasta el techo conviven Cortázar,
                        Borges, García Márquez, Galeano, Sábato, Rulfo, Castellanos, Pizarnik y cientos de autores
                        más que sacudieron el continente.
                    </p>

                    <p class="mb-4">
                        Tenemos una escalera rodante (sí, como en las viejas librerías), olor a papel viejo que no
                        queremos que se vaya nunca, y un gato naranja llamado <strong>Macedonio</strong> —en honor a
                        Macedonio Fernández— que duerme entre los libros de ensayo y supervisa cada compra con cierta
                        indiferencia aristocrática.
                    </p>

                    <p>
                        Más que una librería, somos un punto de encuentro. Organizamos presentaciones, lecturas en voz
                        alta, clubes de lectura y ciclos de conversación. Si llegaste hasta acá, ya sos uno de los nuestros.
                    </p>

                    <hr class="gold-divider my-4">

                    <div class="row gy-3 text-center">
                        <div class="col-4">
                            <h3 class="serif fw-bold" style="color:#8b2020;">15+</h3>
                            <p class="small text-muted mb-0">Años en San Telmo</p>
                        </div>
                        <div class="col-4">
                            <h3 class="serif fw-bold" style="color:#8b2020;">5.000+</h3>
                            <p class="small text-muted mb-0">Títulos</p>
                        </div>
                        <div class="col-4">
                            <h3 class="serif fw-bold" style="color:#8b2020;">1</h3>
                            <p class="small text-muted mb-0">Gato (Macedonio)</p>
                        </div>
                    </div>
                </div>

                <!-- Datos de contacto -->
                <div class="col-lg-5">
                    <div class="card border-0 shadow-sm p-4" style="background-color:#fff; border-left:4px solid #8b2020 !important; border-radius:8px;">
                        <h4 class="serif mb-4" style="color:#1a1008;">Cómo encontrarnos</h4>

                        <div class="d-flex align-items-start mb-3">
                            <img src="/assets/iconos/generales/Map_Marker-black.svg" width="20"
                                 style="margin-top:2px; opacity:0.7"
                                 class="me-3 flex-shrink-0"
                                 onerror="this.style.display='none'">
                            <div>
                                <p class="fw-semibold mb-0">Defensa 742</p>
                                <p class="small text-muted mb-0">San Telmo, Ciudad de Buenos Aires</p>
                            </div>
                        </div>

                        <div class="d-flex align-items-center mb-3">
                            <span class="me-3 flex-shrink-0" style="font-size:1.2rem;">📞</span>
                            <a href="tel:+541143007777" class="text-decoration-none" style="color:#1a1008;">
                                +54 11 4300-7777
                            </a>
                        </div>

                        <div class="d-flex align-items-center mb-4">
                            <span class="me-3 flex-shrink-0" style="font-size:1.2rem;">📧</span>
                            <a href="mailto:hola@los7locos.com.ar" class="text-decoration-none" style="color:#8b2020;">
                                hola@los7locos.com.ar
                            </a>
                        </div>

                        <hr style="border-color:#e0d8c8;">

                        <h6 class="serif mb-3">Horarios de atención</h6>
                        <div class="d-flex justify-content-between mb-1">
                            <span class="small">Lunes a Sábado</span>
                            <span class="small fw-semibold">10:00 – 20:00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-4">
                            <span class="small">Domingos</span>
                            <span class="small fw-semibold">12:00 – 18:00</span>
                        </div>

                        <a href="/contacto" class="btn btn-primary w-100">Contactarnos</a>
                    </div>

                    <!-- Decoración -->
                    <div class="text-center mt-4">
                        <img src="/assets/iconos/libros/libros-apilados-sombrero-marron.svg"
                             alt="Libros decoración"
                             style="max-height:160px; opacity:0.7;"
                             onerror="this.style.display='none'">
                        <p class="small text-muted mt-2">🐱 Macedonio aprueba esta librería</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- Nuestros géneros -->
        <section style="background-color:#2a1a10; padding:4rem 0;">
            <div class="container text-center">
                <h2 class="serif mb-2" style="color:#f5f0e8;">Lo que encontrás en nuestra librería</h2>
                <p class="mb-4" style="color:#c8a96e;">Cinco secciones que cuentan el alma del continente</p>
                <div class="d-flex flex-wrap justify-content-center gap-3">
                    <a href="/catalogo/narrativa" class="btn btn-outline-light px-4">Narrativa</a>
                    <a href="/catalogo/cuentos" class="btn btn-outline-light px-4">Cuentos</a>
                    <a href="/catalogo/ensayo" class="btn btn-outline-light px-4">Ensayo</a>
                    <a href="/catalogo/poesia" class="btn btn-outline-light px-4">Poesía</a>
                    <a href="/catalogo/cronica" class="btn btn-outline-light px-4">Crónica</a>
                </div>
            </div>
        </section>`;

    return createPage(content, generos, '/quienes-somos', 'Quiénes Somos');
}
