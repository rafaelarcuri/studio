"use client"

import { CheckCircle, DollarSign, TrendingDown, TrendingUp, Target } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface IndividualPerformanceCardProps {
  salesPerson: SalesPerson
}

export function IndividualPerformanceCard({
  salesPerson,
}: IndividualPerformanceCardProps) {
  const { name, avatar, target, achieved, inadimplencia } = salesPerson
  const progress = target > 0 ? (achieved / target) * 100 : 100
  const remaining = Math.max(0, target - achieved)
  const hasMetTarget = achieved >= target

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
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>Progresso</span>
            <span className={hasMetTarget ? "text-primary" : ""}>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} aria-label={`${progress.toFixed(1)}% da meta atingido`} />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-muted-foreground">
              <Target className="h-4 w-4" /> Meta
            </p>
            <p className="font-semibold">R$ {target.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" /> Vendido
            </p>
            <p className="font-semibold">R$ {achieved.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Restante
            </p>
            <p className="font-semibold">R$ {remaining.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingDown className="h-4 w-4" /> Inadimp.
            </p>
            <p className="font-semibold">{inadimplencia.toFixed(1).replace('.',',')}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
