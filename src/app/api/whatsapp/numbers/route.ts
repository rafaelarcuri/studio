// src/app/api/whatsapp/numbers/route.ts
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.WHATSAPP_BACKEND_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/numbers`);
    if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API PROXY GET] Error:', error);
    return NextResponse.json({ error: 'Failed to connect to WhatsApp backend' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/numbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
     if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API PROXY POST] Error:', error);
    return NextResponse.json({ error: 'Failed to connect to WhatsApp backend' }, { status: 500 });
  }
}
