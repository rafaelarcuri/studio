
"use client"

import { useState } from "react"
import { CheckCircle, DollarSign, Percent, Plus, Target, TrendingUp } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface IndividualPerformanceCardProps {
  salesPerson: SalesPerson
  onAddSale: (id: number, amount: number) => void
}

export function IndividualPerformanceCard({
  salesPerson,
  onAddSale,
}: IndividualPerformanceCardProps) {
  const [amount, setAmount] = useState("")
  const { id, name, avatar, target, achieved, margin } = salesPerson
  const progress = target > 0 ? (achieved / target) * 100 : 100
  const remaining = Math.max(0, target - achieved)
  const hasMetTarget = achieved >= target

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent link navigation when clicking form
    const saleAmount = parseFloat(amount)
    if (!isNaN(saleAmount) && saleAmount > 0) {
      onAddSale(id, saleAmount)
      setAmount("")
    }
  }

  return (
    <Card
      className={`transform transition-all duration-300 hover:shadow-xl ${
        hasMetTarget ? "border-primary shadow-lg shadow-primary/20" : "border"
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{name}</CardTitle>
          {hasMetTarget && (
            <Badge
              variant="default"
              className="mt-1 border-primary/30 bg-primary/20 text-primary hover:bg-primary/30"
              aria-live="polite"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Meta Atingida!
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between items-end">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-lg font-bold text-primary">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3 [&>div]:bg-primary" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="space-y-1 rounded-md border p-2">
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Target className="h-4 w-4" /> Meta
            </p>
            <p className="font-semibold">R$ {target.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-1 rounded-md border p-2">
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <DollarSign className="h-4 w-4" /> Vendido
            </p>
            <p className="font-semibold">R$ {achieved.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-1 rounded-md border p-2">
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <TrendingUp className="h-4 w-4" /> Restante
            </p>
            <p className="font-semibold">R$ {remaining.toLocaleString("pt-BR")}</p>
          </div>
           <div className="space-y-1 rounded-md border p-2">
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Percent className="h-4 w-4" /> Margem
            </p>
            <p className="font-semibold">{margin.toFixed(1)}%</p>
          </div>
        </div>
        <form onSubmit={handleAddSale} className="flex items-center gap-2 pt-2">
          <Input
            type="number"
            placeholder="Adicionar venda..."
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent link navigation
            className="h-9"
            aria-label="Valor da nova venda"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
