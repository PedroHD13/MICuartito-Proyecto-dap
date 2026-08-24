import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name, username, role } = await request.json();

    const result = await pool.query(
      `UPDATE usuarios SET nombre = $1, username = $2, rol = $3
       WHERE id = $4
       RETURNING id, nombre AS name, username, rol AS role`,
      [name, username, role, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese nombre de usuario ya existe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // ON DELETE CASCADE se encarga de perfiles, cuartos (y sus imágenes/favoritos), y favoritos propios
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}