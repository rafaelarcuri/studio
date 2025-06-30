
"use client"

import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { CustomerSale } from "@/data/customers"
import { getCustomerSalesData } from "@/data/customers"
import { BarChart as BarChartIcon, ChevronDown, DollarSign, ListTree, Share2, Users, LineChart } from "lucide-react"

export default function CustomerRankingDashboard() {
    const customerData = getCustomerSalesData()
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Ranking</h2>
                        <p className="text-muted-foreground">Comparação de totais</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Clientes</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Clientes</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>Valor</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Valor</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <ToggleGroup type="single" defaultValue="bar" aria-label="Tipo de exibição">
                            <ToggleGroupItem value="bar" aria-label="Gráfico de barras">
                                <BarChartIcon className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="Lista">
                                <ListTree className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="line" aria-label="Gráfico de linhas" disabled>
                                <LineChart className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <Button variant="outline">
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar...
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle>Top 10 Clientes por Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart
                                layout="vertical"
                                data={sortedData.slice(0, 10).reverse()}
                                margin={{ top: 5, right: 90, left: 10, bottom: 5 }}
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
                                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                     <LabelList 
                                        dataKey="value" 
                                        position="right"
                                        offset={10} 
                                        formatter={(value: number) => formatCurrency(value)}
                                        className="fill-foreground text-xs"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle>Lista de Clientes</CardTitle>
                        <CardDescription>
                            {customerData.length} clientes no total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[550px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                    <TableHead className="w-16 text-center">Posição</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="w-24 text-right">% Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="font-semibold bg-muted/20">
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalValue)}</TableCell>
                                    <TableCell className="text-right font-mono">100.00%</TableCell>
                                </TableRow>
                                {sortedData.map((customer, index) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(customer.value)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {((customer.value / totalValue) * 100).toFixed(2)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
