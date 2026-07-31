/**
 * services/api.service.jsx
 *
 * Hook base para hacer peticiones a la API REST del back.
 * Centraliza la URL base, el header de autenticación y el manejo del 401.
 *
 * Todos los demás services (libros, generos, usuarios) usan este hook
 * en lugar de escribir fetch() directamente.
 *
 * Uso:
 *   const { call } = useApi();
 *   const data = await call('/libros');                  // GET público
 *   const data = await call('/libros', 'POST', formData); // POST protegido con FormData
 */

import { useNavigate } from 'react-router-dom';
import { useToken } from '../contexts/Session.context.jsx';


/**
 * Hook que devuelve la función call() lista para usar con el token del contexto.
 *
 * @returns {{ call: Function }}
 */
export function useApi() {
    const navigate = useNavigate();
    const token    = useToken();

    /**
     * call — Ejecuta un fetch a la API con autenticación automática.
     *
     * @param {string} uri    - Ruta relativa: "/libros", "/login", "/libros/abc123"
     * @param {string} method - Método HTTP: "GET", "POST", "PUT", "DELETE" (default GET)
     * @param {Object} body   - Datos a enviar en el body (solo para POST/PUT)
     * @returns {Promise<any>} El JSON de la respuesta si fue exitosa
     */
    const call = (uri, method = "GET", body) => {
        // Detectamos si el body es un FormData (archivo + campos de texto).
        // Con FormData, el navegador DEBE setear el Content-Type automáticamente porque incluye el "boundary" (separador entre campos).
        // Si nosotros seteamos "Content-Type: application/json" manualmente, el boundary no aparece y el back (multer) no puede parsear los campos.
        const esFormData = body instanceof FormData

        return fetch("http://localhost:3333/api" + uri, {
            method: method,
            headers: {
                // Si es FormData → sin Content-Type (el browser lo pone solo con el boundary)
                // Si es JSON     → lo seteamos manualmente como siempre
                ...(esFormData ? {} : { "Content-Type": "application/json" }),
                "Authorization": `Bearer ${token}`
            },
            // FormData no se puede JSON.stringify: se envía directamente.
            // undefined (GET sin body) → fetch lo ignora automáticamente.
            body: esFormData ? body : JSON.stringify(body)
        })
            .then(async res => {
                if (res.ok) return res.json()
                if (res.status == 401) navigate("/login")
                try { return await res.json() }
                catch { throw new Error("Error en la llamada a la API") }
            })
    }

    return { call }

}
