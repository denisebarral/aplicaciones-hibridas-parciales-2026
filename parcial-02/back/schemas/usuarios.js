/**
 * schemas/usuarios.js
 *
 * Esquemas de validación Yup para el recurso "usuarios".
 * Se usan en los middlewares usuarios.validate.js para validar
 * el body de las peticiones antes de que lleguen al controller.
 *
 * Yup permite definir reglas de validación encadenadas y devuelve
 * mensajes de error en español, listos para mostrar al cliente.
 */

import * as yup from 'yup';

/**
 * Schema para el login.
 * Solo valida formato de email y que el password esté presente.
 * No valida fortaleza porque ya fue validada al registrarse.
 */
export const loginSchema = yup.object({
    email:    yup.string().email('Email inválido').required('El email es requerido'),
    password: yup.string().required('La contraseña es requerida')
});

/**
 * Schema para el registro.
 * Valida email, contraseña con fortaleza mínima y confirmación.
 *
 * Las reglas de contraseña exigen:
 *   - Al menos 8 caracteres
 *   - Al menos una mayúscula
 *   - Al menos una minúscula
 *   - Al menos un número
 *   - Al menos un símbolo (cualquier char que no sea letra o número)
 */
export const registerSchema = yup.object({
    email: yup.string()
        .email('Email inválido')
        .required('El email es requerido'),

    password: yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .matches(/[a-z]/, 'Debe contener al menos una minúscula')
        .matches(/[0-9]/, 'Debe contener al menos un número')
        .matches(/[^A-Za-z0-9]/, 'Debe contener al menos un símbolo')
        .required('La contraseña es requerida'),

    // yup.ref('password') referencia al campo 'password' del mismo objeto de validación
    // oneOf([ref('password')]) valida que passwordConfirm sea idéntico a password
    passwordConfirm: yup.string()
        .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
        .required('La confirmación de contraseña es requerida')
});
