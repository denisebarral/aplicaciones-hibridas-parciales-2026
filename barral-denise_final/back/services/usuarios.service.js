/**
 * usuarios.service.js
 *
 * Capa de servicios para la colección "usuarios".
 * Gestiona registro y login con contraseñas hasheadas con bcrypt.
 * No sabe nada de HTTP: no usa req, res ni Express.
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { createToken } from './token.service.js';

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);

// Instanciamos el cliente de Google con nuestro Client ID (debe coincidir con el que usamos en el front) para que verifyIdToken() pueda validar la firma de los ID Tokens que nos envíe el frontend.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        // También cubre el caso de usuarios creados vía Google: no tienen password
        // (usuario.password es null), así que bcrypt.compare ni se debe intentar.
        if (!usuario || !usuario.password) throw new Error('Usuario o contraseña incorrectos');

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

/**
 * Autentica (o registra, si es la primera vez) a un usuario mediante Google.
 *
 * A diferencia de login()/createUser(), acá NO confiamos en nada que mande el
 * frontend: el frontend solo nos pasa el "credential" (el ID Token que genera
 * el botón de Google), y es ESTA función la que lo verifica contra los
 * servidores de Google antes de usar el email que contiene.
 *
 * ¿Por qué hace falta verificarlo en el back y no alcanza con decodificarlo
 * en el front? Porque decodificar un JWT (jwtDecode) solo lee su contenido,
 * no comprueba que la firma sea válida. Cualquiera podría armar a mano un
 * token con forma de JWT y el email que quisiera. verifyIdToken() sí valida
 * la firma criptográfica contra las claves públicas de Google, que el token
 * no esté vencido, y que el "audience" (aud) coincida con nuestro
 * GOOGLE_CLIENT_ID (para evitar que nos cuelen un token emitido para otra app).
 *
 * Flujo:
 * 1. Verifica el credential con Google → obtiene el payload YA confiable.
 * 2. Busca un usuario con ese email.
 * 3. Si no existe, lo crea sin password (password: null, authProvider: 'google').
 *    Si ya existe (se haya registrado con password o con Google antes), lo deja pasar:
 *    confiamos en que Google ya probó que es el dueño de ese email.
 * 4. Genera el mismo tipo de JWT que genera login(), para que el resto de la
 *    app (Session.context, ProtectedRoute, etc.) no tenga que enterarse de
 *    que el usuario entró por Google.
 *
 * @param {Object} datos - { credential } — el ID Token crudo que manda el botón de Google.
 * @returns {Promise<Object>} { email, token }
 * @throws {Error} Si el token de Google es inválido/vencido/de otra app.
 */
export async function loginConGoogle(datos) {
    try {
        // 1- Verificamos el ID Token con Google: si no es válido, verifyIdToken() lanza error.
        const ticket = await googleClient.verifyIdToken({
            idToken: datos.credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // 2- Obtenemos el payload confiable que nos da Google (ya validado y decodificado)
        // Tanto verifyIdToken() como getPayload() son funciones de google-auth-library, no de JWT ni de bcrypt.
        const payload = ticket.getPayload();
        const email = payload.email;

        await client.connect();

        // 3- Buscamos un usuario con ese email en la BD.
        let usuario = await db.collection('usuarios').findOne({ email });
        // 4- Si no existe, lo creamos sin password (password: null) y con authProvider: 'google'.
        if (!usuario) {
            // Primera vez que este email entra: lo damos de alta sin password.
            // authProvider: 'google' deja registro de que esta cuenta no tiene
            // contraseña propia.
            const insertResult = await db.collection('usuarios').insertOne({
                email,
                password: null,
                authProvider: 'google'
            });
            usuario = { _id: insertResult.insertedId, email };
        }

        // 5- Generamos el mismo tipo de JWT que genera login(), para que el resto de la app (Session.context, ProtectedRoute, etc.) no tenga que enterarse de que el usuario entró por Google. 
        const token = createToken({ email: usuario.email });

        // 6- Devolvemos el email y el token al frontend, que lo guardará en localStorage y actualizará el contexto de sesión.
        return { email: usuario.email, token };
    } catch (error) {
        throw new Error(error.message);
    }
}
