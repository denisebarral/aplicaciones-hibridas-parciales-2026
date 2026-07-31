/**
 * pages/Catalogo.jsx
 *
 * Página pública del catálogo de libros.
 * Sin parámetro de ruta: muestra todos los libros.
 * Con :seccion (/catalogo/narrativa): filtra los libros por sección.
 *
 * Los botones de categoría usan los géneros de la BD para filtrar.
 * No requiere autenticación.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrosService } from '../services/libros.service.jsx';
import { useGenerosService } from '../services/generos.service.jsx';

function formatPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
}

export default function Catalogo() {
    // useParams extrae el :seccion de la URL (ej: "/catalogo/narrativa" → seccion = "narrativa")
    // Si estamos en /catalogo sin parámetro, seccion es undefined
    const { seccion } = useParams();

    const [libros, setLibros]   = useState([]);
    const [generos, setGeneros] = useState([]);
    const [loading, setLoading] = useState(true);

    const { getLibros }   = useLibrosService();
    const { getGeneros }  = useGenerosService();

    // Se re-ejecuta cada vez que cambia el parámetro :seccion
    // (el usuario hizo click en otra categoría)
    useEffect(() => {
        setLoading(true);

        // Construimos el filtro: si hay sección activa lo incluimos, si no pedimos todos
        const filtro = seccion ? { seccion } : {};

        // Promise.all ejecuta ambos fetch en paralelo y espera a que los dos terminen
        Promise.all([getLibros(filtro), getGeneros()])
            .then(([librosData, generosData]) => {
                // Acá obtenemos los datos de libros y géneros. Si alguno no es un array, lo reemplazamos por un array vacío.
                setLibros(Array.isArray(librosData) ? librosData : []);
                setGeneros(Array.isArray(generosData) ? generosData : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [seccion]);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    return (
        <div className="container py-5">

            {/* Título + contador */}
            <div className="d-flex align-items-end justify-content-between mb-4">
                <h2 className="section-title mb-0">
                    {seccion ? `Categoría: ${seccion}` : 'Catálogo completo'}
                </h2>
                <span className="text-muted small">{libros.length} títulos</span>
            </div>

            {/* Filtros de categoría — botones que navegan a /catalogo/:slug */}
            <div className="d-flex gap-2 flex-wrap mb-4">
                {/* "Todas" activo cuando no hay parámetro de sección */}
                <Link
                    to="/catalogo"
                    className={`btn btn-sm ${!seccion ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                    Todas
                </Link>
                {generos.map(g => (
                    <Link
                        key={g._id}
                        to={`/catalogo/${g.slug}`}
                        className={`btn btn-sm ${seccion === g.slug ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                        {g.nombre}
                    </Link>
                ))}
            </div>

            {/* Grilla de libros */}
            {libros.length > 0 ? (
                <div className="row g-3">
                    {libros.map(libro => (
                        <div key={libro._id} className="col-6 col-md-4 col-lg-3">
                            <div className="card h-100">
                                <img
                                    src={
                                        libro.imagen
                                            ? `http://localhost:3333/uploads/${libro.imagen}`
                                            : `https://picsum.photos/seed/${libro._id}/400/600`
                                    }
                                    className="card-img-top"
                                    alt={`Portada de ${libro.titulo}`}
                                    style={{ height: 240, objectFit: 'contain', background: 'var(--dark)' }}
                                />
                                <div className="card-body d-flex flex-column p-3">
                                    <span className="badge-genero mb-2 align-self-start">
                                        {libro.genero || libro.seccion}
                                    </span>
                                    <h6 className="card-title serif mb-1">{libro.titulo}</h6>
                                    <p className="card-text small text-muted mb-2">{libro.autor}</p>
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
                <div className="text-center py-5">
                    <p className="text-muted">No hay libros en esta categoría.</p>
                    <Link to="/catalogo" className="btn btn-outline-primary btn-sm">Ver todo el catálogo</Link>
                </div>
            )}
        </div>
    );
}
