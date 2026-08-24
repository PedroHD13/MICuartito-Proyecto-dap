import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 el cambio clave
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