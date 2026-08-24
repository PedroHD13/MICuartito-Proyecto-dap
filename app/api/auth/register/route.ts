import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { name, username, password, role } = await request.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'El usuario ya está registrado.' }, { status: 409 });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, username, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, username, rol`,
      [name, username, passwordHash, role]
    );

    // Crear su fila de perfil vacía también
    await pool.query(
      `INSERT INTO perfiles (usuario_id) VALUES ($1)`,
      [result.rows[0].id]
    );

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}