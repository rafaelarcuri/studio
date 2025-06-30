
export type SalesHistory = {
  day: number
  sales: number
}

export type SalesPerson = {
  id: number
  name: string
  avatar: string
  target: number
  achieved: number
  salesHistory: SalesHistory[]
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

// In a real app, this would be a database.
// For this prototype, we're using an in-memory array.
let initialSalesData: SalesPerson[] = [
  { id: 1, name: "Ana Beatriz", avatar: "https://placehold.co/100x100.png", target: 25000, achieved: 18500, salesHistory: generateSalesHistory() },
  { id: 2, name: "Carlos Silva", avatar: "https://placehold.co/100x100.png", target: 20000, achieved: 21000, salesHistory: generateSalesHistory() },
  { id: 3, name: "Daniela Costa", avatar: "https://placehold.co/100x100.png", target: 30000, achieved: 15000, salesHistory: generateSalesHistory() },
  { id: 4, name: "Eduardo Lima", avatar: "https://placehold.co/100x100.png", target: 22000, achieved: 22500, salesHistory: generateSalesHistory() },
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

export const addSalesPerson = (newPersonData: { name: string; target: number }) => {
    const newId = initialSalesData.length > 0 ? Math.max(...initialSalesData.map(p => p.id)) + 1 : 1;
    const newPerson: SalesPerson = {
        id: newId,
        name: newPersonData.name,
        avatar: `https://placehold.co/100x100.png`,
        target: newPersonData.target,
        achieved: 0,
        // New employees start with no sales history
        salesHistory: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sales: 0 })),
    }
    initialSalesData.push(newPerson);
};
