// src/app/api/whatsapp/numbers/[id]/qr/route.ts
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.WHATSAPP_BACKEND_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/numbers/${params.id}/qr`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to WhatsApp backend' }, { status: 500 });
  }
}
