'use server';

import { db } from '@/lib/firebase';

export type CustomerSale = {
    id: number;
    name: string;
    value: number;
    salesPersonId: number;
    docId: string; // Firestore document ID
}

export const getCustomerSalesData = async (): Promise<CustomerSale[]> => {
    try {
        const snapshot = await db.collection('customerSales').get();
        if (snapshot.empty) {
            console.log('No matching documents in "customerSales" collection.');
            return [];
        }
        const data: CustomerSale[] = [];
        snapshot.forEach(doc => {
            data.push({ docId: doc.id, ...doc.data() } as CustomerSale);
        });
        return data;
    } catch (error) {
        console.error("Error fetching customer sales data: ", error);
        return [];
    }
}

export const getCustomerSalesDataBySalesperson = async (salespersonId: number): Promise<CustomerSale[]> => {
     try {
        const snapshot = await db.collection('customerSales').where('salesPersonId', '==', salespersonId).get();
        if (snapshot.empty) {
            return [];
        }
        const data: CustomerSale[] = [];
        snapshot.forEach(doc => {
            data.push({ docId: doc.id, ...doc.data() } as CustomerSale);
        });
        return data;
    } catch (error) {
        console.error(`Error fetching customer sales data for salesperson ${salespersonId}: `, error);
        return [];
    }
}
