/**
 * pages/admin/EditarGenero.jsx
 *
 * Formulario para editar un género existente.
 * Calca la estructura de EditarLibro.jsx: pre-carga los datos con reset()
 * de React Hook Form y actualiza con PATCH. A diferencia de EditarLibro,
 * acá no hay imagen que preservar/reemplazar — es un formulario simple.
 *
 * El id del género viene de la URL via useParams.
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useGenerosService } from '../../services/generos.service.jsx';

export default function EditarGenero() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const { getGeneroPorId, actualizarGenero } = useGenerosService();

    const [loading, setLoading]   = useState(true);
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    // Carga el género y pre-carga el formulario con sus datos
    useEffect(() => {
        getGeneroPorId(id).then(genero => {
            if (!genero || genero.mensaje) {
                setApiError('Género no encontrado.');
                setLoading(false);
                return;
            }
            reset({
                nombre:      genero.nombre,
                slug:        genero.slug,
                descripcion: genero.descripcion
            });
            setLoading(false);
        });
    }, [id]);

    async function onSubmit(datos) {
        setApiError('');
        const respuesta = await actualizarGenero(id, datos);

        // El back devuelve { mensaje, resultado } — matchedCount está dentro de resultado
        if (respuesta?.resultado?.matchedCount > 0) {
            navigate('/admin/generos', { state: { mensaje: 'Género actualizado correctamente.' } });
        } else {
            setApiError(respuesta?.mensaje || 'Error al actualizar el género.');
        }
    }

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    return (
        <div className="container py-5" style={{ maxWidth: 600 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin/generos" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Editar género</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row g-3">

                    <div className="col-12">
                        <label className="form-label">Nombre *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                            {...register('nombre', { required: 'El nombre es obligatorio.' })}
                        />
                        {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                    </div>

                    <div className="col-12">
                        <label className="form-label">Slug *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
                            {...register('slug', {
                                required: 'El slug es obligatorio.',
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message: 'Solo minúsculas, números y guiones (sin espacios ni acentos).'
                                }
                            })}
                        />
                        <div className="form-text small" style={{ color: '#888' }}>
                            Se usa en la URL del catálogo (/catalogo/{'{slug}'}). Si lo cambiás, los links
                            viejos a esa categoría dejan de funcionar.
                        </div>
                        {errors.slug && <div className="invalid-feedback">{errors.slug.message}</div>}
                    </div>

                    <div className="col-12">
                        <label className="form-label">Descripción *</label>
                        <textarea
                            rows={4}
                            className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                            {...register('descripcion', { required: 'La descripción es obligatoria.' })}
                        />
                        {errors.descripcion && (
                            <div className="invalid-feedback">{errors.descripcion.message}</div>
                        )}
                    </div>

                </div>

                {apiError && (
                    <div className="alert alert-danger mt-3 py-2 small">{apiError}</div>
                )}

                <div className="d-flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <Link to="/admin/generos" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}
