"use client"

import Link from 'next/link'
import { Award, CheckCircle2, Gem, Trophy, XCircle, ArrowUp, ArrowDown, CheckCircle } from "lucide-react"
import type { SalesPerson } from "@/data/sales"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'

interface SalesRankingTableProps {
  salesData: (SalesPerson & { status: 'ativo' | 'inativo' })[];
}

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Trophy className="h-6 w-6 text-yellow-500" />
  }
  if (rank === 2) {
    return <Award className="h-6 w-6 text-gray-400" />
  }
  if (rank === 3) {
    return <Gem className="h-6 w-6 text-orange-600" />
  }
  return <span className="text-sm text-muted-foreground">{rank}</span>
}


export function SalesRankingTable({ salesData }: SalesRankingTableProps) {
  const sortedData = [...salesData].sort((a, b) => b.achieved - a.achieved)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Vendedores</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
              <TableHead className="text-right">Qtd. Clientes</TableHead>
              <TableHead className="text-right">Ticket Médio</TableHead>
              <TableHead className="text-right">Inadimplência</TableHead>
              <TableHead className="text-right">% Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((person, index) => {
              const rank = index + 1
              const percentageOfTarget = person.target > 0 ? (person.achieved / person.target) * 100 : 0;
              const averageTicket = person.positivations.achieved > 0 ? person.achieved / person.positivations.achieved : 0;
              const hasMetTarget = person.achieved >= person.target;
              
              const { monthlySales, achieved, target } = person;
              let salesComparison = null;
              if (monthlySales && monthlySales.length >= 2) {
                const lastMonthSales = monthlySales[monthlySales.length - 1].sales;
                const previousMonthSales = monthlySales[monthlySales.length - 2].sales;
                if (previousMonthSales > 0) {
                  const diff = ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100;
                  salesComparison = {
                    value: Math.abs(diff),
                    isPositive: diff >= 0,
                  };
                } else if (lastMonthSales > 0) {
                  salesComparison = { value: 100, isPositive: true };
                }
              }
              
              // Sales Projection Logic
              const today = new Date();
              const currentDay = today.getDate();
              const safeCurrentDay = Math.max(1, currentDay);
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              
              let projectedSales = 0;
              let willReachProjectedTarget = false;

              if (achieved > 0 && currentDay < daysInMonth) {
                  const dailyAverage = achieved / safeCurrentDay;
                  projectedSales = dailyAverage * daysInMonth;
                  willReachProjectedTarget = projectedSales >= target;
              } else if (achieved >= target) {
                  projectedSales = achieved;
                  willReachProjectedTarget = true;
              }


              return (
                <TableRow key={person.id} className="h-16">
                   <TableCell className="font-medium">
                     <div className="flex items-center justify-center h-full">
                       <RankIcon rank={rank} />
                     </div>
                   </TableCell>
                  <TableCell>
                    <Link href={`/sales/${person.id}`} className="flex items-center gap-4 hover:underline">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {person.status === 'ativo' && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>
                      <span className="font-medium">{person.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <div className="text-sm">
                      R$ {person.achieved.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {salesComparison && (
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        {salesComparison.isPositive ? (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                        ) : (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`${salesComparison.isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                            {salesComparison.value.toFixed(0)}%
                        </span>
                         vs. mês anterior
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground mt-1">
                        {willReachProjectedTarget ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>
                            Projeção:
                            <span className={cn("font-bold ml-1", willReachProjectedTarget ? "text-green-600" : "text-red-600")}>
                                R$ {projectedSales.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {person.positivations.achieved}
                  </TableCell>
                   <TableCell className="text-right font-mono">
                     R$ {averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </TableCell>
                   <TableCell className="text-right font-mono">
                     {person.inadimplencia.toFixed(1).replace('.',',')}%
                   </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       {hasMetTarget ? (
                         <CheckCircle2 className="h-5 w-5 text-green-500" />
                       ) : (
                         <XCircle className="h-5 w-5 text-red-500" />
                       )}
                       <span className={`font-semibold ${hasMetTarget ? 'text-green-600' : 'text-red-600'}`}>
                         {percentageOfTarget.toFixed(1)}%
                       </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
