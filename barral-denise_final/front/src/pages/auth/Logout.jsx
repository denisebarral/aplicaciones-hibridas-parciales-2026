/**
 * pages/auth/Logout.jsx
 *
 * Componente de cierre de sesión.
 * No renderiza ninguna UI — ejecuta la limpieza de sesión al montarse
 * y redirige inmediatamente al login.
 *
 * Funciona así: el usuario hace click en "Cerrar sesión" en el NavBar,
 * React Router renderiza este componente, el useEffect dispara onLogout()
 * (que limpia el contexto y el localStorage) y <Navigate> lo manda al login.
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLogout } from '../../contexts/Session.context.jsx';

export default function Logout() {
    const onLogout = useLogout();

    // useEffect con array vacío [] = se ejecuta UNA SOLA VEZ al montar el componente
    // Limpia token y email del contexto y del localStorage antes de redirigir
    useEffect(() => {
        onLogout();
    }, []);

    // Navigate redirige inmediatamente — el componente nunca muestra nada en pantalla
    // replace: true evita que el usuario pueda volver a /logout con el botón "Atrás"
    return <Navigate to="/login" replace />;
}
