
export type CustomerSale = {
    id: number;
    name: string;
    value: number;
}

const customerSalesData: CustomerSale[] = [
    { id: 1, name: "Mobilita Com Ind e R", value: 2386827.00 },
    { id: 2, name: "Uniao de Lojas Leade", value: 1345562.80 },
    { id: 3, name: "Armarinhos Fernando", value: 1210110.00 },
    { id: 4, name: "Financeiro Americana", value: 816000.00 },
    { id: 5, name: "Brascol Com. de Roup", value: 568462.40 },
    { id: 6, name: "Wms Supermercados", value: 332769.60 },
    { id: 7, name: "Hopi Hari S A", value: 331971.50 },
    { id: 8, name: "Eugenio Raulino Koer", value: 289300.00 },
    { id: 9, name: "Lorenzetti S a Ind. Bra", value: 286338.20 },
    { id: 10, name: "Issam Importadora e", value: 265344.00 },
    { id: 11, name: "Companhia Zaffari Cc", value: 234358.80 },
    { id: 12, name: "Confeccoes Emilio L", value: 189484.00 },
    { id: 13, name: "Coml Monte Libano L", value: 145200.00 },
];

export const getCustomerSalesData = (): CustomerSale[] => {
    return JSON.parse(JSON.stringify(customerSalesData));
}
