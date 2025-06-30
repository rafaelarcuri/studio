"use client"

import { ArrowUp, Target } from "lucide-react"

import type { SalesPerson } from "@/data/sales"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface GoalAchievementCardProps {
  salesPerson: SalesPerson
}

export function GoalAchievementCard({ salesPerson }: GoalAchievementCardProps) {
  const { target, achieved } = salesPerson
  const percentage = target > 0 ? (achieved / target) * 100 : 100
  const previousYearComparison = 28 // Static value as per image

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Atingimento Meta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <Target className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {percentage.toFixed(1).replace(".", ",")}%
            </p>
            <div className="flex items-center justify-end gap-1 mt-1 text-sm">
              <ArrowUp className="h-4 w-4" />
              <span>{previousYearComparison}% vs. ano anterior</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
