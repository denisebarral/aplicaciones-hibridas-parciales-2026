/**
 * pages/admin/NuevoLibro.jsx
 *
 * Formulario para crear un nuevo libro en el catálogo.
 * Usa React Hook Form para validar en el front antes de enviar al back.
 * La imagen es obligatoria al crear (el libro debe tener portada).
 *
 * El back recibe los datos como FormData (por la imagen), no como JSON.
 * La conversión la hace buildFormData() en libros.service.jsx.
 *
 * Ruta protegida — solo accesible con sesión activa.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useLibrosService } from '../../services/libros.service.jsx';

// Valores exactos de la BD — deben coincidir para que el filtro del Catálogo funcione
const SECCIONES = ['cronica', 'poesia', 'ensayo', 'cuentos', 'narrativa'];

// Géneros con acentos tal como están guardados en MongoDB
const GENEROS = ['crónica', 'poesía', 'ensayo', 'cuentos', 'novela'];

export default function NuevoLibro() {
    const navigate = useNavigate();
    const { crearLibro } = useLibrosService();
    const [apiError, setApiError] = useState('');

    // React Hook Form — register() conecta inputs con el form, handleSubmit() valida y llama a onSubmit()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    async function onSubmit(datos) {
        setApiError('');
        const respuesta = await crearLibro(datos);
        // Si la respuesta tiene _id o insertedId, asumimos que fue exitosa
        if (respuesta?._id || respuesta?.insertedId) {
            // Pasamos el mensaje como state de la ruta — Admin.jsx lo lee con useLocation()
            navigate('/admin', { state: { mensaje: 'Libro creado con éxito.' } });
        // Si la respuesta tiene errores, los mostramos en un alert
        } else {
            //  Si vienen errores del back, los unimos con " · " para mostrarlos todos en un solo alert.
            const msg = respuesta?.errores?.join(' · ') || respuesta?.mensaje || 'Error al crear el libro.';
            setApiError(msg);
        }
    }

    return (
        <div className="container py-5" style={{ maxWidth: 700 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link to="/admin" className="btn btn-outline-secondary btn-sm">← Volver</Link>
                <h2 className="serif mb-0">Nuevo libro</h2>
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
                            placeholder="1963"
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
                            placeholder="4200"
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
                                    value: /^https?:\/\/.+/,
                                    message: 'Ingresá una URL válida (https://...).'
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

                    <div className="col-12">
                        <label className="form-label">Imagen de portada *</label>
                        {/* input type="file": el navegador devuelve un FileList
                            multer lo espera como el campo "imagen" en el FormData */}
                        <input
                            type="file"
                            accept="image/*"
                            className={`form-control ${errors.imagen ? 'is-invalid' : ''}`}
                            {...register('imagen', {
                                required: 'La imagen de portada es obligatoria.',
                                validate: {
                                    // Comprobamos que el FileList tenga al menos un archivo
                                    tieneArchivo: files => files?.length > 0 || 'Seleccioná una imagen.'
                                }
                            })}
                        />
                        <div className="form-text small" style={{ color: '#888' }}>
                            El back convierte automáticamente la imagen a .webp 500px.
                        </div>
                        {errors.imagen && <div className="invalid-feedback">{errors.imagen.message}</div>}
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
                        {isSubmitting ? 'Guardando...' : 'Crear libro'}
                    </button>
                    <Link to="/admin" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}

/*
 * ─────────────────────────────────────────────────────────────────────
 * NOTA PARA MEJORAR:¿De dónde deberían venir SECCIONES y GENEROS?
 * ─────────────────────────────────────────────────────────────────────
 *
 * El problema con hardcodear estos arrays en el front es que si mañana el back acepta una sección nueva (por ejemplo, "teatro"), hay que acordarse de actualizar el front también. Son dos lugares para mantener sincronizados, y eso es una fuente de bugs.
 *
 * La solución: que el back sea la única fuente de verdad.
 *
 * ¿DÓNDE VIVIRÍA ESA LÓGICA EN EL BACK?
 * ────────────────────────────────────────
 * Opción A — Constantes en el back (lo más simple):
 *   Crear un archivo back/config/opciones.js que exporte los arrays:
 *
 *     export const SECCIONES = ['cronica', 'poesia', 'ensayo', 'cuentos', 'narrativa'];
 *     export const GENEROS   = ['crónica', 'poesía', 'ensayo', 'cuentos', 'novela'];
 *
 *   Y un endpoint que los sirva:
 *     GET /api/libros/opciones → { secciones: [...], generos: [...] }
 *
 *   Ventaja: simple. Desventaja: sigue siendo hardcoded, solo que en un solo lugar.
 *
 * Opción B — Derivarlos de la BD con distinct() (lo más dinámico):
 *   MongoDB tiene un método distinct() que devuelve todos los valores únicos de un campo en una colección. Equivalente en SQL a: SELECT DISTINCT seccion FROM libros.
 *
 *  En libros.service.js:
 *
 *     export async function obtenerOpciones() {
 *         await client.connect();
 *         const secciones = await db.collection('libros').distinct('seccion');
 *         const generos   = await db.collection('libros').distinct('genero');
 *         return { secciones, generos };
 *     }
 *
 *   Y el endpoint:
 *     GET /api/libros/opciones → { secciones: ['cronica', 'narrativa', ...], generos: [...] }
 *
 *   Ventaja: si la BD tiene un valor nuevo, el select del front lo muestra solo.
 *   Desventaja: si la colección está vacía, no devuelve nada (no hay valores para derivar).
 *
 * ¿CÓMO LO CONSUMIRÍA EL FRONT?
 * ───────────────────────────────
 * En NuevoLibro.jsx y EditarLibro.jsx, en lugar de los arrays hardcodeados, haría un fetch al montar el componente:
 *
 *   const [opciones, setOpciones] = useState({ secciones: [], generos: [] });
 *
 *   useEffect(() => {
 *       call('/libros/opciones').then(data => setOpciones(data));
 *   }, []);
 *
 * Y en el JSX, en lugar de SECCIONES.map(...) usaría opciones.secciones.map(...)
 *
 * ¿EN QUÉ ARCHIVO DEL FRONT IRÍA ESE FETCH?
 * ───────────────────────────────────────────
 * En libros.service.jsx, como una función más del hook useLibrosService():
 *
 *   function getOpciones() {
 *       return call('/libros/opciones');
 *   }
 *
 * Y se exportaría junto con getLibros, crearLibro, actualizarLibro, etc.
 * ─────────────────────────────────────────────────────────────────────
 */
