
"use client"

import { CheckCircle, DollarSign, Percent, Target, TrendingUp, Users } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProgressThermometer } from "./progress-thermometer"

interface IndividualPerformanceCardProps {
  salesPerson: SalesPerson
}

export function IndividualPerformanceCard({
  salesPerson,
}: IndividualPerformanceCardProps) {
  const { name, avatar, target, achieved, margin, positivations } = salesPerson
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
      <CardContent className="space-y-6">
        <ProgressThermometer value={progress} />
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
          <div className="space-y-1 rounded-md border p-2">
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Users className="h-4 w-4" /> Positivação
            </p>
            <p className="font-semibold">{`${positivations.achieved} / ${positivations.target}`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
