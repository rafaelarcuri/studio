
"use client"

import * as React from "react";
import { Users } from "lucide-react"

import { getCustomerSalesDataBySalesperson } from "@/data/customers"
import type { CustomerSale } from "@/data/customers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "./ui/skeleton";


interface SalespersonCustomerListProps {
  salespersonId: number
}

const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

export function SalespersonCustomerList({ salespersonId }: SalespersonCustomerListProps) {
  const [customerData, setCustomerData] = React.useState<CustomerSale[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const data = await getCustomerSalesDataBySalesperson(salespersonId);
        setCustomerData(data);
        setIsLoading(false);
    }
    if (salespersonId) {
        fetchData();
    }
  }, [salespersonId]);


  const sortedData = [...customerData].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <Users className="h-6 w-6" />
           <span>Carteira de Clientes</span>
        </CardTitle>
        <CardDescription>
            Clientes atendidos por este vendedor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : customerData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
                Nenhum cliente encontrado para este vendedor.
            </p>
        ) : (
            <div className="max-h-[300px] overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor Vendido</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedData.map((customer) => (
                    <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-right font-mono">
                        {formatCurrency(customer.value)}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
