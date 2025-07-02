
"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SalesPerson } from "@/data/sales"
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface ChartsProps {
  salesData: SalesPerson[]
}

export function TeamContributionChart({ salesData }: ChartsProps) {
  const [view, setView] = useState<"valor" | "percentual">("valor")

  const totalAchieved = salesData.reduce((sum, p) => sum + p.achieved, 0)

  const chartData = salesData.map(person => ({
    name: person.name,
    valor: person.achieved,
    percentual: totalAchieved > 0 ? (person.achieved / totalAchieved) * 100 : 0,
  }))

  const chartConfig: ChartConfig = {
    valor: {
      label: "Valor_",
      color: "hsl(var(--primary))",
    },
    percentual: {
      label: "Participação",
      color: "hsl(var(--primary))",
    },
  }

  const dataKey = view === 'valor' ? 'valor' : 'percentual';
  
  const yAxisTickFormatter = (value: any) => {
    if (view === 'valor') {
        return `R$${Number(value) / 1000}k`
    }
    return `${Number(value).toFixed(0)}%`
  }
  
  const tooltipFormatter = (value: number) => {
      if (view === 'valor') {
          return `R$${value.toLocaleString("pt-BR")}`
      }
      return `${value.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contribuição da Equipe</CardTitle>
          <CardDescription>
            {view === 'valor'
              ? 'Valor vendido por cada membro.'
              : 'Participação percentual no faturamento total da equipe.'}
          </CardDescription>
        </div>
        <ToggleGroup
          type="single"
          defaultValue="valor"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as "valor" | "percentual")
          }}
          aria-label="Tipo de visualização"
          className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
        >
          <ToggleGroupItem value="valor" aria-label="Ver em valor" className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
            R$
          </ToggleGroupItem>
          <ToggleGroupItem value="percentual" aria-label="Ver em percentual" className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
            %
          </ToggleGroupItem>
        </ToggleGroup>
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
                tickFormatter={yAxisTickFormatter}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={tooltipFormatter}
                    labelClassName="font-bold"
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey={dataKey} fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
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
      label: isIndividualView ? "Faturamento" : "Equipe",
      color: "hsl(var(--primary))",
    },
    ...dynamicChartConfig,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Faturamento Diário</CardTitle>
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


export function MonthlyPerformanceChart({ salesPerson }: { salesPerson: SalesPerson }) {
  const chartData = salesPerson.monthlySales.map(item => ({
    name: format(new Date(item.month), 'MMM-yy', { locale: ptBR }),
    meta: item.target,
    realizado: item.sales,
  }));

  const chartConfig: ChartConfig = {
    meta: {
      label: "Meta",
      color: "hsl(var(--chart-2))",
    },
    realizado: {
      label: "Realizado",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta vs. Realizado (Últimos 12 Meses)</CardTitle>
        <CardDescription>Análise do histórico de metas e resultados.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${(value as number) / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => `R$${(value as number).toLocaleString("pt-BR")}`} indicator="dot" />}
              />
              <Legend />
              <Bar dataKey="meta" fill="var(--color-meta)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizado" fill="var(--color-realizado)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
