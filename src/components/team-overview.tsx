
import { DollarSign, Percent, Target, TrendingUp, UserPlus, Users, ArrowUp, ArrowDown, TrendingDown } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamOverviewProps {
  salesData: SalesPerson[]
  globalTarget?: number
}

const StatCard = ({ icon: Icon, title, value, comparison }: { 
    icon: React.ElementType, 
    title: string, 
    value: React.ReactNode,
    comparison?: { value: number; isPositive: boolean; } 
}) => (
    <div className="rounded-lg border bg-card p-4 flex flex-col items-center justify-center text-center min-h-[140px]">
        <Icon className="mb-2 h-7 w-7 text-accent" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>

        {comparison ? (
            <div className="flex items-center gap-1 mt-1 text-xs">
                {comparison.isPositive ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`${comparison.isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {comparison.value.toFixed(0)}% vs. mês anterior
                </span>
            </div>
        ) : (
            <div className="mt-1 h-[18px]" />
        )}
    </div>
)


export function TeamOverview({ salesData, globalTarget }: TeamOverviewProps) {
  const individualTotalTarget = salesData.reduce((acc, p) => acc + p.target, 0)
  const totalTarget = globalTarget ?? individualTotalTarget
  const totalAchieved = salesData.reduce((acc, p) => acc + p.achieved, 0)
  const progress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0
  
  const totalMargin = salesData.reduce((acc, p) => acc + p.margin, 0);
  const averageMargin = salesData.length > 0 ? totalMargin / salesData.length : 0;

  const totalInadimplencia = salesData.reduce((acc, p) => acc + p.inadimplencia, 0);
  const averageInadimplencia = salesData.length > 0 ? totalInadimplencia / salesData.length : 0;
  
  const totalInadimplenciaValor = salesData.reduce((sum, p) => sum + (p.achieved * (p.inadimplencia / 100)), 0);

  const totalPositivationsAchieved = salesData.reduce((acc, p) => acc + p.positivations.achieved, 0);
  const totalPositivationsTarget = salesData.reduce((acc, p) => acc + p.positivations.target, 0);

  const totalNewRegistrationsAchieved = salesData.reduce((acc, p) => acc + p.newRegistrations.achieved, 0);
  const totalNewRegistrationsTarget = salesData.reduce((acc, p) => acc + p.newRegistrations.target, 0);


  let lastMonthTotalSales = 0;
  let previousMonthTotalSales = 0;

  salesData.forEach(person => {
    if (person.monthlySales && person.monthlySales.length >= 2) {
      lastMonthTotalSales += person.monthlySales[person.monthlySales.length - 1].sales;
      previousMonthTotalSales += person.monthlySales[person.monthlySales.length - 2].sales;
    }
  });
  
  const salesComparison = {
    value: 0,
    isPositive: true,
  };

  if (previousMonthTotalSales > 0) {
    const diff = ((lastMonthTotalSales - previousMonthTotalSales) / previousMonthTotalSales) * 100;
    salesComparison.value = Math.abs(diff);
    salesComparison.isPositive = diff >= 0;
  } else if (lastMonthTotalSales > 0) {
    salesComparison.value = 100;
    salesComparison.isPositive = true;
  }
  
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`;

  return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                icon={Target}
                title="Meta Coletiva"
                value={formatCurrency(totalTarget)}
            />
            <StatCard 
                icon={DollarSign}
                title="Total Vendido"
                value={formatCurrency(totalAchieved)}
                comparison={salesComparison}
            />
             <StatCard 
                icon={Percent}
                title="Progresso"
                value={`${progress.toFixed(1)}%`}
            />
             <StatCard 
                icon={UserPlus}
                title="Novos Cadastros"
                value={`${totalNewRegistrationsAchieved} / ${totalNewRegistrationsTarget}`}
            />
            <StatCard 
                icon={TrendingUp}
                title="Margem Média"
                value={`${averageMargin.toFixed(1)}%`}
            />
            <StatCard 
                icon={Users}
                title="Positivação"
                value={`${totalPositivationsAchieved} / ${totalPositivationsTarget}`}
            />
            <StatCard 
                icon={TrendingDown}
                title="Inadimplência Média (%)"
                value={`${averageInadimplencia.toFixed(1).replace('.',',')}%`}
            />
            <StatCard 
                icon={TrendingDown}
                title="Inadimplência Total (R$)"
                value={formatCurrency(totalInadimplenciaValor)}
            />
          </div>
        </CardContent>
      </Card>
  )
}
