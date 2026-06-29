/**
 * components/Layout.jsx
 *
 * Componente wrapper que contiene la estructura común a todas las páginas:
 * NavBar (arriba) + contenido de la ruta activa (<Outlet />) + Footer (abajo).
 *
 * <Outlet /> es el "hueco" que React Router llena con el componente
 * de la ruta que esté activa en ese momento.
 * Cuando el usuario navega de /catalogo a /login, solo cambia el Outlet —
 * el NavBar y el Footer no se desmontan ni se re-renderizan.
 */

import { Outlet } from 'react-router-dom';
import NavBar from './NavBar.jsx';

export default function Layout() {
    return (
        <>
            <NavBar />

            {/* Outlet: aquí se renderiza la página de la ruta activa */}
            <Outlet />

            {/* Footer estático — igual al del parcial-01 */}
            <footer className="py-5 mt-5">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-md-4">
                            <h5 className="serif mb-3" style={{ color: '#fff' }}>Los 7 Locos</h5>
                            <p className="small mb-1">Literatura latinoamericana desde 2009.</p>
                            <p className="small mb-1">El rincón de Cortázar, Borges y Galeano.</p>
                            <p className="small mt-2" style={{ color: '#888' }}>🐱 Macedonio dice hola.</p>
                        </div>
                        <div className="col-md-4">
                            <h6 className="serif mb-3" style={{ color: '#fff' }}>Datos de contacto</h6>
                            <p className="small mb-1">📍 Defensa 742, San Telmo, CABA</p>
                            <p className="small mb-1">📞 +54 11 4300-7777</p>
                            <p className="small mb-1">📧 hola@los7locos.com.ar</p>
                            <p className="small mb-0">🕐 Lun–Sáb 10:00–20:00 / Dom 12:00–18:00</p>
                        </div>
                        <div className="col-md-4">
                            <h6 className="serif mb-3" style={{ color: '#fff' }}>Desarrolladores</h6>
                            <p className="small mt-3" style={{ color: '#888' }}>
                                <a href="http://localhost:3333/api-docs" target="_blank" rel="noreferrer" style={{ color: '#888' }}>
                                    API Docs (Swagger) →
                                </a>
                            </p>
                        </div>
                    </div>
                    <hr className="gold-divider mt-4" />
                    <p className="text-center small mb-0" style={{ color: '#666' }}>
                        © 2024 Librería Los 7 Locos · Defensa 742, San Telmo · Hecho con amor por lectores apasionados
                    </p>
                </div>
            </footer>
        </>
    );
}
