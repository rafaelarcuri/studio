"use client"

import { ArrowDown, ArrowUp, Target } from "lucide-react"

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
  const { target, achieved, monthlySales } = salesPerson
  const percentage = target > 0 ? (achieved / target) * 100 : 100
  
  const comparison = {
    value: 0,
    isPositive: true,
  }

  if (monthlySales && monthlySales.length >= 2) {
    // The monthlySales array is sorted, so the last two elements are the most recent months.
    const lastMonthSales = monthlySales[monthlySales.length - 1].sales
    const previousMonthSales = monthlySales[monthlySales.length - 2].sales

    if (previousMonthSales > 0) {
      const diff =
        ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100
      comparison.value = Math.abs(diff)
      comparison.isPositive = diff >= 0
    } else if (lastMonthSales > 0) {
      // If previous month was 0, any sales is a big increase.
      comparison.value = 100
      comparison.isPositive = true
    }
    // If both are 0, the default `value: 0` and `isPositive: true` is fine.
  }

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
              {comparison.isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{comparison.value.toFixed(0)}% vs. mês anterior</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
