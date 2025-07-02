// This file now only contains the type definition.
// The data and logic have been moved to the separate backend service
// and are accessed via the Next.js API routes which act as a proxy.

export type WhatsAppNumber = {
  id: string; // Will be the phone number
  docId: string; // Simulates a Firestore document ID
  name: string; // A custom name for the number, e.g., "Vendas Varejo"
  status: 'online' | 'offline' | 'expired' | 'pending';
  lastPairedAt: string; // ISO Date string
  pairedBy: string; // Name of the admin who paired it
};
