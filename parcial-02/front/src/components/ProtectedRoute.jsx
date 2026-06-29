/**
 * components/ProtectedRoute.jsx
 *
 * Guardia de ruta: bloquea el acceso a páginas que requieren autenticación.
 * Si el usuario no tiene sesión activa (no hay email en localStorage), redirige a /login.
 * Si hay sesión, renderiza el componente de la ruta protegida.
 *
 * Se usa en Router.jsx envolviendo las rutas del panel de admin:
 *   { path: 'admin', element: <ProtectedRoute element={<Admin />} /> }
 */

import { Navigate } from 'react-router-dom';

/**
 * @param {{ element: React.ReactNode }} props - El componente de la ruta a proteger
 */
export default function ProtectedRoute({ element }) {
    // Leemos directamente de localStorage (no del contexto) para ser más robustos:
    // si alguien borra el token del contexto pero no del localStorage (o viceversa),
    // este check es la última línea de defensa antes de mostrar la página protegida
    const email = localStorage.getItem('email');

    // Si no hay email, redirigimos al login — el componente nunca se renderiza
    // Navigate reemplaza la entrada actual en el historial (el usuario no puede volver atrás)
    return email ? element : <Navigate to="/login" replace />;
}
