import { DollarSign, Percent, Target } from "lucide-react"

import type { SalesPerson } from "@/components/sales-dashboard"
import { SalesTrendChart, TeamContributionChart } from "@/components/charts"
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>
      <TeamContributionChart salesData={salesData} />
      <SalesTrendChart salesData={salesData} />
    </div>
  )
}
