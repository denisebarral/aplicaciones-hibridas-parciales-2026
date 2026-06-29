/**
 * views/contacto.views.js
 *
 * Vista de la página Contacto (/contacto).
 * Formulario de contacto (maqueta visual) y datos de la librería.
 */

import { createPage } from './layout.js';

/**
 * Genera la página Contacto completa.
 *
 * @param {Array} generos - Géneros para el navbar dinámico.
 * @returns {string} Página HTML completa.
 */
export function createContactoPage(generos) {
    const content = `
        <!-- Cabecera -->
        <div style="background-color:#2a1a10; padding:4rem 0 3rem;">
            <div class="container">
                <p class="small text-uppercase mb-1" style="color:#c8a96e; letter-spacing:0.15em;">Escribinos</p>
                <h1 class="serif mb-2" style="color:#f5f0e8;">Contacto</h1>
                <p class="lead mb-0" style="color:#c8a96e; max-width:500px;">
                    ¿Buscás un libro? ¿Querés organizar un evento? ¿Solo querías saludar a Macedonio? Estamos acá.
                </p>
            </div>
        </div>

        <div class="container my-5">
            <div class="row gy-5">

                <!-- Formulario -->
                <div class="col-lg-7">
                    <h2 class="section-title mb-4">Envianos un mensaje</h2>
                    <form>
                        <div class="mb-3">
                            <label for="nombre" class="form-label fw-semibold">Nombre completo</label>
                            <input type="text" class="form-control" id="nombre"
                                   placeholder="Tu nombre" style="border-color:#c8a96e;">
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold">Email</label>
                            <input type="email" class="form-control" id="email"
                                   placeholder="tu@email.com" style="border-color:#c8a96e;">
                        </div>
                        <div class="mb-3">
                            <label for="asunto" class="form-label fw-semibold">Asunto</label>
                            <select class="form-select" id="asunto" style="border-color:#c8a96e;">
                                <option value="" selected disabled>Seleccioná un asunto</option>
                                <option>Consulta sobre un libro</option>
                                <option>Pedido especial</option>
                                <option>Organizar un evento</option>
                                <option>Sugerencia</option>
                                <option>Otro</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="mensaje" class="form-label fw-semibold">Mensaje</label>
                            <textarea class="form-control" id="mensaje" rows="5"
                                      placeholder="Escribí tu consulta acá…"
                                      style="border-color:#c8a96e;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary px-5">
                            Enviar mensaje
                        </button>
                        <p class="small text-muted mt-2">
                            Este formulario es una maqueta. Te respondemos dentro de las 24hs hábiles.
                        </p>
                    </form>
                </div>

                <!-- Datos de contacto -->
                <div class="col-lg-5">
                    <h2 class="section-title mb-4">Encontranos</h2>

                    <div class="card border-0 p-4 mb-4" style="background-color:#2a1a10; color:#f5f0e8; border-radius:8px;">

                        <div class="d-flex align-items-start mb-3">
                            <img src="/assets/iconos/generales/Map_Marker-black.svg" width="18"
                                 style="filter:invert(75%) sepia(30%) saturate(500%) hue-rotate(5deg); margin-top:3px"
                                 class="me-3 flex-shrink-0"
                                 onerror="this.style.display='none'">
                            <div>
                                <p class="mb-0 fw-semibold">Defensa 742</p>
                                <p class="small mb-0" style="color:#c8a96e;">San Telmo, CABA — A dos cuadras de Plaza Dorrego</p>
                            </div>
                        </div>

                        <div class="d-flex align-items-center mb-3">
                            <span class="me-3 flex-shrink-0">📞</span>
                            <a href="tel:+541143007777" style="color:#c8a96e; text-decoration:none;">
                                +54 11 4300-7777
                            </a>
                        </div>

                        <div class="d-flex align-items-center mb-4">
                            <span class="me-3 flex-shrink-0">📧</span>
                            <a href="mailto:hola@los7locos.com.ar" style="color:#c8a96e; text-decoration:none;">
                                hola@los7locos.com.ar
                            </a>
                        </div>

                        <hr style="border-color:#3a2a1a;">

                        <h6 class="serif mb-3" style="color:#c8a96e;">Horarios</h6>
                        <div class="d-flex justify-content-between mb-1">
                            <span class="small">Lunes a Sábado</span>
                            <span class="small fw-semibold">10:00 – 20:00</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="small">Domingos</span>
                            <span class="small fw-semibold">12:00 – 18:00</span>
                        </div>
                    </div>

                    <!-- Mapa embebido (Google Maps) -->
                    <div class="ratio ratio-4x3 rounded overflow-hidden shadow-sm">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9843454684487!2d-58.37163592409474!3d-34.622177572929215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaaa3b21cf01%3A0x8cd60b1ba0b80267!2sDefensa%20742%2C%20San%20Telmo%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1700000000000"
                            style="border:0;" allowfullscreen="" loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            title="Ubicación Librería Los 7 Locos">
                        </iframe>
                    </div>

                    <!-- Redes sociales -->
                    <div class="mt-4">
                        <h6 class="serif mb-3">Seguinos</h6>
                        <div class="d-flex gap-3">
                            <a href="#" class="social-icon" aria-label="Instagram">
                                <img src="/assets/iconos/redes/Instagram.svg" width="28" alt="Instagram" style="opacity:0.8;">
                            </a>
                            <a href="#" class="social-icon" aria-label="Facebook">
                                <img src="/assets/iconos/redes/Facebook.svg" width="28" alt="Facebook" style="opacity:0.8;">
                            </a>
                            <a href="#" class="social-icon" aria-label="WhatsApp">
                                <img src="/assets/iconos/redes/Whatsapp.svg" width="28" alt="WhatsApp" style="opacity:0.8;">
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    return createPage(content, generos, '/contacto', 'Contacto');
}
