import { NextResponse } from 'next/server';

export function ok(data = {}, extra = {}) {
  return NextResponse.json({ error: false, message: 'success', data, ...extra });
}

export function fail(message = 'error', status = 400, extra = {}) {
  return NextResponse.json({ error: true, message, data: [], ...extra }, { status });
}