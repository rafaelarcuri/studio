'use server';

import { db } from '@/lib/firebase';

export type SalesHistory = {
  day: number
  sales: number
}

export type MonthlySale = {
  month: string // "YYYY-MM-DD"
  sales: number
  target: number
}

export type SalesPerson = {
  id: number // Corresponds to the User ID
  docId: string; // Firestore document ID
  name: string
  avatar: string
  target: number // Meta Mensal
  quarterlyTarget: number // Meta Trimestral
  achieved: number
  margin: number
  inadimplencia: number
  positivations: {
    target: number
    achieved: number
  }
  newRegistrations: {
    target: number
    achieved: number
  }
  salesHistory: SalesHistory[]
  monthlySales: MonthlySale[]
}

const generateMockSalesData = (): SalesPerson[] => {
    const users = [
        { id: 1, name: 'Ana Beatriz', avatar: `https://i.pravatar.cc/150?u=1` },
        { id: 2, name: 'Carlos Silva', avatar: `https://i.pravatar.cc/150?u=2` },
        { id: 3, name: 'Daniela Costa', avatar: `https://i.pravatar.cc/150?u=3` },
        { id: 4, name: 'Eduardo Lima', avatar: `https://i.pravatar.cc/150?u=4` },
        { id: 5, name: 'Fernanda Souza', avatar: `https://i.pravatar.cc/150?u=5` },
        { id: 6, name: 'Gustavo Pereira', avatar: `https://i.pravatar.cc/150?u=6` },
        { id: 7, name: 'Helena Martins', avatar: `https://i.pravatar.cc/150?u=7` },
        { id: 8, name: 'Igor Almeida', avatar: `https://i.pravatar.cc/150?u=8` },
        { id: 9, name: 'Juliana Ribeiro', avatar: `https://i.pravatar.cc/150?u=9` },
        { id: 10, name: 'Lucas Ferreira', avatar: `https://i.pravatar.cc/150?u=10` },
    ];

    const generateSalesHistory = (): SalesHistory[] => {
        return Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            sales: Math.random() * 2000,
        }));
    };

    const generateMonthlySales = (target: number): { monthlySales: MonthlySale[], currentAchieved: number } => {
        const today = new Date();
        const sales = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.toISOString().slice(0, 7) + '-01';
            const monthTarget = target * (0.9 + Math.random() * 0.2);
            
            let salesValue;
            if (i === 0) {
                // Current month, partial sales
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                salesValue = monthTarget * (today.getDate() / daysInMonth) * (0.8 + Math.random() * 0.4);
            } else {
                // Past months, full sales
                salesValue = monthTarget * (0.8 + Math.random() * 0.4);
            }
            return { month, sales: salesValue, target: monthTarget };
        }).reverse(); // Most recent last

        return { monthlySales: sales, currentAchieved: sales[11].sales };
    };
    
    return users.map(user => {
        const target = 20000 + Math.random() * 15000;
        const { monthlySales, currentAchieved } = generateMonthlySales(target);

        return {
            id: user.id,
            docId: `mock-sales-${user.id}`,
            name: user.name,
            avatar: user.avatar,
            target: target,
            quarterlyTarget: target * 3,
            achieved: currentAchieved,
            margin: 12 + Math.random() * 8, // 12% to 20%
            inadimplencia: 2 + Math.random() * 5, // 2% to 7%
            positivations: {
                target: Math.floor(15 + Math.random() * 10),
                achieved: Math.floor(10 + Math.random() * 10),
            },
            newRegistrations: {
                target: Math.floor(8 + Math.random() * 5),
                achieved: Math.floor(4 + Math.random() * 5),
            },
            salesHistory: generateSalesHistory(),
            monthlySales: monthlySales
        } as SalesPerson;
    });
};

const mockSalesPeople: SalesPerson[] = generateMockSalesData();

export const getSalesData = async (): Promise<SalesPerson[]> => {
    if (!db) return mockSalesPeople;
    try {
        const snapshot = await db.collection('salesPeople').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as SalesPerson));
    } catch (error) {
        console.error("Error fetching sales data: ", error);
        return [];
    }
}

export const getSalesPersonById = async (id: number): Promise<SalesPerson | undefined> => {
    if (!db) return mockSalesPeople.find(p => p.id === id);
    try {
        const snapshot = await db.collection('salesPeople').where('id', '==', id).limit(1).get();
        if (snapshot.empty) return undefined;
        const doc = snapshot.docs[0];
        return { docId: doc.id, ...doc.data() } as SalesPerson;
    } catch (error) {
        console.error(`Error fetching salesperson with ID ${id}: `, error);
        return undefined;
    }
}

export const addSalesPerson = async (newPersonData: { 
    id: number; name: string; target: number; margin: number; 
    positivationsTarget: number; newRegistrationsTarget: number; avatar?: string 
}): Promise<string | null> => {
    if (!db) return null;
    const newPerson: Omit<SalesPerson, 'docId'> = {
        id: newPersonData.id,
        name: newPersonData.name,
        avatar: newPersonData.avatar || `https://placehold.co/100x100.png`,
        target: newPersonData.target,
        quarterlyTarget: newPersonData.target * 3,
        achieved: 0,
        margin: newPersonData.margin,
        inadimplencia: 0,
        positivations: {
            target: newPersonData.positivationsTarget,
            achieved: 0,
        },
        newRegistrations: {
            target: newPersonData.newRegistrationsTarget,
            achieved: 0,
        },
        salesHistory: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sales: 0 })),
        monthlySales: Array.from({ length: 12 }, (_, i) => {
            const today = new Date();
            const date = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
            return { month: date.toISOString().slice(0, 7) + '-01', sales: 0, target: Math.floor(newPersonData.target / 12) };
        }),
    };

    try {
        const docRef = await db.collection('salesPeople').add(newPerson);
        return docRef.id;
    } catch (error) {
        console.error("Error adding salesperson: ", error);
        return null;
    }
};

export const updateSalesPersonData = async (salesPersonId: number, updatedData: Partial<Omit<SalesPerson, 'id' | 'docId'>>): Promise<boolean> => {
    if (!db) return false;
    try {
        const snapshot = await db.collection('salesPeople').where('id', '==', salesPersonId).limit(1).get();
        if (snapshot.empty) return false;
        
        const docId = snapshot.docs[0].id;
        await db.collection('salesPeople').doc(docId).update(updatedData);
        return true;
    } catch (error) {
        console.error(`Error updating salesperson ${salesPersonId}: `, error);
        return false;
    }
};

export const bulkUpdateSalesTargets = async (updates: { salesPersonId: number; monthlyTarget: number; quarterlyTarget: number }[]): Promise<boolean> => {
    if (!db) return false;
    const batch = db.batch();
    try {
        for (const update of updates) {
            const snapshot = await db.collection('salesPeople').where('id', '==', update.salesPersonId).limit(1).get();
            if (!snapshot.empty) {
                const docId = snapshot.docs[0].id;
                const docRef = db.collection('salesPeople').doc(docId);
                batch.update(docRef, { 
                    target: update.monthlyTarget, 
                    quarterlyTarget: update.quarterlyTarget 
                });
            }
        }
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error bulk updating sales targets: ", error);
        return false;
    }
};
