// src/app/api/whatsapp/numbers/[id]/qr/route.ts
import { NextResponse } from 'next/server';

// This simulates generating a QR code for a given number ID.
// In a real implementation with whatsapp-web.js, this would trigger the library
// to generate a fresh QR code string for the frontend.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // We use the number ID in the placeholder URL to make it unique,
  // simulating a different QR code for each number.
  const qrCodeUrl = `https://placehold.co/256x256.png?text=QR+para+${encodeURIComponent(params.id)}`;
  
  return NextResponse.json({ qr: qrCodeUrl });
}
