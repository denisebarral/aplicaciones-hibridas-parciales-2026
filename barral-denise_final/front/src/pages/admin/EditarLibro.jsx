/**
 * pages/admin/EditarLibro.jsx
 *
 * Formulario para editar un libro existente.
 * Pre-carga los datos del libro actual con reset() de React Hook Form.
 * La imagen es OPCIONAL: si no se selecciona archivo, el back conserva la imagen anterior.
 * Si se selecciona, el back borra la imagen vieja y guarda la nueva.
 *
 * El id del libro viene de la URL via useParams.
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLibrosService } from '../../services/libros.service.jsx';
import { API_URL } from '../../services/api.service.jsx';

// Valores exactos de la BD — deben coincidir para que el filtro del Catálogo funcione
const SECCIONES = ['cronica', 'poesia', 'ensayo', 'cuentos', 'narrativa'];

// Géneros con acentos tal como están guardados en MongoDB
const GENEROS = ['crónica', 'poesía', 'ensayo', 'cuentos', 'novela'];

export default function EditarLibro() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const { getLibroPorId, actualizarLibro } = useLibrosService();

    const [loading, setLoading]   = useState(true);
    const [apiError, setApiError] = useState('');
    const [imagenActual, setImagenActual] = useState('');

    // reset(): permite actualizar los valores del formulario después de cargar los datos del libro
    // Necesario porque el componente se monta antes de que llegue la respuesta del back
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    // Carga el libro y pre-carga el formulario con sus datos
    useEffect(() => {
        getLibroPorId(id).then(libro => {
            if (!libro || libro.mensaje) {
                setApiError('Libro no encontrado.');
                setLoading(false);
                return;
            }
            // reset() de RHF actualiza todos los campos del formulario con los valores del libro
            // No incluimos "imagen" porque es un input file: no puede tener un valor pre-seteado por seguridad
            reset({
                titulo:           libro.titulo,
                autor:            libro.autor,
                editorial:        libro.editorial,
                genero:           libro.genero,
                seccion:          libro.seccion,
                descripcion:      libro.descripcion,
                precio:           libro.precio,
                anio_publicacion: libro.anio_publicacion,
                link:             libro.link || '',
            });
            // Guardamos el filename de la imagen actual para mostrarla como preview
            setImagenActual(libro.imagen || '');
            setLoading(false);
        });
    }, [id]);

    async function onSubmit(datos) {
        setApiError('');
        const respuesta = await actualizarLibro(id, datos);

        // El back devuelve { mensaje, resultado } — el matchedCount está dentro de resultado
        // Bug anterior: chequeaba respuesta?.matchedCount (undefined) en vez de respuesta?.resultado?.matchedCount
        if (respuesta?.resultado?.matchedCount > 0) {
            navigate('/admin/libros', { state: { mensaje: 'Libro actualizado correctamente.' } });
        } else {
            setApiError(respuesta?.mensaje || 'Error al actualizar el libro.');
        }
    }

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--red)' }} role="status"></div>
        </div>
    );

    return (
        <div className="container py-5" style={{ maxWidth: 700 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin/libros" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Editar libro</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate encType="multipart/form-data">
                <div className="row g-3">

                    <div className="col-md-8">
                        <label className="form-label">Título *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                            {...register('titulo', { required: 'El título es obligatorio.' })}
                        />
                        {errors.titulo && <div className="invalid-feedback">{errors.titulo.message}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Año de publicación *</label>
                        <input
                            type="number"
                            className={`form-control ${errors.anio_publicacion ? 'is-invalid' : ''}`}
                            {...register('anio_publicacion', {
                                required: 'El año es obligatorio.',
                                min: { value: 1, message: 'Año inválido.' },
                                max: { value: new Date().getFullYear(), message: 'El año no puede ser futuro.' }
                            })}
                        />
                        {errors.anio_publicacion && (
                            <div className="invalid-feedback">{errors.anio_publicacion.message}</div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Autor *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.autor ? 'is-invalid' : ''}`}
                            {...register('autor', { required: 'El autor es obligatorio.' })}
                        />
                        {errors.autor && <div className="invalid-feedback">{errors.autor.message}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Editorial *</label>
                        <input
                            type="text"
                            className={`form-control ${errors.editorial ? 'is-invalid' : ''}`}
                            {...register('editorial', { required: 'La editorial es obligatoria.' })}
                        />
                        {errors.editorial && <div className="invalid-feedback">{errors.editorial.message}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Género *</label>
                        {/* Select con los 5 géneros exactos de la BD (con acentos) */}
                        <select
                            className={`form-select ${errors.genero ? 'is-invalid' : ''}`}
                            {...register('genero', { required: 'Seleccioná un género.' })}
                        >
                            <option value="">Elegir género...</option>
                            {GENEROS.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        {errors.genero && <div className="invalid-feedback">{errors.genero.message}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Sección *</label>
                        {/* Select con los 5 valores exactos de la BD — deben coincidir con el filtro del Catálogo */}
                        <select
                            className={`form-select ${errors.seccion ? 'is-invalid' : ''}`}
                            {...register('seccion', { required: 'Seleccioná una sección.' })}
                        >
                            <option value="">Elegir sección...</option>
                            {SECCIONES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.seccion && <div className="invalid-feedback">{errors.seccion.message}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Precio (ARS) *</label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                            {...register('precio', {
                                required: 'El precio es obligatorio.',
                                min: { value: 0, message: 'El precio no puede ser negativo.' }
                            })}
                        />
                        {errors.precio && <div className="invalid-feedback">{errors.precio.message}</div>}
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Link externo (opcional)</label>
                        <input
                            type="url"
                            className={`form-control ${errors.link ? 'is-invalid' : ''}`}
                            placeholder="https://..."
                            {...register('link', {
                                pattern: {
                                    value: /^(https?:\/\/.+)?$/,
                                    message: 'Ingresá una URL válida o dejá el campo vacío.'
                                }
                            })}
                        />
                        {errors.link && <div className="invalid-feedback">{errors.link.message}</div>}
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

                    {/* Imagen actual + reemplazo opcional */}
                    <div className="col-12">
                        <label className="form-label">Imagen de portada</label>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            {imagenActual && (
                                <img
                                    src={`${API_URL}/uploads/${imagenActual}`}
                                    alt="Portada actual"
                                    style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }}
                                />
                            )}
                            <span className="text-muted small">
                                Si no elegís un archivo nuevo, se conserva la imagen actual.
                            </span>
                        </div>
                        {/* No marcamos como required — la imagen es opcional en el PATCH */}
                        <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            {...register('imagen')}
                        />
                        <div className="form-text small" style={{ color: '#888' }}>
                            Opcional. Al subir una nueva, la anterior se elimina del servidor.
                        </div>
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
                    <Link to="/admin/libros" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}
