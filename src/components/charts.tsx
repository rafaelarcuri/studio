
"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SalesPerson } from "@/data/sales"

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
  const isIndividualView = salesData.length === 1;
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
      label: isIndividualView ? salesData[0].name : "Equipe",
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
              {!isIndividualView && <Legend />}
              {!isIndividualView && salesData.map((person) => (
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

export function MonthlySalesChart({ salesData }: ChartsProps) {
  const isIndividualView = salesData.length === 1;
  const description = isIndividualView
    ? `Análise do seu histórico de metas e resultados.`
    : "Análise do histórico de metas e resultados da equipe.";

  const monthlyData: { [month: string]: { realizado: number; meta: number } } = {}

  // Aggregate monthly data
  salesData.forEach(person => {
    person.monthlySales?.forEach(sale => {
      if (monthlyData[sale.month]) {
        monthlyData[sale.month].realizado += sale.sales
        monthlyData[sale.month].meta += sale.target
      } else {
        monthlyData[sale.month] = {
          realizado: sale.sales,
          meta: sale.target,
        }
      }
    })
  })

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: parseISO(month),
      ...data,
    }))
    .sort((a, b) => a.month.getTime() - b.month.getTime())
    .slice(-12); // Ensure we only show last 12 months

  const chartConfig: ChartConfig = {
    realizado: {
      label: "Realizado",
      color: "hsl(var(--primary))",
    },
    meta: {
      label: "Meta",
      color: "hsl(var(--accent))",
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta vs. Realizado (Últimos 12 Meses)</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => format(new Date(value), "MMM-yy", { locale: ptBR })}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `R$${(value as number / 1000)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `R$${(value as number).toLocaleString("pt-BR", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
                      chartConfig[name as keyof typeof chartConfig]?.label,
                    ]}
                    labelClassName="font-bold"
                    indicator="dot"
                    labelFormatter={(_, payload) => {
                      const date = payload?.[0]?.payload?.month
                      if (!date) return null
                      return format(new Date(date), "MMMM yyyy", { locale: ptBR })
                    }}
                  />
                }
              />
              <Legend />
              <Bar dataKey="meta" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizado" fill="var(--color-realizado)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
