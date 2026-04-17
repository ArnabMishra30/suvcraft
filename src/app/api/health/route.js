import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query('SELECT 1 AS ok');
    return NextResponse.json({ status: 'ok', db: rows[0] });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}