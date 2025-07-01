'use server';

import { db } from '@/lib/firebase';

export type CustomerSale = {
    id: number;
    name: string;
    value: number;
    salesPersonId: number;
    docId: string; // Firestore document ID
}

const mockCustomerSales: CustomerSale[] = [
    { id: 101, name: 'Supermercado Central', value: 12500, salesPersonId: 1, docId: 'mock-cust-101' },
    { id: 102, name: 'Padaria Pão Quente', value: 7800, salesPersonId: 1, docId: 'mock-cust-102' },
    { id: 103, name: 'Tecidos & Cia', value: 23450, salesPersonId: 2, docId: 'mock-cust-103' },
    { id: 104, name: 'Construtora Rocha Forte', value: 45000, salesPersonId: 2, docId: 'mock-cust-104' },
    { id: 105, name: 'Restaurante Sabor Divino', value: 9900, salesPersonId: 3, docId: 'mock-cust-105' },
    { id: 106, name: 'Oficina Mecânica Veloz', value: 15300, salesPersonId: 3, docId: 'mock-cust-106' },
    { id: 107, name: 'Farmácia Bem-Estar', value: 11200, salesPersonId: 4, docId: 'mock-cust-107' },
    { id: 108, name: 'Loja de Calçados Passo Certo', value: 8900, salesPersonId: 4, docId: 'mock-cust-108' },
    { id: 109, name: 'Distribuidora de Bebidas Gelada', value: 31000, salesPersonId: 5, docId: 'mock-cust-109' },
    { id: 110, name: 'Petshop Amigo Fiel', value: 6500, salesPersonId: 5, docId: 'mock-cust-110' },
    { id: 111, name: 'Academia Corpo em Movimento', value: 13800, salesPersonId: 6, docId: 'mock-cust-111' },
    { id: 112, name: 'Salão de Beleza Charme', value: 5200, salesPersonId: 6, docId: 'mock-cust-112' },
    { id: 113, name: 'Material de Construção Casa Nova', value: 29000, salesPersonId: 7, docId: 'mock-cust-113' },
    { id: 114, name: 'Escola de Idiomas Global', value: 17600, salesPersonId: 7, docId: 'mock-cust-114' },
    { id: 115, name: 'Gráfica Impressão Rápida', value: 8100, salesPersonId: 8, docId: 'mock-cust-115' },
    { id: 116, name: 'Agência de Viagens Mundo Afora', value: 21500, salesPersonId: 8, docId: 'mock-cust-116' },
    { id: 117, name: 'Loja de Eletrônicos InovaTec', value: 35800, salesPersonId: 9, docId: 'mock-cust-117' },
    { id: 118, name: 'Cafeteria Grão Especial', value: 10500, salesPersonId: 9, docId: 'mock-cust-118' },
    { id: 119, name: 'Advocacia & Associados', value: 25000, salesPersonId: 10, docId: 'mock-cust-119' },
    { id: 120, name: 'Floricultura Jardim Encantado', value: 4800, salesPersonId: 10, docId: 'mock-cust-120' },
    { id: 121, name: 'Consultório Odontológico Sorriso', value: 19800, salesPersonId: 1, docId: 'mock-cust-121' },
    { id: 122, name: 'Auto Peças Roda Viva', value: 16700, salesPersonId: 2, docId: 'mock-cust-122' },
    { id: 123, name: 'Livraria & Papelaria Saber', value: 6200, salesPersonId: 3, docId: 'mock-cust-123' },
    { id: 124, name: 'Empório de Produtos Naturais', value: 9300, salesPersonId: 6, docId: 'mock-cust-124' },
    { id: 125, name: 'Estúdio de Fotografia Click', value: 11800, salesPersonId: 9, docId: 'mock-cust-125' },
];


export const getCustomerSalesData = async (): Promise<CustomerSale[]> => {
    if (!db) return mockCustomerSales;
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
    if (!db) return mockCustomerSales.filter(c => c.salesPersonId === salespersonId);
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
