/**
 * pages/admin/Admin.jsx
 *
 * Página "hub" del panel de administración: es lo primero que ve el empleado
 * al loguearse (Login.jsx navega acá con navigate('/admin')).
 *
 * Antes, /admin mostraba directamente la tabla de libros. Al agregar el ABM
 * de géneros necesitábamos un lugar donde elegir QUÉ administrar, así que
 * esta página ahora solo tiene dos tarjetas que llevan a:
 *   /admin/libros   → tabla de libros   (antes vivía acá mismo, ver AdminLibros.jsx)
 *   /admin/generos  → tabla de géneros  (nuevo, ver AdminGeneros.jsx)
 *
 * Ruta protegida — solo accesible si hay sesión activa.
 */

import { Link } from 'react-router-dom';

export default function Admin() {
    return (
        <div className="container py-5">
            <h2 className="serif mb-4">Panel de administración</h2>

            <div className="row g-4">
                <div className="col-md-6">
                    <Link to="/admin/libros" className="text-decoration-none">
                        <div className="card h-100" style={{ border: '1px solid var(--gold)' }}>
                            <div className="card-body p-4">
                                <h4 className="serif mb-2" style={{ color: 'var(--dark)' }}>📚 Libros</h4>
                                <p className="text-muted small mb-0">
                                    Ver, crear, editar y eliminar los libros del catálogo.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="col-md-6">
                    <Link to="/admin/generos" className="text-decoration-none">
                        <div className="card h-100" style={{ border: '1px solid var(--gold)' }}>
                            <div className="card-body p-4">
                                <h4 className="serif mb-2" style={{ color: 'var(--dark)' }}>🏷️ Géneros</h4>
                                <p className="text-muted small mb-0">
                                    Ver, crear, editar y eliminar las categorías que se usan para
                                    filtrar el catálogo (el dropdown del navbar y los botones de sección).
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
