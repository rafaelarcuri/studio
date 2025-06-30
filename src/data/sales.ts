
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
  id: number
  name: string
  avatar: string
  target: number
  achieved: number
  margin: number
  positivations: {
    target: number
    achieved: number
  }
  salesHistory: SalesHistory[]
  monthlySales: MonthlySale[]
}

const generateSalesHistory = (): SalesHistory[] => {
  // Use a predictable seed for Math.random() for consistent data
  let seed = 1;
  const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  };
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    sales: random() * (1200 - 100) + 100,
  }))
}

const generateMonthlySalesHistory = (seed_offset = 0): MonthlySale[] => {
    let seed = 1 + seed_offset;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    const sales: MonthlySale[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthlyAchieved = Math.floor(random() * (180000 - 50000) + 50000) / 4;
        const monthlyTarget = monthlyAchieved * (1 + (random() * 0.4 - 0.1)); // Target is between -10% and +30% of achieved
        sales.push({
            month: date.toISOString().slice(0, 7) + '-01',
            sales: monthlyAchieved,
            target: Math.floor(monthlyTarget),
        });
    }
    return sales;
}


// In a real app, this would be a database.
// For this prototype, we're using an in-memory array.
let initialSalesData: SalesPerson[] = [
  { id: 1, name: "Ana Beatriz", avatar: "https://placehold.co/100x100.png", target: 25000, achieved: 18500, margin: 15.5, positivations: { target: 10, achieved: 7 }, salesHistory: generateSalesHistory(), monthlySales: generateMonthlySalesHistory(1) },
  { id: 2, name: "Carlos Silva", avatar: "https://placehold.co/100x100.png", target: 20000, achieved: 21000, margin: 18.2, positivations: { target: 8, achieved: 9 }, salesHistory: generateSalesHistory(), monthlySales: generateMonthlySalesHistory(2) },
  { id: 3, name: "Daniela Costa", avatar: "https://placehold.co/100x100.png", target: 30000, achieved: 15000, margin: 12.0, positivations: { target: 12, achieved: 5 }, salesHistory: generateSalesHistory(), monthlySales: generateMonthlySalesHistory(3) },
  { id: 4, name: "Eduardo Lima", avatar: "https://placehold.co/100x100.png", target: 22000, achieved: 22500, margin: 16.8, positivations: { target: 9, achieved: 10 }, salesHistory: generateSalesHistory(), monthlySales: generateMonthlySalesHistory(4) },
]

// Update initial achieved amount from history
initialSalesData.forEach(person => {
    const today = new Date().getDate();
    person.achieved = person.salesHistory.filter(h => h.day <= today).reduce((sum, h) => sum + h.sales, 0);
});


// In a real app, this would be a fetch call to a database.
// For the prototype, we store data in memory. This means state is not shared across pages without re-fetching.
// We return a copy to avoid mutation issues between components.
export const getSalesData = (): SalesPerson[] => {
    return JSON.parse(JSON.stringify(initialSalesData));
}

export const getSalesPersonById = (id: number): SalesPerson | undefined => {
    return getSalesData().find((p: SalesPerson) => p.id === id);
}

export const addSalesPerson = (newPersonData: { name: string; target: number; margin: number; positivationsTarget: number; }): number => {
    const newId = initialSalesData.length > 0 ? Math.max(...initialSalesData.map(p => p.id)) + 1 : 1;
    const newPerson: SalesPerson = {
        id: newId,
        name: newPersonData.name,
        avatar: `https://placehold.co/100x100.png`,
        target: newPersonData.target,
        achieved: 0,
        margin: newPersonData.margin,
        positivations: {
            target: newPersonData.positivationsTarget,
            achieved: 0,
        },
        // New employees start with no sales history
        salesHistory: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sales: 0 })),
        monthlySales: Array.from({ length: 12 }, (_, i) => {
            const today = new Date();
            const date = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
            return { month: date.toISOString().slice(0, 7) + '-01', sales: 0, target: Math.floor(newPersonData.target / 12) };
        }),
    }
    initialSalesData.push(newPerson);
    return newId;
};
