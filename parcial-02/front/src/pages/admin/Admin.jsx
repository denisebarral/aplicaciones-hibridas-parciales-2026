/**
 * pages/admin/Admin.jsx
 *
 * Panel de administración de libros.
 * Muestra todos los libros en una tabla con opciones de editar y eliminar,
 * y un botón para crear un libro nuevo.
 *
 * Ruta protegida — solo accesible si hay sesión activa.
 * El acceso sin token es bloqueado por ProtectedRoute antes de llegar acá.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLibrosService } from '../../services/libros.service.jsx';

function formatPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
}

export default function Admin() {
    const [libros, setLibros]   = useState([]);
    const [loading, setLoading] = useState(true);
    const { getLibros } = useLibrosService();

    // useLocation devuelve el objeto de la ruta actual, incluyendo el state que pasó navigate()
    // NuevoLibro y EditarLibro navegan acá con { state: { mensaje: '...' } } al guardar con éxito
    // Inicializamos flashMsg desde el state una sola vez: si el usuario recarga, el state se pierde
    // y el alert no reaparece (comportamiento correcto — no queremos un alert "fantasma")
    const location = useLocation();
    const [flashMsg, setFlashMsg] = useState(location.state?.mensaje || '');

    useEffect(() => {
        getLibros()
            .then(data => {
                setLibros(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    return (
        <div className="container py-5">

            {/* Alert de éxito — aparece solo cuando se navega desde NuevoLibro o EditarLibro con un mensaje */}
            {flashMsg && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                    {flashMsg}
                    {/* Al cerrar el alert, limpiamos el estado local — no vuelve a aparecer */}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setFlashMsg('')}
                        aria-label="Cerrar"
                    />
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="serif mb-0">Panel de administración</h2>
                <Link to="/admin/libros/nuevo" className="btn btn-primary">
                    + Nuevo libro
                </Link>
            </div>

            {libros.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No hay libros cargados todavía.</p>
                    <Link to="/admin/libros/nuevo" className="btn btn-primary">
                        Cargar el primero →
                    </Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--gold)' }}>
                                <th>Portada</th>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>Sección</th>
                                <th>Precio</th>
                                <th>Año</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {libros.map(libro => (
                                <tr key={libro._id}>
                                    <td>
                                        <img
                                            src={
                                                libro.imagen
                                                    ? `http://localhost:3333/uploads/${libro.imagen}`
                                                    : `https://picsum.photos/seed/${libro._id}/400/600`
                                            }
                                            alt={libro.titulo}
                                            style={{ width: 40, height: 55, objectFit: 'cover', borderRadius: 3 }}
                                        />
                                    </td>
                                    <td>
                                        <span className="fw-medium">{libro.titulo}</span>
                                    </td>
                                    <td className="text-muted small">{libro.autor}</td>
                                    <td>
                                        <span className="badge-genero">{libro.seccion || libro.genero}</span>
                                    </td>
                                    <td className="precio small">{formatPrecio(libro.precio)}</td>
                                    <td className="text-muted small">{libro.anio_publicacion}</td>
                                    <td className="text-end">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Link
                                                to={`/admin/libros/${libro._id}/editar`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Editar
                                            </Link>
                                            <Link
                                                to={`/admin/libros/${libro._id}/eliminar`}
                                                className="btn btn-sm"
                                                style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                                            >
                                                Eliminar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
