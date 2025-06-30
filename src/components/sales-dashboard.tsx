"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { IndividualPerformanceCard } from "@/components/individual-performance-card"
import { TeamOverview } from "@/components/team-overview"
import { Button } from "@/components/ui/button"

export type SalesHistory = {
  day: number
  sales: number
}

export type SalesPerson = {
  id: number
  name: string
  avatar: string
  target: number
  achieved: number
  salesHistory: SalesHistory[]
}

const generateSalesHistory = (): SalesHistory[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    sales: Math.random() * (1200 - 100) + 100,
  }))
}

const initialSalesData: SalesPerson[] = [
  { id: 1, name: "Ana Beatriz", avatar: "https://placehold.co/100x100.png", "data-ai-hint": "woman portrait", target: 25000, achieved: 18500, salesHistory: generateSalesHistory() },
  { id: 2, name: "Carlos Silva", avatar: "https://placehold.co/100x100.png", "data-ai-hint": "man portrait", target: 20000, achieved: 21000, salesHistory: generateSalesHistory() },
  { id: 3, name: "Daniela Costa", avatar: "https://placehold.co/100x100.png", "data-ai-hint": "woman portrait", target: 30000, achieved: 15000, salesHistory: generateSalesHistory() },
  { id: 4, name: "Eduardo Lima", avatar: "https://placehold.co/100x100.png", "data-ai-hint": "man portrait", target: 22000, achieved: 22500, salesHistory: generateSalesHistory() },
]

// Update initial achieved amount from history
initialSalesData.forEach(person => {
    const today = new Date().getDate();
    person.achieved = person.salesHistory.filter(h => h.day <= today).reduce((sum, h) => sum + h.sales, 0);
});


export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesPerson[]>(initialSalesData)
  const { toast } = useToast()

  const handleAddSale = (id: number, amount: number) => {
    setSalesData(prevData =>
      prevData.map(person => {
        if (person.id === id) {
          const newAchieved = person.achieved + amount
          const hasMetTargetNow = newAchieved >= person.target
          const hadMetTargetBefore = person.achieved >= person.target

          if (hasMetTargetNow && !hadMetTargetBefore) {
            toast({
              title: "Meta Atingida! 🎉",
              description: `${person.name} alcançou a meta de vendas!`,
              variant: "default",
              duration: 5000,
            })
          }

          const today = new Date().getDate()
          const newHistory = [...person.salesHistory]
          const todayIndex = newHistory.findIndex(h => h.day === today)
          if (todayIndex !== -1) {
            newHistory[todayIndex].sales += amount
          } else {
            newHistory.push({ day: today, sales: amount })
          }

          return { ...person, achieved: newAchieved, salesHistory: newHistory }
        }
        return person
      })
    )
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
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Vendedor
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Desempenho Individual</h2>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {salesData
              .sort((a, b) => b.achieved - a.achieved)
              .map(person => (
                <IndividualPerformanceCard
                  key={person.id}
                  salesPerson={person}
                  onAddSale={handleAddSale}
                />
              ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Desempenho da Equipe</h2>
          <TeamOverview salesData={salesData} />
        </div>
      </div>
    </div>
  )
}
