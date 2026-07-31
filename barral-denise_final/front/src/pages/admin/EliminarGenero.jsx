/**
 * pages/admin/EliminarGenero.jsx
 *
 * Página de confirmación antes de eliminar un género.
 * Calca la estructura de EliminarLibro.jsx, pero el mensaje de advertencia
 * es distinto a propósito: eliminar un libro es un hard delete (deleteOne,
 * irreversible), mientras que eliminar un género es un SOFT delete
 * (el back solo hace updateOne con { borrado: true }, ver
 * back/services/generos.service.js → eliminar()).
 *
 * Por eso acá el texto no dice "esta acción es permanente" — sería falso.
 * Lo que sí es cierto y vale la pena advertir: el género deja de aparecer
 * en el dropdown del navbar y en los filtros del catálogo (Catalogo.jsx),
 * aunque los libros que ya tenían esa "seccion" cargada no se modifican.
 *
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGenerosService } from '../../services/generos.service.jsx';

export default function EliminarGenero() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const { getGeneroPorId, eliminarGenero } = useGenerosService();

    const [genero, setGenero]         = useState(null);
    const [loading, setLoading]       = useState(true);
    const [eliminando, setEliminando] = useState(false);
    const [apiError, setApiError]     = useState('');

    useEffect(() => {
        getGeneroPorId(id).then(data => {
            if (!data || data.mensaje) {
                setApiError('Género no encontrado.');
            } else {
                setGenero(data);
            }
            setLoading(false);
        });
    }, [id]);

    async function confirmarEliminar() {
        setEliminando(true);
        const respuesta = await eliminarGenero(id);

        // Soft delete: el back devuelve { mensaje, resultado }, y resultado.matchedCount
        // (NO deletedCount, porque no es un deleteOne — ver el comentario del encabezado)
        if (respuesta?.resultado?.matchedCount > 0) {
            navigate('/admin/generos', { state: { mensaje: 'Género eliminado correctamente.' } });
        } else {
            setApiError(respuesta?.mensaje || 'Error al eliminar el género.');
            setEliminando(false);
        }
    }

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    if (apiError && !genero) return (
        <div className="container py-5 text-center">
            <p className="text-muted">{apiError}</p>
            <Link to="/admin/generos" className="btn btn-outline-primary">← Volver al panel</Link>
        </div>
    );

    return (
        <div className="container py-5" style={{ maxWidth: 540 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin/generos" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Eliminar género</h2>
            </div>

            <div className="card" style={{ border: '1px solid var(--red)' }}>
                <div className="card-body p-4">
                    <div className="mb-4">
                        <h5 className="serif mb-1">{genero.nombre}</h5>
                        <p className="text-muted small mb-0">Slug: {genero.slug}</p>
                    </div>

                    {/* Advertencia ajustada a lo que realmente hace el back: soft delete, no borrado físico */}
                    <div className="alert alert-warning py-2 small mb-4">
                        Esta acción no borra el género de la base de datos: lo marca como oculto
                        (<code>borrado: true</code>). Va a dejar de aparecer en el menú del navbar y en
                        los filtros del catálogo, pero los libros que ya tenían esta sección cargada
                        no se modifican.
                    </div>

                    {apiError && (
                        <div className="alert alert-danger py-2 small mb-3">{apiError}</div>
                    )}

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-danger"
                            onClick={confirmarEliminar}
                            disabled={eliminando}
                        >
                            {eliminando ? 'Eliminando...' : 'Sí, ocultar este género'}
                        </button>
                        <Link to="/admin/generos" className="btn btn-outline-secondary">Cancelar</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
