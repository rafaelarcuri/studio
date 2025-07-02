
"use client"

import * as React from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { CustomerSale } from "@/data/customers"
import { getCustomerSalesData } from "@/data/customers"
import { Skeleton } from "./ui/skeleton";


export default function CustomerRankingDashboard() {
    const [customerData, setCustomerData] = React.useState<CustomerSale[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getCustomerSalesData();
            setCustomerData(data);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const totalValue = customerData.reduce(
        (sum, customer) => sum + customer.value,
        0
    )
    const sortedData = [...customerData].sort((a, b) => b.value - a.value)

    const formatCurrency = (value: number) =>
        `R$ ${value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <Skeleton className="h-[500px] w-full" />
                        <Skeleton className="h-[500px] w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Legenda</span>
                     </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="font-semibold">
                                    Total
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Total</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    Exibir: <span className="font-semibold ml-1">10 maiores</span>
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>10 maiores</DropdownMenuItem>
                                <DropdownMenuItem>20 maiores</DropdownMenuItem>
                                <DropdownMenuItem>50 maiores</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="w-full">
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart
                                    layout="vertical"
                                    data={sortedData.slice(0, 10).reverse()}
                                    margin={{ top: 5, right: 110, left: 10, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={120}
                                        tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                         <LabelList 
                                            dataKey="value" 
                                            position="right"
                                            offset={10} 
                                            formatter={(value: number) => formatCurrency(value)}
                                            className="fill-foreground text-xs font-bold"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                    <TableRow>
                                        <TableHead>Cliente ({customerData.length})</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead className="w-24 text-right">% Valor</TableHead>
                                        <TableHead className="w-16 text-center">Posição</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="font-bold bg-muted/30 hover:bg-muted/30">
                                        <TableCell>Total Geral</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalValue)}</TableCell>
                                        <TableCell className="text-right font-mono">100.00%</TableCell>
                                        <TableCell className="text-center font-medium">-</TableCell>
                                    </TableRow>
                                    {sortedData.map((customer, index) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(customer.value)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {((customer.value / totalValue) * 100).toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
