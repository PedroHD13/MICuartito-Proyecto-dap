import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

const ZONA_LABELS: Record<string, string> = {
  norte: 'Zona Norte',
  sur: 'Zona Sur',
  este: 'Zona Este',
  oeste: 'Zona Oeste',
  centro: 'Centro',
};

const PLACEHOLDER_IMG = 'https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    if (!username) return NextResponse.json({ error: 'Falta username.' }, { status: 400 });

    const userResult = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return NextResponse.json({ favoriteIds: [], rooms: [] });
    const usuarioId = userResult.rows[0].id;

    const favResult = await pool.query(
      `SELECT f.cuarto_id, f.created_at AS added_date, c.*
       FROM favoritos f
       JOIN cuartos c ON c.id = f.cuarto_id
       WHERE f.usuario_id = $1
       ORDER BY f.created_at DESC`,
      [usuarioId]
    );

    const cuartos = favResult.rows;
    if (cuartos.length === 0) return NextResponse.json({ favoriteIds: [], rooms: [] });

    const ids = cuartos.map((c) => c.id);
    const imagenesResult = await pool.query(
      `SELECT cuarto_id, url FROM cuarto_imagenes WHERE cuarto_id = ANY($1) ORDER BY orden ASC`,
      [ids]
    );
    const imagenesPorCuarto: Record<number, string[]> = {};
    for (const img of imagenesResult.rows) {
      if (!imagenesPorCuarto[img.cuarto_id]) imagenesPorCuarto[img.cuarto_id] = [];
      imagenesPorCuarto[img.cuarto_id].push(img.url);
    }

    const rooms = cuartos.map((c) => {
      const zonaLabel = ZONA_LABELS[c.zona] || c.zona;
      const location = c.barrio ? `${zonaLabel}, ${c.barrio}` : zonaLabel;
      const fotos = imagenesPorCuarto[c.id] || [];
      return {
        id: c.id,
        title: c.titulo,
        location,
        price: Number(c.precio),
        type: c.tipo === 'compartida' ? 'Compartida' : 'Privada',
        bathroom: c.bano,
        furnished: c.servicios?.includes('muebles') || false,
        capacity: parseInt(c.capacidad) || 1,
        services: c.servicios || [],
        image: fotos[0] || PLACEHOLDER_IMG,
        images: fotos,
        active: c.activo,
        views: c.vistas,
        createdAt: c.created_at,
        addedDate: c.added_date,
      };
    });

    return NextResponse.json({ favoriteIds: ids, rooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, cuartoId } = await request.json();
    const userResult = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    const usuarioId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO favoritos (usuario_id, cuarto_id) VALUES ($1, $2)
       ON CONFLICT (usuario_id, cuarto_id) DO NOTHING`,
      [usuarioId, cuartoId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const cuartoId = searchParams.get('cuartoId');
    if (!username || !cuartoId) return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });

    const userResult = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    const usuarioId = userResult.rows[0].id;

    await pool.query('DELETE FROM favoritos WHERE usuario_id = $1 AND cuarto_id = $2', [usuarioId, cuartoId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}