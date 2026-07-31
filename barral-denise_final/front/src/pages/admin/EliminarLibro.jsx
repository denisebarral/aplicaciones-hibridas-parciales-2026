/**
 * pages/admin/EliminarLibro.jsx
 *
 * Página de confirmación antes de eliminar un libro.
 * Muestra los datos básicos del libro para que el empleado confirme
 * que está borrando el libro correcto.
 *
 * La eliminación es permanente (hard delete) — también borra la imagen del servidor.
 * Por eso pedimos confirmación antes de ejecutarla.
 *
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLibrosService } from '../../services/libros.service.jsx';
import { API_URL } from '../../services/api.service.jsx';

export default function EliminarLibro() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const { getLibroPorId, eliminarLibro } = useLibrosService();

    const [libro, setLibro]       = useState(null);
    const [loading, setLoading]   = useState(true);
    const [eliminando, setEliminando] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        getLibroPorId(id).then(data => {
            if (!data || data.mensaje) {
                setApiError('Libro no encontrado.');
            } else {
                setLibro(data);
            }
            setLoading(false);
        });
    }, [id]);

    async function confirmarEliminar() {
        setEliminando(true);
        const respuesta = await eliminarLibro(id);

        // El back devuelve { mensaje, resultado } — deletedCount está DENTRO de resultado,
        // no en el nivel superior. El chequeo anterior (respuesta?.deletedCount) siempre daba
        // false aunque el borrado hubiera funcionado, así que nunca navegaba ni mostraba éxito.
        if (respuesta?.resultado?.deletedCount > 0) {
            navigate('/admin/libros', { state: { mensaje: 'Libro eliminado con éxito.' } });
        } else {
            setApiError(respuesta?.mensaje || 'Error al eliminar el libro.');
            setEliminando(false);
        }
    }

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    if (apiError && !libro) return (
        <div className="container py-5 text-center">
            <p className="text-muted">{apiError}</p>
            <Link to="/admin/libros" className="btn btn-outline-primary">← Volver al panel</Link>
        </div>
    );

    return (
        <div className="container py-5" style={{ maxWidth: 540 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin/libros" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Eliminar libro</h2>
            </div>

            {/* Card de confirmación con los datos del libro */}
            <div className="card" style={{ border: '1px solid var(--red)' }}>
                <div className="card-body p-4">
                    <div className="d-flex gap-3 mb-4">
                        <img
                            src={
                                libro.imagen
                                    ? `${API_URL}/uploads/${libro.imagen}`
                                    : `https://picsum.photos/seed/${libro._id}/400/600`
                            }
                            alt={libro.titulo}
                            style={{ width: 70, height: 95, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <div>
                            <h5 className="serif mb-1">{libro.titulo}</h5>
                            <p className="text-muted small mb-0">{libro.autor} · {libro.editorial}</p>
                            <p className="text-muted small mb-0">{libro.anio_publicacion}</p>
                        </div>
                    </div>

                    {/* Advertencia clara — esta acción es irreversible */}
                    <div className="alert alert-danger py-2 small mb-4">
                        <strong>Esta acción es permanente.</strong> El libro y su imagen de portada
                        se eliminarán del servidor y no se podrán recuperar.
                    </div>

                    {apiError && (
                        <div className="alert alert-warning py-2 small mb-3">{apiError}</div>
                    )}

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-danger"
                            onClick={confirmarEliminar}
                            disabled={eliminando}
                        >
                            {eliminando ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
                        </button>
                        <Link to="/admin" className="btn btn-outline-secondary">Cancelar</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
