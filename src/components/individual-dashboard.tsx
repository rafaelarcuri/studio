"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import type { SalesPerson } from '@/data/sales';
import { getSalesPersonById } from '@/data/sales';
import { IndividualPerformanceCard } from '@/components/individual-performance-card';
import { SalesTrendChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";


interface IndividualDashboardProps {
    salespersonId: number;
}

export default function IndividualDashboard({ salespersonId }: IndividualDashboardProps) {
    const { toast } = useToast();
    // NOTE: This is a simplified state management for prototype purposes.
    // In a real app, you would use a global state manager (like Context, Redux, Zustand)
    // or fetch data directly to ensure consistency.
    const [salesPerson, setSalesPerson] = useState<SalesPerson | undefined>(() => getSalesPersonById(salespersonId));
    
    useEffect(() => {
        // This effect ensures that if the ID changes, we get the new data.
        // It also simulates fetching data on component mount.
        setSalesPerson(getSalesPersonById(salespersonId));
    }, [salespersonId]);

    const handleAddSale = (id: number, amount: number) => {
        setSalesPerson(prevPerson => {
            if (!prevPerson || prevPerson.id !== id) return prevPerson;
            
            const newAchieved = prevPerson.achieved + amount;
            const hasMetTargetNow = newAchieved >= prevPerson.target;
            const hadMetTargetBefore = prevPerson.achieved >= prevPerson.target;

            if (hasMetTargetNow && !hadMetTargetBefore) {
                toast({
                  title: "Meta Atingida! 🎉",
                  description: `${prevPerson.name} alcançou a meta de vendas!`,
                });
            }
            
            const today = new Date().getDate();
            const newHistory = [...prevPerson.salesHistory];
            const todayIndex = newHistory.findIndex(h => h.day === today);
            if (todayIndex !== -1) {
                newHistory[todayIndex].sales += amount;
            } else {
                newHistory.push({ day: today, sales: amount });
            }

            return { ...prevPerson, achieved: newAchieved, salesHistory: newHistory };
        });
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
                        onAddSale={handleAddSale}
                    />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <SalesTrendChart salesData={[salesPerson]} />
                </div>
            </div>
        </div>
    )
}
