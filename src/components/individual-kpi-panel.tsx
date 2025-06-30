
'use client';

import { DollarSign, Percent, Receipt, Target, TrendingDown, TrendingUp, UserPlus, Users } from "lucide-react";
import type { SalesPerson } from "@/data/sales";
import { Card } from "@/components/ui/card";

interface IndividualKpiPanelProps {
    salesPerson: SalesPerson;
}

const KpiCard = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: React.ReactNode }) => (
    <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Icon className="h-4 w-4" />
            <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <p className="text-2xl font-bold">{value}</p>
    </Card>
);

export function IndividualKpiPanel({ salesPerson }: IndividualKpiPanelProps) {
    const { target, achieved, margin, positivations, inadimplencia, newRegistrations } = salesPerson;
    const remaining = Math.max(0, target - achieved);
    const averageTicket = positivations.achieved > 0 ? achieved / positivations.achieved : 0;
    const inadimplenciaValor = achieved * (inadimplencia / 100);

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <KpiCard
                icon={Target}
                title="Meta"
                value={formatCurrency(target)}
            />
            <KpiCard
                icon={DollarSign}
                title="Vendido"
                value={formatCurrency(achieved)}
            />
            <KpiCard
                icon={TrendingUp}
                title="Restante"
                value={formatCurrency(remaining)}
            />
            <KpiCard
                icon={Percent}
                title="% Margem"
                value={`${margin.toFixed(1).replace('.',',')}%`}
            />
             <KpiCard
                icon={Users}
                title="Positivação"
                value={`${positivations.achieved} / ${positivations.target}`}
            />
            <KpiCard
                icon={UserPlus}
                title="Novos Cadastros"
                value={`${newRegistrations.achieved} / ${newRegistrations.target}`}
            />
             <KpiCard
                icon={TrendingDown}
                title="Inadimplência (%)"
                value={`${inadimplencia.toFixed(1).replace('.',',')}%`}
            />
             <KpiCard
                icon={TrendingDown}
                title="Inadimplência (R$)"
                value={formatCurrency(inadimplenciaValor)}
            />
             <KpiCard
                icon={Receipt}
                title="Ticket Médio"
                value={formatCurrency(averageTicket)}
            />
        </div>
    );
}
