
"use client"

import { useState } from "react"
import Link from 'next/link'
import { PlusCircle, Target, Trophy } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { getSalesData } from "@/data/sales"
import { useToast } from "@/hooks/use-toast"
import { GoalSetter } from "@/components/goal-setter"
import { IndividualPerformanceCard } from "@/components/individual-performance-card"
import { TeamOverview } from "@/components/team-overview"
import { Button } from "@/components/ui/button"


export default function SalesDashboard() {
  const [salesData] = useState<SalesPerson[]>(getSalesData)
  const [globalTarget, setGlobalTarget] = useState<number | undefined>(100000);
  const { toast } = useToast()

  const handleSetGlobalTarget = (target: number) => {
    setGlobalTarget(target);
    toast({
        title: "Meta Global Definida!",
        description: `A nova meta da equipe é de R$ ${target.toLocaleString("pt-BR")}.`,
    });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendas Ágil</h1>
          <p className="text-muted-foreground">
            Seu dashboard de performance em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <GoalSetter onSetTarget={handleSetGlobalTarget}>
                <Button variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Definir Meta Global
                </Button>
            </GoalSetter>
            <Button asChild>
              <Link href="/ranking">
                <Trophy className="mr-2 h-4 w-4" />
                Ranking de Clientes
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sales/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Vendedor
              </Link>
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Desempenho Individual</h2>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {salesData
              .sort((a, b) => b.achieved - a.achieved)
              .map(person => (
                <Link key={person.id} href={`/sales/${person.id}`} className="no-underline text-current outline-none focus:ring-2 focus:ring-ring rounded-lg">
                  <IndividualPerformanceCard
                    salesPerson={person}
                  />
                </Link>
              ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Desempenho da Equipe</h2>
          <TeamOverview salesData={salesData} globalTarget={globalTarget} />
        </div>
      </div>
    </div>
  )
}
