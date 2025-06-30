
import { DollarSign, Percent, Target, TrendingUp, UserPlus, Users } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamOverviewProps {
  salesData: SalesPerson[]
  globalTarget?: number
}

const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: React.ReactNode }) => (
    <div className="rounded-lg border bg-card p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
        <Icon className="mb-2 h-7 w-7 text-accent" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
)


export function TeamOverview({ salesData, globalTarget }: TeamOverviewProps) {
  const individualTotalTarget = salesData.reduce((acc, p) => acc + p.target, 0)
  const totalTarget = globalTarget ?? individualTotalTarget
  const totalAchieved = salesData.reduce((acc, p) => acc + p.achieved, 0)
  const progress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0
  
  const totalMargin = salesData.reduce((acc, p) => acc + p.margin, 0);
  const averageMargin = salesData.length > 0 ? totalMargin / salesData.length : 0;
  
  const totalPositivationsAchieved = salesData.reduce((acc, p) => acc + p.positivations.achieved, 0);
  const totalPositivationsTarget = salesData.reduce((acc, p) => acc + p.positivations.target, 0);


  return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard 
                icon={Target}
                title="Meta Coletiva"
                value={`R$ ${totalTarget.toLocaleString("pt-BR")}`}
            />
            <StatCard 
                icon={DollarSign}
                title="Total Vendido"
                value={`R$ ${totalAchieved.toLocaleString("pt-BR")}`}
            />
             <StatCard 
                icon={Percent}
                title="Progresso"
                value={`${progress.toFixed(1)}%`}
            />
             <StatCard 
                icon={UserPlus}
                title="Novos Cadastros"
                value="4 / 5"
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
          </div>
        </CardContent>
      </Card>
  )
}
