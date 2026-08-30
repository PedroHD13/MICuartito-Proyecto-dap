import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM cuartos');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.id, c.titulo, c.tipo, c.precio, c.capacidad, c.zona, c.barrio,
              c.activo, c.vistas, c.created_at,
              u.nombre AS owner_name, u.username AS owner_username
       FROM cuartos c
       JOIN usuarios u ON u.id = c.propietario_id
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      cuartos: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}