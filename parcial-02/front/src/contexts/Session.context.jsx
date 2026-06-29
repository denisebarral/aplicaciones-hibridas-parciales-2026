/**
 * Session.context.jsx — Contexto global de sesión del usuario.
 *
 * ¿Qué es un Contexto de React?
 * Es un mecanismo para compartir datos entre componentes sin tener que pasarlos
 * manualmente como props de padre a hijo a nieto (lo que se llama "prop drilling").
 * Funciona como una "variable global controlada": cualquier componente que esté
 * dentro del Provider puede leer y modificar esos datos.
 *
 * ¿Qué problema resuelve acá?
 * La sesión (token + email) se necesita en múltiples componentes:
 *   - NavBar la necesita para mostrar "Ingresar" o "Panel / Cerrar sesión"
 *   - api.service la necesita para enviar el token en el header Authorization
 *   - Logout la necesita para limpiarla
 *   - Login la necesita para guardarla
 * Sin Context, habría que pasar props por todos los niveles del árbol de componentes.
 *
 * ¿Cómo funciona?
 *   1. createContext() crea el "canal" de comunicación.
 *   2. SessionProvider envuelve la app y pone los datos en el canal.
 *   3. Cualquier componente usa useSession() (o los hooks específicos) para leerlos.
 */

import { createContext, useContext, useState } from "react";

// createContext() crea el objeto contexto.
// El valor que se le pasa es el valor por defecto si no hay ningún Provider en el árbol
// (situación que no debería ocurrir, pero es buena práctica declararlo).
// Lo exportamos para poder usar Session.Provider en SessionProvider abajo.
export const Session = createContext()

// Hook genérico: devuelve todo el objeto del contexto ({ email, token, onLogin, onLogout }).
// No se suele usar directamente — se prefieren los hooks específicos de abajo.
export function useSession() {
    return useContext(Session)
}

// Hooks específicos: cada uno extrae una sola propiedad del contexto.
// Simplifican el código en los componentes: en vez de escribir
//   const { email } = useContext(Session)
// se escribe simplemente:
//   const email = useEmail()

// Devuelve el email del usuario logueado (o null si no hay sesión activa)
export function useEmail() {
    const { email } = useSession()
    return email
}

// Devuelve la función onLogin para iniciar sesión desde cualquier componente
export function useLogin() {
    const { onLogin } = useSession()
    return onLogin
}

// Devuelve la función onLogout para cerrar sesión desde cualquier componente
export function useLogout() {
    const { onLogout } = useSession()
    return onLogout
}

// Devuelve el token JWT actual (o null si no hay sesión)
// Lo usa api.service.jsx para incluirlo en el header Authorization de cada fetch
export function useToken() {
    const { token } = useSession()
    return token
}

/**
 * SessionProvider — Componente que envuelve la app y provee el contexto de sesión.
 *
 * Se coloca en main.jsx rodeando al RouterProvider para que TODOS los componentes
 * de la app puedan acceder al contexto.
 *
 * Guarda el estado en dos lugares en paralelo:
 *   - useState → para que React re-renderice cuando cambie (ej: NavBar actualiza el link)
 *   - localStorage → para que la sesión sobreviva a recargar la página
 *
 * Props:
 *   children → todo el árbol de componentes que puede acceder al contexto
 */
export function SessionProvider({ children }) {

    // Inicializa el email y el token desde localStorage al cargar la app.
    // localStorage solo guarda strings, y ambos valores ya son strings,
    // así que se guardan y leen directamente sin JSON.stringify/parse.
    // Si no hay nada guardado, localStorage.getItem devuelve null → el estado arranca en null.
    const [email, setEmail] = useState( localStorage.getItem("email") )
    const [token, setToken] = useState( localStorage.getItem("token") )

    // onLogin: se llama cuando el login es exitoso (desde Login.jsx).
    // Recibe el jwt (token) y el email del usuario autenticado.
    // Guarda ambos en localStorage (para persistir al recargar) Y en el estado (para re-renderizar).
    const onLogin = (jwt, email) => {
        // Guardamos strings directamente — no necesitamos JSON.stringify porque no son objetos
        localStorage.setItem("email", email)
        localStorage.setItem("token", jwt)
        setEmail(email)   // actualiza el estado → React re-renderiza NavBar, ProtectedRoute, etc.
        setToken(jwt)
    }

    // onLogout: limpia todo.
    // localStorage.clear() borra TODAS las claves del storage (no solo email y token).
    // En este proyecto no guardamos nada más en localStorage, por eso es seguro usarlo.
    const onLogout = () => {
        localStorage.clear()
        setEmail(null)
        setToken(null)
    }

    // Session.Provider envuelve los children y les inyecta el objeto value.
    // Cualquier componente hijo que use useSession() (o los hooks específicos) recibe este objeto.
    return (
        <Session.Provider value={{ email, token, onLogin, onLogout }}>
            {children}
        </Session.Provider>
    )
}
