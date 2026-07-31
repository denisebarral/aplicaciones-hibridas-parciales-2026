/**
 * pages/admin/AdminGeneros.jsx
 *
 * Panel de administración de géneros.
 * Es el equivalente de AdminLibros.jsx pero para la colección "generos":
 * misma estructura (tabla + flash message + botón de alta), sin la columna
 * de imagen porque los géneros no tienen portada.
 *
 * Ruta protegida — solo accesible si hay sesión activa.
 * El acceso sin token es bloqueado por ProtectedRoute antes de llegar acá.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGenerosService } from '../../services/generos.service.jsx';

export default function AdminGeneros() {
    const [generos, setGeneros] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getGeneros } = useGenerosService();

    // Mismo mecanismo de flashMsg que AdminLibros.jsx: NuevoGenero/EditarGenero/EliminarGenero
    // navegan acá con { state: { mensaje: '...' } } al terminar con éxito.
    const location = useLocation();
    const [flashMsg, setFlashMsg] = useState(location.state?.mensaje || '');

    useEffect(() => {
        getGeneros()
            .then(data => {
                setGeneros(Array.isArray(data) ? data : []);
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

            {flashMsg && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                    {flashMsg}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setFlashMsg('')}
                        aria-label="Cerrar"
                    />
                </div>
            )}

            <div className="d-flex align-items-center gap-3 mb-2">
                <Link to="/admin" className="btn btn-outline-secondary btn-sm">← Panel</Link>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="serif mb-0">Géneros</h2>
                <Link to="/admin/generos/nuevo" className="btn btn-primary">
                    + Nuevo género
                </Link>
            </div>

            {generos.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No hay géneros cargados todavía.</p>
                    <Link to="/admin/generos/nuevo" className="btn btn-primary">
                        Cargar el primero →
                    </Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--gold)' }}>
                                <th>Nombre</th>
                                <th>Slug</th>
                                <th>Descripción</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generos.map(genero => (
                                <tr key={genero._id}>
                                    <td>
                                        <span className="fw-medium">{genero.nombre}</span>
                                    </td>
                                    <td>
                                        <span className="badge-genero">{genero.slug}</span>
                                    </td>
                                    {/* La descripción puede ser larga — la truncamos visualmente con CSS,
                                        el dato completo sigue viajando entero en el objeto */}
                                    <td className="text-muted small" style={{ maxWidth: 380 }}>
                                        <span className="d-inline-block text-truncate" style={{ maxWidth: 380 }}>
                                            {genero.descripcion}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Link
                                                to={`/admin/generos/${genero._id}/editar`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Editar
                                            </Link>
                                            <Link
                                                to={`/admin/generos/${genero._id}/eliminar`}
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
