import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const result = await pool.query(
      'SELECT id, nombre, username, password_hash, rol FROM usuarios WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        name: user.nombre,
        role: user.rol,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}