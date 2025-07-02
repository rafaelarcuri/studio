'use server';

import { db } from '@/lib/firebase';

export type WhatsAppNumber = {
  id: string; // Will be the phone number
  docId: string; // Firestore document ID
  name: string; // A custom name for the number, e.g., "Vendas Varejo"
  status: 'online' | 'offline' | 'expired' | 'pending';
  lastPairedAt: string; // ISO Date string
  pairedBy: string; // Name of the admin who paired it
};

const mockWhatsAppNumbers: WhatsAppNumber[] = [
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

export const getWhatsAppNumbers = async (): Promise<WhatsAppNumber[]> => {
    // In a real app, this would fetch from Firestore
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockWhatsAppNumbers;
};

export const updateWhatsAppNumberStatus = async (id: string, status: WhatsAppNumber['status']): Promise<boolean> => {
    const number = mockWhatsAppNumbers.find(n => n.id === id);
    if (number) {
        number.status = status;
        if(status === 'online') {
            number.lastPairedAt = new Date().toISOString();
        }
        console.log(`[LOG] Status for ${id} changed to ${status}.`);
        return true;
    }
    return false;
}

export const addWhatsAppNumber = async (newNumber: Omit<WhatsAppNumber, 'docId'>): Promise<boolean> => {
    mockWhatsAppNumbers.push({ ...newNumber, docId: `mock-wa-${Date.now()}` });
    console.log(`[LOG] Added new number ${newNumber.id}.`);
    return true;
}

export const deleteWhatsAppNumber = async (id: string): Promise<boolean> => {
    const index = mockWhatsAppNumbers.findIndex(n => n.id === id);
    if (index > -1) {
        mockWhatsAppNumbers.splice(index, 1);
        console.log(`[LOG] Deleted number ${id}.`);
        return true;
    }
    return false;
}
