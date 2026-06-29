/**
 * routes/Router.jsx
 *
 * Configuración de todas las rutas de la aplicación con React Router v7.
 * Usa createBrowserRouter para definir rutas y anidadas bajo un Layout común.
 *
 * Estructura de rutas:
 *   Públicas (sin auth):
 *     /                          → Home
 *     /catalogo                  → Catálogo completo
 *     /catalogo/:seccion         → Catálogo filtrado por sección
 *     /libro/:id                 → Detalle de un libro
 *     /login                     → Login de empleados
 *     /register                  → Registro de empleados
 *     /logout                    → Cierre de sesión
 *
 *   Protegidas (requieren sesión activa):
 *     /admin                     → Panel de empleados (tabla de libros)
 *     /admin/libros/nuevo        → Crear libro
 *     /admin/libros/:id/editar   → Editar libro
 *     /admin/libros/:id/eliminar → Eliminar libro
 */

import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import Home         from '../pages/Home.jsx';
import Catalogo     from '../pages/Catalogo.jsx';
import LibroDetalle from '../pages/LibroDetalle.jsx';

import Login    from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Logout   from '../pages/auth/Logout.jsx';

import Admin         from '../pages/admin/Admin.jsx';
import NuevoLibro    from '../pages/admin/NuevoLibro.jsx';
import EditarLibro   from '../pages/admin/EditarLibro.jsx';
import EliminarLibro from '../pages/admin/EliminarLibro.jsx';

const router = createBrowserRouter([
    {
        // Layout es el wrapper de todas las rutas — contiene NavBar y Footer
        path: '/',
        element: <Layout />,
        children: [
            // Rutas públicas
            { index: true,              element: <Home /> },
            { path: 'catalogo',         element: <Catalogo /> },
            { path: 'catalogo/:seccion', element: <Catalogo /> },
            { path: 'libro/:id',        element: <LibroDetalle /> },
            { path: 'login',            element: <Login /> },
            { path: 'register',         element: <Register /> },
            { path: 'logout',           element: <Logout /> },

            // Rutas protegidas — ProtectedRoute verifica sesión antes de renderizar
            { path: 'admin',                          element: <ProtectedRoute element={<Admin />} /> },
            { path: 'admin/libros/nuevo',             element: <ProtectedRoute element={<NuevoLibro />} /> },
            { path: 'admin/libros/:id/editar',        element: <ProtectedRoute element={<EditarLibro />} /> },
            { path: 'admin/libros/:id/eliminar',      element: <ProtectedRoute element={<EliminarLibro />} /> },
        ]
    }
]);

export default router;
