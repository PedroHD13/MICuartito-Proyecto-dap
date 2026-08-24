import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nombre AS name, username, rol AS role
       FROM usuarios
       ORDER BY id ASC`
    );
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}