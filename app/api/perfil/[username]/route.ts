import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    const result = await pool.query(
      `SELECT u.nombre, p.email, p.telefono, p.fecha_nacimiento, p.bio, p.avatar,
              p.notif_nuevos_interesados, p.notif_mensajes, p.notif_ofertas
       FROM usuarios u
       JOIN perfiles p ON p.usuario_id = u.id
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Perfil no encontrado.' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      profile: {
        name: row.nombre,
        email: row.email || 'correo@ejemplo.com',
        phone: row.telefono || '+591 71234567',
        birthdate: row.fecha_nacimiento
          ? row.fecha_nacimiento.toISOString().split('T')[0]
          : '1990-01-01',
        bio: row.bio || 'Propietario con experiencia en alquiler de cuartos. Busco inquilinos responsables y respetuosos.',
        avatar: row.avatar || row.nombre.charAt(0).toUpperCase(),
      },
      notifPrefs: {
        newInterested: row.notif_nuevos_interesados,
        messages: row.notif_mensajes,
        promos: row.notif_ofertas,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const body = await request.json();

    const userResult = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const usuarioId = userResult.rows[0].id;

    // El nombre vive en "usuarios", no en "perfiles"
    if (body.name !== undefined) {
      await pool.query('UPDATE usuarios SET nombre = $1 WHERE id = $2', [body.name, usuarioId]);
    }

    const fieldMap: Record<string, string> = {
      email: 'email',
      phone: 'telefono',
      birthdate: 'fecha_nacimiento',
      bio: 'bio',
      avatar: 'avatar',
      newInterested: 'notif_nuevos_interesados',
      messages: 'notif_mensajes',
      promos: 'notif_ofertas',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const key of Object.keys(body)) {
      if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key]} = $${i}`);
        values.push(body[key]);
        i++;
      }
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = NOW()');
      values.push(usuarioId);
      await pool.query(
        `UPDATE perfiles SET ${setClauses.join(', ')} WHERE usuario_id = $${i}`,
        values
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}