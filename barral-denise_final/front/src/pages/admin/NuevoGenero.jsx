/**
 * pages/admin/NuevoGenero.jsx
 *
 * Formulario para crear un nuevo género.
 * Calca la estructura de NuevoLibro.jsx (React Hook Form + service + navigate
 * con flash message), pero mucho más simple: un género es solo
 * { nombre, slug, descripcion } — sin imagen, sin FormData.
 *
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useGenerosService } from '../../services/generos.service.jsx';

export default function NuevoGenero() {
    const navigate = useNavigate();
    const { crearGenero } = useGenerosService();
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    async function onSubmit(datos) {
        setApiError('');
        // El back devuelve el resultado crudo de insertOne — no hay envoltorio { mensaje, resultado }
        // como en el PATCH/DELETE, así que chequeamos insertedId directamente
        const respuesta = await crearGenero(datos);
        if (respuesta?.insertedId) {
            navigate('/admin/generos', { state: { mensaje: 'Género creado con éxito.' } });
        } else {
            const msg = respuesta?.errores?.join(' · ') || respuesta?.mensaje || 'Error al crear el género.';
            setApiError(msg);
        }
    }

    return (
        <div className="container py-5" style={{ maxWidth: 600 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin/generos" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Nuevo género</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row g-3">

                    <div className="col-12">
                        <label className="form-label">Nombre *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                            placeholder="Narrativa"
                            {...register('nombre', { required: 'El nombre es obligatorio.' })}
                        />
                        {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                    </div>

                    <div className="col-12">
                        <label className="form-label">Slug *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
                            placeholder="narrativa"
                            {...register('slug', {
                                required: 'El slug es obligatorio.',
                                // Mismo criterio que los valores de SECCIONES en NuevoLibro/EditarLibro:
                                // minúsculas, sin espacios ni acentos, porque se usa en la URL /catalogo/:seccion
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message: 'Solo minúsculas, números y guiones (sin espacios ni acentos).'
                                }
                            })}
                        />
                        <div className="form-text small" style={{ color: '#888' }}>
                            Se usa en la URL del catálogo (/catalogo/{'{slug}'}) y debe coincidir con el
                            valor que se carga como "Sección" al crear un libro.
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
                        {isSubmitting ? 'Guardando...' : 'Crear género'}
                    </button>
                    <Link to="/admin/generos" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}
