// src/app/api/whatsapp/numbers/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { updateWhatsAppNumberStatus, WhatsAppNumber } from '@/data/whatsapp-numbers';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json() as { status: WhatsAppNumber['status'] };
  
  if (!body.status || !['online', 'offline', 'expired', 'pending'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
  }

  const success = await updateWhatsAppNumberStatus(id, body.status);

  if (success) {
    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Number not found' }, { status: 404 });
  }
}
