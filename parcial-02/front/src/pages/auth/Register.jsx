/**
 * pages/auth/Register.jsx
 *
 * Página de registro de nuevos empleados.
 * Valida el formulario con React Hook Form antes de enviarlo al back.
 * El back hace su propia validación con Yup (doble capa de seguridad).
 *
 * Campos: email, password (con requisitos de fortaleza), passwordConfirm.
 * Si el registro es exitoso, navega al login para que el usuario inicie sesión.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useUsuariosService } from '../../services/usuarios.service.jsx';

export default function Register() {
    const navigate = useNavigate();
    const { registrar } = useUsuariosService();
    const [apiError, setApiError]     = useState('');
    const [exito, setExito]           = useState(false);

    // Aquí usamos useForm para manejar el estado del formulario, la validación y los errores. 
    // u0seForm() es un hook que nos da varias funciones y objetos para trabajar con formularios de manera más sencilla. 
    const { register, // conecta cada <input> con RHF
            handleSubmit, // envuelve onSubmit: solo llama si el form es válido
            watch,  
            formState: { errors, isSubmitting } // contiene errores de validación y estado de validez del form
        } = useForm();

    // watch('password') observa el campo password en tiempo real
    // Lo necesitamos para la validación de passwordConfirm (que los dos coincidan)
    const password = watch('password');

    /**
     * Función que se ejecuta al enviar el formulario. Llama a registrar() del service y maneja la respuesta.
     * Si el registro es exitoso, muestra un mensaje y redirige al login después de 2 segundos.
     * Si hay errores, los muestra en pantalla.
     * @param {*} datos  
     */
    async function onSubmit(datos) {
        setApiError('');
        const respuesta = await registrar(datos);

        // Si la respuesta tiene resultado, significa que el registro fue exitoso
        if (respuesta?.resultado) {
            // Registro exitoso — mostramos mensaje y redirigimos al login después de 2 segundos para que el usuario vea el mensaje
            setExito(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            // El back puede devolver errores individuales en respuesta.errores (array de Yup) o un mensaje genérico en respuesta.mensaje
            const msg = respuesta?.errores?.join(' · ') || respuesta?.mensaje || 'Error al registrarse.';
            setApiError(msg);
        }
    }

    // Si el registro fue exitoso, mostramos un mensaje de éxito y redirigimos al login después de 2 segundos
    if (exito) return (
        <div className="container py-5 text-center" style={{ maxWidth: 460 }}>
            <div className="alert alert-success">
                ¡Cuenta creada con éxito! Redirigiendo al login...
            </div>
        </div>
    );

    return (
        <div className="container py-5" style={{ maxWidth: 460 }}>
            <div className="text-center mb-4">
                <h2 className="serif">Crear cuenta</h2>
                <p className="text-muted small">Solo para el equipo de Los 7 Locos</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="empleado@los7locos.com.ar"
                        {...register('email', {
                            required: 'El email es obligatorio.',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Ingresá un email válido.'
                            }
                        })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Mínimo 8 caracteres"
                        {...register('password', {
                            required: 'La contraseña es obligatoria.',
                            minLength: { value: 8, message: 'Mínimo 8 caracteres.' },
                            // El back (Yup) también valida esto, pero validamos acá para feedback inmediato
                            validate: {
                                mayuscula: v => /[A-Z]/.test(v) || 'Necesita al menos una mayúscula.',
                                minuscula: v => /[a-z]/.test(v) || 'Necesita al menos una minúscula.',
                                numero:    v => /[0-9]/.test(v) || 'Necesita al menos un número.',
                                simbolo:   v => /[!@#$%^&*]/.test(v) || 'Necesita al menos un símbolo (!@#$%^&*).'
                            }
                        })}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    <div className="form-text small" style={{ color: '#888' }}>
                        Debe tener mayúscula, minúscula, número y símbolo.
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Confirmar contraseña</label>
                    <input
                        type="password"
                        className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                        placeholder="Repetí la contraseña"
                        {...register('passwordConfirm', {
                            required: 'Confirmá tu contraseña.',
                            // validate compara con el valor actual del campo password (via watch)
                            validate: v => v === password || 'Las contraseñas no coinciden.'
                        })}
                    />
                    {errors.passwordConfirm && (
                        <div className="invalid-feedback">{errors.passwordConfirm.message}</div>
                    )}
                </div>

                {apiError && (
                    <div className="alert alert-danger py-2 small">{apiError}</div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                </button>
            </form>

            <p className="text-center text-muted small mt-4">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" style={{ color: 'var(--red)' }}>Iniciá sesión →</Link>
            </p>
        </div>
    );
}
