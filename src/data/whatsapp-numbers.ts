'use server';

// This file now only contains the type definition and the mock data source.
// All the logic for manipulating this data is now handled via API routes.
// This better simulates a real-world scenario where the frontend doesn't
// have direct access to the backend's database or data manipulation logic.

export type WhatsAppNumber = {
  id: string; // Will be the phone number
  docId: string; // Simulates a Firestore document ID
  name: string; // A custom name for the number, e.g., "Vendas Varejo"
  status: 'online' | 'offline' | 'expired' | 'pending';
  lastPairedAt: string; // ISO Date string
  pairedBy: string; // Name of the admin who paired it
};

let mockWhatsAppNumbers: WhatsAppNumber[] = [
  {
    id: '+5511912345678',
    docId: 'mock-wa-1',
    name: 'Vendas Varejo',
    status: 'online',
    lastPairedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    pairedBy: 'Admin Developer',
  },
  {
    id: '+5521987654321',
    docId: 'mock-wa-2',
    name: 'Suporte Técnico',
    status: 'offline',
    lastPairedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    pairedBy: 'Admin Developer',
  },
  {
    id: '+5531999998888',
    docId: 'mock-wa-3',
    name: 'Marketing',
    status: 'expired',
    lastPairedAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    pairedBy: 'Admin Developer',
  },
];

// --- Internal Data Access Functions (not for client-side use) ---

export const getWhatsAppNumbers = async (): Promise<WhatsAppNumber[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency
    return JSON.parse(JSON.stringify(mockWhatsAppNumbers)); // Return a copy
};

export const updateWhatsAppNumberStatus = async (id: string, status: WhatsAppNumber['status']): Promise<boolean> => {
    const number = mockWhatsAppNumbers.find(n => n.id === id);
    if (number) {
        number.status = status;
        if(status === 'online') {
            number.lastPairedAt = new Date().toISOString();
        }
        console.log(`[Mock DB] Status for ${id} changed to ${status}.`);
        return true;
    }
    return false;
}

export const addWhatsAppNumber = async (newNumber: Omit<WhatsAppNumber, 'docId'>): Promise<WhatsAppNumber | null> => {
    if (mockWhatsAppNumbers.some(n => n.id === newNumber.id)) {
        return null; // Number already exists
    }
    const newEntry = { ...newNumber, docId: `mock-wa-${Date.now()}` };
    mockWhatsAppNumbers.push(newEntry);
    console.log(`[Mock DB] Added new number ${newNumber.id}.`);
    return newEntry;
}

export const deleteWhatsAppNumber = async (id: string): Promise<boolean> => {
    const index = mockWhatsAppNumbers.findIndex(n => n.id === id);
    if (index > -1) {
        mockWhatsAppNumbers.splice(index, 1);
        console.log(`[Mock DB] Deleted number ${id}.`);
        return true;
    }
    return false;
}
