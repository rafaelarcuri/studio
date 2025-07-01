
"use client"

import { useState } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { PlusCircle, Target, LogOut, Trophy, ClipboardList, Users, Settings, ClipboardCheck, PieChart, Plug } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { getSalesData } from "@/data/sales"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { GoalSetter } from "@/components/goal-setter"
import { IndividualPerformanceCard } from "@/components/individual-performance-card"
import { TeamOverview } from "@/components/team-overview"
import { Button } from "@/components/ui/button"
import { SalesRankingTable } from "./sales-ranking-table"
import { TeamContributionChart } from "./charts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function SalesDashboard() {
  const [salesData] = useState<SalesPerson[]>(getSalesData)
  const [globalTarget, setGlobalTarget] = useState<number | undefined>(100000);
  const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>
                 <DropdownMenuItem onSelect={() => router.push('/analytics')}>
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>Análise de Produtividade</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/ranking')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Ranking de Clientes</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Metas e Tarefas</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                       <DropdownMenuItem onSelect={() => router.push('/tasks')}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        <span>Quadro de Tarefas</span>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuLabel>Gestão de Metas</DropdownMenuLabel>
                       <DropdownMenuItem onSelect={() => router.push('/goals/upload')}>
                        Cadastro em Massa
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push('/goals')}>
                        Alteração Individual
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => router.push('/goals')}>
                        Histórico de Metas
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem onSelect={() => router.push('/users')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Gestão de Usuários</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => router.push('/integrations')}>
                  <Plug className="mr-2 h-4 w-4" />
                  <span>APIs e Integrações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setIsGoalSetterOpen(true)}>
                  <Target className="mr-2 h-4 w-4" />
                  <span>Definir Meta Global</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/sales/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Adicionar Usuário</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <GoalSetter 
        onSetTarget={handleSetGlobalTarget}
        open={isGoalSetterOpen}
        onOpenChange={setIsGoalSetterOpen}
      />

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
          <TeamContributionChart salesData={salesData} />
          <SalesRankingTable salesData={salesData} />
        </div>
      </div>
    </div>
  )
}
