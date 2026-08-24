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
              p.ocupacion, p.presupuesto, p.zonas_preferidas,
              p.notif_nuevos_interesados, p.notif_mensajes, p.notif_ofertas,
              p.notif_nuevos_cuartos, p.notif_cambios_precio
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
          : '1995-06-15',
        bio: row.bio || 'Estudiante universitario, responsable y ordenado. Busco un cuarto tranquilo cerca de la universidad.',
        avatar: row.avatar || row.nombre.charAt(0).toUpperCase(),
        occupation: row.ocupacion || 'Estudiante',
        budget: row.presupuesto ? Number(row.presupuesto) : 800,
        zones: row.zonas_preferidas && row.zonas_preferidas.length > 0 ? row.zonas_preferidas : ['norte'],
      },
      notifPrefs: {
        newInterested: row.notif_nuevos_interesados,
        messages: row.notif_mensajes,
        promos: row.notif_ofertas,
        newRooms: row.notif_nuevos_cuartos,
        priceDrops: row.notif_cambios_precio,
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

    if (body.name !== undefined) {
      await pool.query('UPDATE usuarios SET nombre = $1 WHERE id = $2', [body.name, usuarioId]);
    }

    const fieldMap: Record<string, string> = {
      email: 'email',
      phone: 'telefono',
      birthdate: 'fecha_nacimiento',
      bio: 'bio',
      avatar: 'avatar',
      occupation: 'ocupacion',
      budget: 'presupuesto',
      zones: 'zonas_preferidas',
      newInterested: 'notif_nuevos_interesados',
      messages: 'notif_mensajes',
      promos: 'notif_ofertas',
      newRooms: 'notif_nuevos_cuartos',
      priceDrops: 'notif_cambios_precio',
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