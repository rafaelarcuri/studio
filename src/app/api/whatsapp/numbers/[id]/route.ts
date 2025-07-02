// src/app/api/whatsapp/numbers/[id]/route.ts
import { NextResponse } from 'next/server';
import { deleteWhatsAppNumber } from '@/data/whatsapp-numbers';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const success = await deleteWhatsAppNumber(id);
  if (success) {
    return NextResponse.json({ message: 'Number deleted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Number not found' }, { status: 404 });
  }
}
