/**
 * usuarios.service.js
 *
 * Capa de servicios para la colección "usuarios".
 * Gestiona registro y login con contraseñas hasheadas con bcrypt.
 * No sabe nada de HTTP: no usa req, res ni Express.
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { createToken } from './token.service.js';

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

/**
 * Registra un nuevo usuario en la base de datos.
 * Hashea la contraseña con bcrypt antes de guardarla.
 * Lanza error si ya existe un usuario con ese email.
 *
 * @param {Object} datos - { email, password } (passwordConfirm ya fue validado por el middleware)
 * @returns {Promise<InsertOneResult>} Resultado de insertOne con el _id generado.
 * @throws {Error} Si el email ya está registrado.
 */
export async function createUser(datos) {
    try {
        await client.connect();

        // Verificamos duplicado antes de insertar para evitar colisión de emails
        const existe = await db.collection('usuarios').findOne({ email: datos.email });
        if (existe) throw new Error('El email ya está registrado');

        // bcrypt.hash(password, saltRounds): aplica el algoritmo de hashing N veces
        // saltRounds = 11: balance entre seguridad (más rounds = más difícil de romper) y velocidad
        // El "salt" es un valor aleatorio que bcrypt genera internamente para que
        // dos passwords iguales produzcan hashes distintos — evita ataques de rainbow tables
        const passwordHasheada = await bcrypt.hash(datos.password, 11);

        // Guardamos SOLO el hash — la contraseña en texto plano nunca toca la base de datos
        return db.collection('usuarios').insertOne({
            email: datos.email,
            password: passwordHasheada
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Autentica un usuario: verifica credenciales y genera un JWT si son válidas.
 *
 * Flujo:
 * 1. Busca el usuario por email en la BD.
 * 2. Compara la contraseña ingresada con el hash guardado usando bcrypt.compare().
 * 3. Si es válido, genera un JWT con el email como payload y lo devuelve.
 *
 * @param {Object} datos - { email, password }
 * @returns {Promise<Object>} { email, token } — sin exponer la contraseña ni el _id.
 * @throws {Error} Con mensaje genérico para no revelar si el email existe o no.
 */
export async function login(datos) {
    try {
        await client.connect();

        const usuario = await db.collection('usuarios').findOne({ email: datos.email });

        // Mensaje genérico: no le decimos al cliente si el email existe o no
        // (evita que un atacante use este endpoint para hacer "user enumeration")
        if (!usuario) throw new Error('Usuario o contraseña incorrectos');

        // bcrypt.compare() re-hashea la contraseña ingresada con el mismo salt que se usó para el hash guardado y compara. Devuelve true si coinciden, false si no.
        const passwordValida = await bcrypt.compare(datos.password, usuario.password);
        if (!passwordValida) throw new Error('Usuario o contraseña incorrectos');

        // Generamos el token con el email como payload
        // No incluimos la contraseña ni el _id en el token — solo lo necesario para identificar al usuario
        const token = createToken({ email: usuario.email });

        return { email: usuario.email, token };
    } catch (error) {
        throw new Error(error.message);
    }
}
