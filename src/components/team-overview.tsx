
import { DollarSign, Percent, Target, UserPlus, TrendingUp, Users } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { SalesTrendChart, TeamContributionChart, MonthlySalesChart } from "@/components/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamOverviewProps {
  salesData: SalesPerson[]
  globalTarget?: number
}

export function TeamOverview({ salesData, globalTarget }: TeamOverviewProps) {
  const individualTotalTarget = salesData.reduce((acc, p) => acc + p.target, 0)
  const totalTarget = globalTarget ?? individualTotalTarget
  const totalAchieved = salesData.reduce((acc, p) => acc + p.achieved, 0)
  const progress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0
  const newRegistrationsTarget = 5;
  const newRegistrationsAchieved = salesData.length;
  const totalMarginValue = salesData.reduce((acc, p) => acc + (p.margin * p.achieved), 0);
  const averageMargin = totalAchieved > 0 ? totalMarginValue / totalAchieved : 0;
  const totalPositivationsTarget = salesData.reduce((acc, p) => acc + p.positivations.target, 0)
  const totalPositivationsAchieved = salesData.reduce((acc, p) => acc + p.positivations.achieved, 0)


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border bg-card p-4">
              <Target className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Meta Coletiva</p>
              <p className="text-2xl font-bold">R$ {totalTarget.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <DollarSign className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Total Vendido</p>
              <p className="text-2xl font-bold">R$ {totalAchieved.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Percent className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
            </div>
             <div className="rounded-lg border bg-card p-4">
              <UserPlus className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Novos Cadastros</p>
              <p className="text-2xl font-bold">{`${newRegistrationsAchieved} / ${newRegistrationsTarget}`}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Margem Média</p>
              <p className="text-2xl font-bold">{averageMargin.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Users className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">Positivação</p>
              <p className="text-2xl font-bold">{`${totalPositivationsAchieved} / ${totalPositivationsTarget}`}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <TeamContributionChart salesData={salesData} />
      <SalesTrendChart salesData={salesData} />
      <MonthlySalesChart salesData={salesData} />
    </div>
  )
}
