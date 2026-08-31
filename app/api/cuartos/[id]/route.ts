import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { getServerSession } from '../../../../lib/session';
async function checkCuartoAccess(id: string): Promise<NextResponse | null> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }
  if (session.role === 'admin') return null;

  const ownerCheck = await pool.query(
    `SELECT u.username FROM cuartos c JOIN usuarios u ON u.id = c.propietario_id WHERE c.id = $1`,
    [id]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Cuarto no encontrado.' }, { status: 404 });
  }
  if (session.role !== 'propietario' || ownerCheck.rows[0].username !== session.username) {
    return NextResponse.json({ error: 'No tenés permiso para modificar este cuarto.' }, { status: 403 });
  }
  return null;
}
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 el cambio clave
        const accessError = await checkCuartoAccess(id);
    if (accessError) return accessError;
    const body = await request.json();

    const allowedFields: Record<string, string> = {
      tipo: 'tipo',
      capacidad: 'capacidad',
      precio: 'precio',
      reglas: 'reglas',
      activo: 'activo',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const key of Object.keys(body)) {
      if (allowedFields[key]) {
        setClauses.push(`${allowedFields[key]} = $${i}`);
        values.push(body[key]);
        i++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'Nada para actualizar.' }, { status: 400 });
    }

    setClauses.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE cuartos SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Cuarto no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, cuarto: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 el cambio clave
        const accessError = await checkCuartoAccess(id);
    if (accessError) return accessError;
    const result = await pool.query('DELETE FROM cuartos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Cuarto no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await pool.query(
      `SELECT c.*, u.nombre AS owner_name, u.username AS owner_username,
              p.telefono AS owner_phone
       FROM cuartos c
       JOIN usuarios u ON u.id = c.propietario_id
       LEFT JOIN perfiles p ON p.usuario_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Cuarto no encontrado.' }, { status: 404 });
    }

  

    const c = result.rows[0];

    // Sumar una vista (fire-and-forget, no bloquea la respuesta)
    pool.query('UPDATE cuartos SET vistas = vistas + 1 WHERE id = $1', [id]).catch(console.error);

    const imagenesResult = await pool.query(
      'SELECT url FROM cuarto_imagenes WHERE cuarto_id = $1 ORDER BY orden ASC',
      [id]
    );
    const fotos = imagenesResult.rows.map((row) => row.url);

    const ZONA_LABELS: Record<string, string> = {
      norte: 'Zona Norte',
      sur: 'Zona Sur',
      este: 'Zona Este',
      oeste: 'Zona Oeste',
      centro: 'Centro',
    };
    const zonaLabel = ZONA_LABELS[c.zona] || c.zona;
    const location = c.barrio ? `${zonaLabel}, ${c.barrio}` : zonaLabel;

    return NextResponse.json({
      room: {
        id: c.id,
        title: c.titulo,
        location,
        price: Number(c.precio),
        type: c.tipo === 'compartida' ? 'Compartida' : 'Privada',
        bathroom: c.bano,
        capacity: c.capacidad,
        active: c.activo,
        services: c.servicios || [],
        cercaDe: c.cerca_de || [],
        universidadCercana: c.universidad_cercana,
        reglas: c.reglas,
        disponibilidad: c.disponibilidad === 'fecha' ? c.fecha_disponible : 'Inmediata',
        images: fotos.length > 0 ? fotos : ['https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto'],
        views: c.vistas + 1,
        owner: {
          name: c.owner_name,
          username: c.owner_username,
          phone: c.owner_phone || null,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}