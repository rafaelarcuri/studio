"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SalesPerson } from "@/components/sales-dashboard"

interface ChartsProps {
  salesData: SalesPerson[]
}

export function TeamContributionChart({ salesData }: ChartsProps) {
  const chartData = salesData.map(person => ({
    name: person.name,
    vendas: person.achieved,
  }))

  const chartConfig: ChartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(var(--accent))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribuição da Equipe</CardTitle>
        <CardDescription>Valor vendido por cada membro.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: -10,
                bottom: 5,
              }}
              aria-label="Gráfico de contribuição da equipe"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `R$${value / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={value => `R$${(value as number).toLocaleString("pt-BR")}`}
                    labelClassName="font-bold"
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey="vendas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function SalesTrendChart({ salesData }: ChartsProps) {
  const trendData: any[] = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, total: 0 }))

  const cumulativeSales: { [key: string]: number } = {}
  salesData.forEach(p => cumulativeSales[p.name] = 0)
  let cumulativeTotal = 0

  trendData.forEach((dayData) => {
    salesData.forEach((person) => {
      const saleForDay = person.salesHistory.find(s => s.day === dayData.day)?.sales || 0
      cumulativeSales[person.name] += saleForDay;
      dayData[person.name] = cumulativeSales[person.name];
    })
    const totalSalesForDay = salesData.reduce((sum, p) => sum + (p.salesHistory.find(s => s.day === dayData.day)?.sales || 0), 0)
    cumulativeTotal += totalSalesForDay
    dayData.total = cumulativeTotal;
  });


  const dynamicChartConfig = salesData.reduce((acc, person, index) => {
    acc[person.name] = {
      label: person.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as ChartConfig)

  const chartConfig: ChartConfig = {
    total: {
      label: "Equipe",
      color: "hsl(var(--primary))",
    },
    ...dynamicChartConfig,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Vendas</CardTitle>
        <CardDescription>Progresso de vendas acumulado (últimos 30 dias).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={value => `Dia ${value}`}
              />
              <YAxis
                tickFormatter={value => `R$${value / 1000}k`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `R$${(value as number).toLocaleString("pt-BR")}`,
                      chartConfig[name]?.label,
                    ]}
                    indicator="line"
                  />
                }
              />
              <Legend />
              {salesData.map((person, index) => (
                <Line
                  key={person.id}
                  type="monotone"
                  dataKey={person.name}
                  stroke={chartConfig[person.name].color}
                  strokeWidth={1}
                  dot={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
