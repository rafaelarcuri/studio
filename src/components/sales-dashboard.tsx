
"use client"

import { useState } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { PlusCircle, Target, LogOut, Trophy, ClipboardList, Users } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { getSalesData } from "@/data/sales"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { GoalSetter } from "@/components/goal-setter"
import { IndividualPerformanceCard } from "@/components/individual-performance-card"
import { TeamOverview } from "@/components/team-overview"
import { Button } from "@/components/ui/button"
import { SalesRankingTable } from "./sales-ranking-table"


export default function SalesDashboard() {
  const [salesData] = useState<SalesPerson[]>(getSalesData)
  const [globalTarget, setGlobalTarget] = useState<number | undefined>(100000);
  const { toast } = useToast()
  const { logout } = useAuth();
  const router = useRouter();

  const handleSetGlobalTarget = (target: number) => {
    setGlobalTarget(target);
    toast({
        title: "Meta Global Definida!",
        description: `A nova meta da equipe é de R$ ${target.toLocaleString("pt-BR")}.`,
    });
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
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
        <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
                <Link href="/ranking">
                    <Trophy className="mr-2 h-4 w-4" />
                    Ranking de Clientes
                </Link>
            </Button>
            <Button asChild>
                <Link href="/goals">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Gestão de Metas
                </Link>
            </Button>
             <Button asChild>
                <Link href="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Gestão de Usuários
                </Link>
            </Button>
            <GoalSetter onSetTarget={handleSetGlobalTarget}>
                <Button variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Definir Meta Global
                </Button>
            </GoalSetter>
            <Button asChild>
              <Link href="/sales/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
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
        <div className="lg:col-span-2 space-y-6">
          <TeamOverview salesData={salesData} globalTarget={globalTarget} />
          <SalesRankingTable salesData={salesData} />
        </div>
      </div>
    </div>
  )
}
