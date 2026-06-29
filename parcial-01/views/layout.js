/**
 * views/layout.js
 *
 * Genera la estructura base (HTML completo) para todas las páginas del sitio.
 * Recibe del contoller los datos necesario del servicio (ej: géneros para el menú) y el fragmento HTML específico de cada página (ej: cards de libros).
 * Incluye el navbar con dropdown de géneros dinámicos, estilos personalizados y footer.
 */

/**
 * Construye el bloque HTML del dropdown de categorías a partir de los géneros de MongoDB.
 *
 * @param {Array}  generos     - Array de documentos de la colección generos. Los recibe del controller "home" para construir el menú dinámico.
 * @param {string} currentPath - Ruta activa para resaltar el ítem de navegación.
 * @returns {string} HTML del dropdown de categorías.
 */
function buildCategoriasDropdown(generos, currentPath) {
    // Generamos un <li> por cada género obtenido de la BD — no están hardcodeados
    const items = generos.map(g => `
        <li>
            <!-- Comparamos la ruta actual con la ruta del género para asignar la clase "active" al ítem correspondiente -->
            <a class="dropdown-item ${currentPath === '/catalogo/' + g.slug ? 'active' : ''}"
               href="/catalogo/${g.slug}">
                ${g.nombre}
            </a>
        </li>`).join('');

    // Retornamos el bloque completo del dropdown, con "Todas" como opción fija al inicio, luego un divider y el resto de géneros debajo.
    return `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle ${currentPath.startsWith('/catalogo') ? 'active' : ''}"
               href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Categorías
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
                <li>
                    <a class="dropdown-item ${currentPath === '/catalogo' ? 'active' : ''}"
                       href="/catalogo">Todas</a>
                </li>
                <li><hr class="dropdown-divider"></li>
                ${items}
            </ul>
        </li>`;
}

/**
 * Genera una página HTML completa con navbar dinámico, contenido y footer.
 *
 * @param {string} content     - Fragmento HTML del cuerpo de la página.
 * @param {Array}  generos     - Géneros para poblar el dropdown del navbar.
 * @param {string} currentPath - Ruta activa (para resaltar el ítem del menú).
 * @param {string} [title]     - Título de la página (aparece en la pestaña del navegador).
 * @returns {string} Página HTML completa como string.
 */
export function createPage(content, generos = [], currentPath = '/', title = 'Los 7 Locos') {
    const categoriasDropdown = buildCategoriasDropdown(generos, currentPath);

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Los 7 Locos</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark px-3 px-md-5">
        <a class="navbar-brand" href="/">
            Los 7 Locos
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
            <img src="/assets/iconos/generales/Hamburger-black.svg" alt="menú" width="24" style="filter:invert(1)">
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                <li class="nav-item">
                    <a class="nav-link ${currentPath === '/' ? 'active' : ''}" href="/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${currentPath === '/quienes-somos' ? 'active' : ''}" href="/quienes-somos">Quiénes Somos</a>
                </li>
                ${categoriasDropdown}
                <li class="nav-item">
                    <a class="nav-link ${currentPath === '/contacto' ? 'active' : ''}" href="/contacto">Contacto</a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Contenido principal -->
    ${content}

    <!-- Footer -->
    <footer class="py-5 mt-5">
        <div class="container">
            <div class="row gy-4">
                <div class="col-md-4">
                    <h5 class="serif mb-3" style="color:#fff;">Los 7 Locos</h5>
                    <p class="small mb-1">Literatura latinoamericana desde 2009.</p>
                    <p class="small mb-1">El rincón de Cortázar, Borges y Galeano.</p>
                    <p class="small mt-2" style="color:#888;">🐱 Macedonio dice hola.</p>
                </div>
                <div class="col-md-4">
                    <h6 class="serif mb-3" style="color:#fff;">Datos de contacto</h6>
                    <p class="small mb-1">
                        <img src="/assets/iconos/generales/Map_Marker-black.svg" width="16" style="filter:invert(75%) sepia(30%) saturate(500%) hue-rotate(5deg)" class="me-1">
                        Defensa 742, San Telmo, CABA
                    </p>
                    <p class="small mb-1">📞 +54 11 4300-7777</p>
                    <p class="small mb-1">📧 <a href="mailto:hola@los7locos.com.ar">hola@los7locos.com.ar</a></p>
                    <p class="small mb-0">🕐 Lun–Sáb 10:00–20:00 / Dom 12:00–18:00</p>
                </div>
                <div class="col-md-4">
                    <h6 class="serif mb-3" style="color:#fff;">Seguinos</h6>
                    <div class="d-flex gap-3">
                        <a href="#" class="social-icon" aria-label="Instagram">
                            <img src="/assets/iconos/redes/Instagram.svg" alt="Instagram">
                        </a>
                        <a href="#" class="social-icon" aria-label="Facebook">
                            <img src="/assets/iconos/redes/Facebook.svg" alt="Facebook">
                        </a>
                        <a href="#" class="social-icon" aria-label="WhatsApp">
                            <img src="/assets/iconos/redes/Whatsapp.svg" alt="WhatsApp">
                        </a>
                        <a href="#" class="social-icon" aria-label="YouTube">
                            <img src="/assets/iconos/redes/youtube.svg" alt="YouTube">
                        </a>
                    </div>
                    <p class="small mt-3" style="color:#888;">
                        <a href="/api-docs" style="color:#888;">API Docs →</a>
                    </p>
                </div>
            </div>
            <hr class="gold-divider mt-4">
            <p class="text-center small mb-0" style="color:#666;">
                &copy; 2024 Librería Los 7 Locos · Defensa 742, San Telmo · Hecho con amor por lectores apasionados
            </p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}
