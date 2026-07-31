/**
 * components/NavBar.jsx
 *
 * Barra de navegación principal del sitio.
 * Muestra los links públicos (Home, Catálogo con dropdown de géneros)
 * y el acceso al área de empleados (login si no hay sesión, admin + logout si la hay).
 *
 * Los géneros se cargan una sola vez al montar el componente (NavBar vive en Layout,
 * que no se desmonta al cambiar de ruta).
 */

import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useEmail } from '../contexts/Session.context.jsx';
import { useGenerosService } from '../services/generos.service.jsx';

export default function NavBar() {
    const email = useEmail();
    const [generos, setGeneros] = useState([]);
    const { getGeneros } = useGenerosService();

    // Carga los géneros al montar el NavBar (solo una vez por sesión de navegación)
    useEffect(() => {
        getGeneros()
            .then(data => setGeneros(Array.isArray(data) ? data : []))
            .catch(() => setGeneros([]));
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark px-3 px-md-5">
            <Link className="navbar-brand" to="/">Los 7 Locos</Link>

            {/* Botón hamburguesa para mobile */}
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navMenu"
                aria-controls="navMenu"
                aria-expanded="false"
                aria-label="Abrir menú"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navMenu">
                <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

                    <li className="nav-item">
                        {/* NavLink agrega la clase "active" automáticamente cuando la ruta coincide */}
                        <NavLink className="nav-link" to="/" end>Home</NavLink>
                    </li>

                    {/* Dropdown de categorías — se puebla con los géneros de la BD */}
                    <li className="nav-item dropdown">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Catálogo
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark">
                            <li>
                                <Link className="dropdown-item" to="/catalogo">Todos los libros</Link>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            {generos.map(g => (
                                <li key={g._id}>
                                    <Link className="dropdown-item" to={`/catalogo/${g.slug}`}>
                                        {g.nombre}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>

                    {/* Acceso al área de empleados: cambia según si hay sesión activa */}
                    {email ? (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/admin">
                                    Backoffice
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                {/* NavLink to="/logout" ejecuta el componente Logout que limpia la sesión */}
                                <NavLink className="nav-link" to="/logout"
                                    style={{ borderLeft: '1px solid var(--gold)', paddingLeft: '1rem' }}>
                                    Cerrar sesión
                                </NavLink>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/login"
                                style={{ borderLeft: '1px solid var(--gold)', paddingLeft: '1rem' }}>
                                Ingresar →
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
