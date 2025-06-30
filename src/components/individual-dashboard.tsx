"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import type { SalesPerson } from '@/data/sales';
import { getSalesPersonById } from '@/data/sales';
import { IndividualPerformanceCard } from '@/components/individual-performance-card';
import { MonthlySalesChart, SalesTrendChart } from '@/components/charts';
import { Button } from '@/components/ui/button';


interface IndividualDashboardProps {
    salespersonId: number;
}

export default function IndividualDashboard({ salespersonId }: IndividualDashboardProps) {
    // Data is now fetched and considered read-only for this view.
    const [salesPerson, setSalesPerson] = useState<SalesPerson | undefined>(() => getSalesPersonById(salespersonId));
    
    useEffect(() => {
        // This effect ensures that if the ID changes, we get the new data.
        setSalesPerson(getSalesPersonById(salespersonId));
    }, [salespersonId]);

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
            <header className="flex items-center gap-4">
                 <Button asChild variant="outline" size="icon" className="shrink-0">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Painel de {salesPerson.name}</h1>
                    <p className="text-muted-foreground">
                        Acompanhe seu desempenho de vendas individual.
                    </p>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                     <IndividualPerformanceCard 
                        salesPerson={salesPerson}
                    />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <SalesTrendChart salesData={[salesPerson]} />
                    <MonthlySalesChart salesData={[salesPerson]} />
                </div>
            </div>
        </div>
    )
}
