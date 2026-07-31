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
 *     /admin                       → Hub del panel (elegir Libros o Géneros)
 *     /admin/libros                → Tabla de libros (antes vivía en /admin)
 *     /admin/libros/nuevo          → Crear libro
 *     /admin/libros/:id/editar     → Editar libro
 *     /admin/libros/:id/eliminar   → Eliminar libro
 *     /admin/generos               → Tabla de géneros
 *     /admin/generos/nuevo         → Crear género
 *     /admin/generos/:id/editar    → Editar género
 *     /admin/generos/:id/eliminar  → Eliminar (soft delete) género
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
import AdminLibros   from '../pages/admin/AdminLibros.jsx';
import NuevoLibro    from '../pages/admin/NuevoLibro.jsx';
import EditarLibro   from '../pages/admin/EditarLibro.jsx';
import EliminarLibro from '../pages/admin/EliminarLibro.jsx';

import AdminGeneros   from '../pages/admin/AdminGeneros.jsx';
import NuevoGenero    from '../pages/admin/NuevoGenero.jsx';
import EditarGenero   from '../pages/admin/EditarGenero.jsx';
import EliminarGenero from '../pages/admin/EliminarGenero.jsx';

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

            // Hub del panel: elegir entre administrar libros o géneros
            { path: 'admin', element: <ProtectedRoute element={<Admin />} /> },

            // ABM de libros
            { path: 'admin/libros',                   element: <ProtectedRoute element={<AdminLibros />} /> },
            { path: 'admin/libros/nuevo',              element: <ProtectedRoute element={<NuevoLibro />} /> },
            { path: 'admin/libros/:id/editar',         element: <ProtectedRoute element={<EditarLibro />} /> },
            { path: 'admin/libros/:id/eliminar',       element: <ProtectedRoute element={<EliminarLibro />} /> },

            // ABM de géneros
            { path: 'admin/generos',                   element: <ProtectedRoute element={<AdminGeneros />} /> },
            { path: 'admin/generos/nuevo',              element: <ProtectedRoute element={<NuevoGenero />} /> },
            { path: 'admin/generos/:id/editar',         element: <ProtectedRoute element={<EditarGenero />} /> },
            { path: 'admin/generos/:id/eliminar',       element: <ProtectedRoute element={<EliminarGenero />} /> },
        ]
    }
]);

export default router;
