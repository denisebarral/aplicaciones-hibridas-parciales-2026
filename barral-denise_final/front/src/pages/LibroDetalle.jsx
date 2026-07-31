/**
 * pages/LibroDetalle.jsx
 *
 * Página pública de detalle de un libro.
 * Muestra toda la información del libro: imagen, título, autor, editorial,
 * año, género, descripción, precio y link externo si lo tiene.
 *
 * El id del libro viene de la URL via useParams (/libro/:id).
 * No requiere autenticación.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrosService } from '../services/libros.service.jsx';
import { API_URL } from '../services/api.service.jsx';

function formatPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
}

export default function LibroDetalle() {
    // useParams extrae el :id de la URL (ej: "/libro/6830abc..." → id = "6830abc...")
    const { id } = useParams();

    const [libro, setLibro]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');
    const { getLibroPorId }   = useLibrosService();

    useEffect(() => {
        getLibroPorId(id)
            .then(data => {
                // Si el back devuelve { mensaje: 'Libro no encontrado' }, lo tratamos como error
                if (!data || data.mensaje) {
                    setError('Libro no encontrado.');
                } else {
                    setLibro(data);
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Error al cargar el libro.');
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    if (error) return (
        <div className="container py-5 text-center">
            <p className="text-muted">{error}</p>
            <Link to="/catalogo" className="btn btn-outline-primary">← Volver al catálogo</Link>
        </div>
    );

    return (
        <div className="container py-5">
            <Link to="/catalogo" className="btn btn-outline-primary btn-sm mb-4">
                ← Volver al catálogo
            </Link>

            <div className="row g-4">

                {/* Imagen de portada */}
                <div className="col-md-4">
                    <img
                        src={
                            libro.imagen
                                ? `${API_URL}/uploads/${libro.imagen}`
                                : `https://picsum.photos/seed/${libro._id}/400/600`
                        }
                        alt={`Portada de ${libro.titulo}`}
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: 500, objectFit: 'cover', width: '100%' }}
                    />
                </div>

                {/* Información del libro */}
                <div className="col-md-8">
                    <span className="badge-genero mb-3 d-inline-block">
                        {libro.genero || libro.seccion}
                    </span>
                    <h1 className="serif mb-1">{libro.titulo}</h1>
                    <p className="text-muted mb-1">
                        {libro.autor} · {libro.editorial} · {libro.anio_publicacion}
                    </p>
                    <p className="precio my-3">{formatPrecio(libro.precio)}</p>

                    <hr className="gold-divider" />

                    <p className="mt-3 lead" style={{ fontSize: '1rem' }}>{libro.descripcion}</p>

                    {/* Link externo solo si el libro lo tiene */}
                    {libro.link && (
                        <a
                            href={libro.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary mt-3 me-2"
                        >
                            Ver más información →
                        </a>
                    )}
                    <Link to="/catalogo" className="btn btn-outline-secondary mt-3">
                        Ver más libros
                    </Link>
                </div>

            </div>
        </div>
    );
}
