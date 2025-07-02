
"use client"

import { useState, useEffect } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"

import type { SalesPerson } from "@/data/sales"
import { getSalesData } from "@/data/sales"
import { IndividualPerformanceCard } from "@/components/individual-performance-card"
import { TeamOverview } from "@/components/team-overview"
import { SalesRankingTable } from "./sales-ranking-table"
import { TeamContributionChart } from "./charts"
import { Skeleton } from "./ui/skeleton"
import type { User } from "@/data/users"
import { getUsers } from "@/data/users"


export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesPerson[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalTarget, setGlobalTarget] = useState<number | undefined>(100000);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [sales, usersData] = await Promise.all([getSalesData(), getUsers()]);
        setSalesData(sales);
        setUsers(usersData);
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const mergedSalesData = salesData
    .map(sp => {
        const user = users.find(u => u.salesPersonId === sp.id);
        return {
            ...sp,
            status: user?.status ?? 'inativo' as 'ativo' | 'inativo'
        };
    })
    .sort((a, b) => b.achieved - a.achieved);

  if (isLoading) {
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-10 w-1/4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
       <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Geral</h1>
          <p className="text-muted-foreground">
            Visão geral da performance da equipe em tempo real.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Desempenho Individual</h2>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {mergedSalesData
              .map(person => (
                <Link key={person.id} href={`/sales/${person.id}`} className="no-underline text-current outline-none focus:ring-2 focus:ring-ring rounded-lg">
                  <IndividualPerformanceCard
                    salesPerson={person}
                  />
                </Link>
              ))}
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <TeamOverview salesData={salesData} globalTarget={globalTarget} />
          <TeamContributionChart salesData={salesData} />
          <SalesRankingTable salesData={mergedSalesData} />
        </div>
      </div>
    </div>
  )
}
