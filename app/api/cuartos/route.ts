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
    const ownerUsername = searchParams.get('owner');

    let query = `
      SELECT c.*, u.username AS owner_username
      FROM cuartos c
      JOIN usuarios u ON u.id = c.propietario_id
    `;
    const params: string[] = [];

    if (ownerUsername) {
      // "Mis Cuartos": todos los del propietario, activos o pausados
      query += ' WHERE u.username = $1';
      params.push(ownerUsername);
    } else {
      // "Buscar": solo los activos
      query += ' WHERE c.activo = true';
    }

    query += ' ORDER BY c.created_at DESC';

    const cuartosResult = await pool.query(query, params);
    const cuartos = cuartosResult.rows;

    if (cuartos.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

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
        ownerUsername: c.owner_username,
        tipoRaw: c.tipo,
        capacidadRaw: c.capacidad,
        reglas: c.reglas || '',
      };
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titulo,
      fotos,
      tipo,
      bano,
      capacidad,
      servicios,
      cercaDe,
      universidadCercana,
      precio,
      reglas,
      zona,
      barrio,
      disponibilidad,
      ownerUsername,
    } = body;

    // Buscar el id del propietario a partir de su username
    const ownerResult = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [ownerUsername]
    );

    if (ownerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Propietario no encontrado.' }, { status: 404 });
    }

    const propietarioId = ownerResult.rows[0].id;
    const esFecha = disponibilidad !== 'inmediata';

    const cuartoResult = await pool.query(
      `INSERT INTO cuartos
        (propietario_id, titulo, tipo, bano, capacidad, precio, zona, barrio,
         servicios, cerca_de, universidad_cercana, reglas, disponibilidad, fecha_disponible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        propietarioId,
        titulo,
        tipo,
        bano,
        capacidad,
        precio,
        zona,
        barrio || null,
        servicios || [],
        cercaDe || [],
        universidadCercana || null,
        reglas || null,
        esFecha ? 'fecha' : 'inmediata',
        esFecha ? disponibilidad : null,
      ]
    );

    const cuartoId = cuartoResult.rows[0].id;

    // Insertar las fotos (base64) en cuarto_imagenes
    if (fotos && fotos.length > 0) {
      for (let i = 0; i < fotos.length; i++) {
        await pool.query(
          'INSERT INTO cuarto_imagenes (cuarto_id, url, orden) VALUES ($1, $2, $3)',
          [cuartoId, fotos[i], i]
        );
      }
    }

    return NextResponse.json({ success: true, id: cuartoId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}