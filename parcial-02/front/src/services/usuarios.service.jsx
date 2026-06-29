/**
 * services/usuarios.service.jsx
 *
 * Hook con funciones para registrar e iniciar sesión.
 * Usa useApi() para el fetch (sin token, porque son rutas de entrada al sistema).
 *
 * Endpoints que consume:
 *   POST /api/       → registro (validateRegister + createUser)
 *   POST /api/login  → login (validateLogin + login) → devuelve { email, token }
 */

import { useApi } from './api.service.jsx';

/**
 * Hook que expone las operaciones de autenticación.
 *
 * @returns {{ registrar, login }}
 */
export function useUsuariosService() {
    const { call } = useApi();

    /**
     * Registra un nuevo usuario (empleado).
     * Envía email, password y passwordConfirm al back para validar y crear el usuario.
     *
     * @param {{ email: string, password: string, passwordConfirm: string }} datos
     * @returns {Promise<Object>} { mensaje, resultado } o { mensaje, errores }
     */
    const registrar = (datos) => call('/', 'POST', datos);

    /**
     * Inicia sesión y devuelve el token JWT.
     *
     * @param {{ email: string, password: string }} datos
     * @returns {Promise<{ email: string, token: string }>} o { mensaje } si falló
     */
    const login = (datos) => call('/login', 'POST', datos);

    return { registrar, login };
}
