/**
 * pages/auth/Login.jsx
 *
 * Página de inicio de sesión para empleados.
 * Usa React Hook Form para validar los campos antes de enviar al back.
 * Si el login es exitoso, guarda el token y email en el contexto (Session.context)
 * y navega automáticamente al panel de admin.
 */

import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useUsuariosService } from '../../services/usuarios.service.jsx';
import { useLogin } from '../../contexts/Session.context.jsx';

export default function Login() {
    const navigate = useNavigate();
    const onLogin  = useLogin(); 
    const { login } = useUsuariosService();
    const [apiError, setApiError] = useState('');

    const { register, // register: conecta el input al formulario de RHF
            handleSubmit,  // handleSubmit: envuelve nuestra función y solo la ejecuta si pasa las validaciones de RHF
            formState: { errors, isSubmitting } // formState.errors: errores de validación campo a campo
        } = useForm();

    /**
     * Esta función se ejecuta cuando el usuario hace submit en el formulario.
     * Recibe los datos validados por RHF y llama al servicio de login.
     * Si el login es exitoso, guarda el token y email en el contexto y navega al panel de admin.
     * Si falla, muestra el mensaje de error que devuelve el back.
     * @param {*} datos 
     */
    async function onSubmit(datos) {
        setApiError('');
        const respuesta = await login(datos);
        // Si existe respuesta.token, el login fue exitoso. Guardamos token y email en el contexto y navegamos al panel de admin.
        if (respuesta?.token) {
            // El back devuelve { email, token } cuando el login es exitoso. Le paso esos datos al contexto para que los guarde en localStorage y los exponga a toda la app.
            onLogin(respuesta.token, respuesta.email);
            navigate('/admin');
            console.log('Login exitoso:', respuesta); 
        } else {
            // Usamos el mensaje que devuelve el back, o un genérico como fallback
            setApiError(respuesta?.mensaje || 'Error al iniciar sesión.');
        }
    }

    return (
        <div className="container py-5" style={{ maxWidth: 460 }}>
            <div className="text-center mb-4">
                <h2 className="serif">Backoffice de Los 7 Locos </h2>
                <p className="text-muted small">Acceso exclusivo para administradores</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Campo email */}
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    {/* register conecta el input a RHF — required activa validación del lado del cliente */}
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
                    {/* is-invalid + invalid-feedback: clases de Bootstrap para mostrar el error con estilo */}
                    {errors.email && (
                        <div className="invalid-feedback">{errors.email.message}</div>
                    )}
                </div>

                {/* Campo contraseña */}
                <div className="mb-4">
                    <label className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Tu contraseña"
                        {...register('password', {
                            required: 'La contraseña es obligatoria.'
                        })}
                    />
                    {errors.password && (
                        <div className="invalid-feedback">{errors.password.message}</div>
                    )}
                </div>

                {/* Error de la API (email no encontrado, contraseña incorrecta, etc.) */}
                {apiError && (
                    <div className="alert alert-danger py-2 small">{apiError}</div>
                )}

                {/* isSubmitting: RHF lo pone en true mientras nuestra función onSubmit está corriendo */}
                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>

            <p className="text-center text-muted small mt-4">
                ¿Aún no tenés cuenta?{' '}
                <Link to="/register" style={{ color: 'var(--red)' }}>Registrate →</Link>
            </p>
        </div>
    );
}
