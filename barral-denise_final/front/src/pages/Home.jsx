/**
 * pages/Home.jsx
 *
 * Página principal pública de la librería.
 * Muestra el hero section con la identidad visual de Los 7 Locos
 * y una selección de los últimos 6 libros del catálogo.
 * No requiere autenticación.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibrosService } from '../services/libros.service.jsx';
import { API_URL } from '../services/api.service.jsx';

/**
 * Formatea un precio numérico como moneda argentina.
 *
 * @param {number} precio
 * @returns {string} Ej: "$4.200"
 */
function formatPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
}

export default function Home() {
    const [libros, setLibros]   = useState([]);
    const [loading, setLoading] = useState(true);
    const { getLibros }         = useLibrosService();

    // Carga todos los libros al montar la página
    useEffect(() => {
        getLibros()
            .then(data => {
                setLibros(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Tomamos los últimos 6 libros del array (los más recientes) y los mostramos en orden inverso
    const destacados = [...libros].reverse().slice(0, 6);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    return (
        <>
            {/* ── Hero Section ─────────────────────────────────────── */}
            <section
                style={{
                    backgroundColor: 'var(--dark)',
                    minHeight: '85vh',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <div className="container py-5">
                    <div className="row align-items-center gy-5">

                        <div className="col-lg-6">
                            <p className="small text-uppercase mb-2"
                               style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>
                                San Telmo, Buenos Aires — Desde 2009
                            </p>
                            <h1 className="display-3 fw-bold mb-3"
                                style={{ color: '#f5f0e8', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
                                Librería<br />
                                <span style={{ color: 'var(--red)' }}>Los 7 Locos</span>
                            </h1>
                            <p className="lead mb-3" style={{ color: 'var(--gold)', fontStyle: 'italic' }}>
                                "El hombre es como los libros que lee."
                            </p>
                            <p className="mb-5" style={{ color: 'var(--gold)', maxWidth: 480 }}>
                                Un espacio de culto para los amantes de Cortázar, Borges, Galeano,
                                García Márquez y la literatura latinoamericana que rompió las reglas.
                                Estanterías hasta el techo y Macedonio durmiendo entre los ensayos.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Link to="/catalogo" className="btn btn-primary btn-lg px-4">
                                    Ver catálogo
                                </Link>
                            </div>
                        </div>

                        {/* Imagen de portada con efecto de marco doble */}
                        <div className="col-lg-6 d-flex justify-content-center">
                            <div style={{ position: 'relative', maxWidth: 380, width: '100%' }}>
                                {/* Sombra decorativa desplazada — efecto de profundidad */}
                                <div style={{
                                    position: 'absolute', top: 16, left: 16,
                                    width: '100%', height: '100%',
                                    border: '2px solid rgba(200,169,110,0.4)'
                                }}></div>
                                {/* Imagen principal */}
                                <img
                                    src="/los7locos-portada.jpg"
                                    alt="Los 7 Locos — librería"
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        display: 'block',
                                        border: '3px solid var(--gold)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                    }}
                                />
                                {/* Badge rojo — mismo estilo que tenía el bloque anterior */}
                                <div style={{
                                    position: 'absolute', bottom: 20, left: -16,
                                    background: 'var(--red)', color: '#f5f0e8',
                                    fontFamily: 'Playfair Display, serif',
                                    fontSize: '0.8rem', padding: '6px 16px',
                                    letterSpacing: '0.05em',
                                    boxShadow: '2px 2px 8px rgba(0,0,0,0.4)'
                                }}>
                                    San Telmo · Desde 2009
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── Datos destacados ─────────────────────────────────── */}
            <section style={{ backgroundColor: 'var(--red)', padding: '3rem 0' }}>
                <div className="container">
                    <div className="row text-center gy-3">
                        {[
                            { num: '15+',   label: 'Años en San Telmo' },
                            { num: '5.000+', label: 'Títulos disponibles' },
                            { num: '1',     label: 'Gato (Macedonio)' },
                            { num: '∞',     label: 'Lecturas posibles' }
                        ].map(({ num, label }) => (
                            <div key={label} className="col-6 col-md-3">
                                <h3 className="serif fw-bold mb-0" style={{ color: '#f5f0e8' }}>{num}</h3>
                                <p className="small mb-0" style={{ color: 'var(--gold)' }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Libros destacados ────────────────────────────────── */}
            <section className="container my-5 py-3">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <h2 className="section-title mb-0">Selección destacada</h2>
                    <Link to="/catalogo" className="btn btn-outline-primary btn-sm">
                        Ver todos →
                    </Link>
                </div>

                {destacados.length > 0 ? (
                    <div className="row g-3">
                        {destacados.map(libro => (
                            <div key={libro._id} className="col-6 col-md-4 col-lg-2">
                                <div className="card h-100">
                                    <img
                                        src={
                                            libro.imagen
                                                ? `${API_URL}/uploads/${libro.imagen}`
                                                : `https://picsum.photos/seed/${libro._id}/400/600`
                                        }
                                        className="card-img-top"
                                        alt={`Portada de ${libro.titulo}`}
                                        style={{ height: 200, objectFit: 'contain', background: 'var(--dark)' }}
                                    />
                                    <div className="card-body d-flex flex-column p-2">
                                        <span className="badge-genero mb-1 align-self-start">
                                            {libro.genero || libro.seccion}
                                        </span>
                                        <h6 className="card-title serif mb-1 small">{libro.titulo}</h6>
                                        <p className="card-text small text-muted mb-1">{libro.autor}</p>
                                        <p className="precio mt-auto mb-2">{formatPrecio(libro.precio)}</p>
                                        <Link to={`/libro/${libro._id}`} className="btn btn-outline-primary btn-sm">
                                            Ver más
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted py-5">
                        Aún no hay libros en el catálogo.{' '}
                        <Link to="/login" style={{ color: 'var(--red)' }}>Cargar uno →</Link>
                    </p>
                )}
            </section>

            {/* ── Horarios y ubicación ─────────────────────────────── */}
            <section style={{ backgroundColor: '#2a1a10', padding: '4rem 0', color: '#f5f0e8' }}>
                <div className="container">
                    <div className="row gy-4 align-items-center">
                        <div className="col-md-6">
                            <h3 className="serif mb-3" style={{ color: 'var(--gold)' }}>Visitanos en San Telmo</h3>
                            <p className="mb-1">📍 Defensa 742, San Telmo, CABA</p>
                            <p className="mb-1">📞 +54 11 4300-7777</p>
                            <p className="mb-1">🕐 Lunes a Sábado: 10:00 – 20:00</p>
                            <p className="mb-0">🕐 Domingos: 12:00 – 18:00</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
