
"use client"

import { getCustomerSalesDataBySalesperson } from "@/data/customers"
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
import { Users } from "lucide-react"

interface SalespersonCustomerListProps {
  salespersonId: number
}

const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

export function SalespersonCustomerList({ salespersonId }: SalespersonCustomerListProps) {
  const customerData = getCustomerSalesDataBySalesperson(salespersonId)

  if (customerData.length === 0) {
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
          <p className="text-muted-foreground text-center py-8">
            Nenhum cliente encontrado para este vendedor.
          </p>
        </CardContent>
      </Card>
    )
  }
  
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
      </CardContent>
    </Card>
  )
}
