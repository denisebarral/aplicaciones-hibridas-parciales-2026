/**
 * main.jsx
 *
 * Punto de entrada de la aplicación React.
 * Envuelve todo en SessionProvider (contexto global de autenticación)
 * y RouterProvider (configuración de rutas).
 *
 * Orden obligatorio:
 *   SessionProvider envuelve al RouterProvider porque los hooks del contexto
 *   (useToken, useEmail, etc.) se usan dentro de las rutas.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from './contexts/Session.context.jsx';
import router from './routes/Router.jsx';

// Bootstrap CSS: clases utilitarias (grid, botones, navbar, forms, etc.)
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap JS: necesario para dropdowns del navbar
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Estilos propios: sobreescribe Bootstrap con la paleta de Los 7 Locos
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* SessionProvider: hace disponible el contexto de sesión en todo el árbol */}
        <SessionProvider>
            {/* RouterProvider: renderiza la ruta activa según la URL */}
            <RouterProvider router={router} />
        </SessionProvider>
    </StrictMode>
);
