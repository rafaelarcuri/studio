
"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut } from 'lucide-react';

import type { SalesPerson } from '@/data/sales';
import { getSalesPersonById } from '@/data/sales';
import { useAuth } from "@/hooks/use-auth";
import { MonthlyPerformanceChart, SalesTrendChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { SalespersonCustomerList } from "./salesperson-customer-list";
import { GoalAchievementCard } from "./goal-achievement-card";
import { IndividualKpiPanel } from "./individual-kpi-panel";
import { Skeleton } from "./ui/skeleton";

interface IndividualDashboardProps {
    salespersonId: number;
}

export default function IndividualDashboard({ salespersonId }: IndividualDashboardProps) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [salesPerson, setSalesPerson] = useState<SalesPerson | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getSalesPersonById(salespersonId);
            setSalesPerson(data);
            setIsLoading(false);
        }
        if (salespersonId) {
            fetchData();
        }
    }, [salespersonId]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    }

    if (isLoading) {
        return (
             <div className="p-8 space-y-8">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                         <Skeleton className="h-64 w-full" />
                         <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!salesPerson) {
        return (
             <div className="text-center mt-10">
                <p className="text-xl mb-4">Vendedor não encontrado.</p>
                <Button asChild>
                    <Link href="/">Voltar ao Dashboard</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    {user?.role === 'gerente' && (
                        <Button asChild variant="outline" size="icon" className="shrink-0">
                            <Link href="/">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Voltar</span>
                            </Link>
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Painel de {salesPerson.name}</h1>
                        <p className="text-muted-foreground">
                            Acompanhe seu desempenho de vendas individual.
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <IndividualKpiPanel salesPerson={salesPerson} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                     <GoalAchievementCard salesPerson={salesPerson} />
                     <SalespersonCustomerList salespersonId={salespersonId} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <MonthlyPerformanceChart salesPerson={salesPerson} />
                    <SalesTrendChart salesData={[salesPerson]} />
                </div>
            </div>
        </div>
    )
}
