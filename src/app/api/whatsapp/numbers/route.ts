// src/app/api/whatsapp/numbers/route.ts
import { NextResponse } from 'next/server';
import { getWhatsAppNumbers, addWhatsAppNumber, WhatsAppNumber } from '@/data/whatsapp-numbers';

export async function GET() {
  const numbers = await getWhatsAppNumbers();
  return NextResponse.json(numbers);
}

export async function POST(request: Request) {
  const body = await request.json() as Omit<WhatsAppNumber, 'id' | 'docId' | 'status' | 'lastPairedAt' | 'pairedBy'> & { phone: string; pairedBy: string; };

  if (!body.name || !body.phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }

  const newEntry: Omit<WhatsAppNumber, 'docId'> = {
    id: body.phone,
    name: body.name,
    status: 'pending',
    lastPairedAt: new Date().toISOString(),
    pairedBy: body.pairedBy,
  };
  
  const addedNumber = await addWhatsAppNumber(newEntry);

  if (addedNumber) {
    return NextResponse.json(addedNumber, { status: 201 });
  } else {
    return NextResponse.json({ error: 'Failed to add number' }, { status: 500 });
  }
}
