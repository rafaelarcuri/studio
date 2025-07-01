
'use client';

import { DollarSign, Percent, Receipt, Target, TrendingDown, TrendingUp, UserPlus, Users, CheckCircle, XCircle } from "lucide-react";
import type { SalesPerson } from "@/data/sales";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IndividualKpiPanelProps {
    salesPerson: SalesPerson;
}

const KpiCard = ({ icon: Icon, title, value, footer }: { icon: React.ElementType; title: string; value: React.ReactNode; footer?: React.ReactNode }) => (
    <Card className="p-4 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className="h-4 w-4" />
                <h3 className="text-sm font-medium">{title}</h3>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        {footer && <div className="text-xs text-muted-foreground mt-2">{footer}</div>}
    </Card>
);

export function IndividualKpiPanel({ salesPerson }: IndividualKpiPanelProps) {
    const { target, achieved, margin, positivations, inadimplencia, newRegistrations } = salesPerson;
    const remaining = Math.max(0, target - achieved);
    const averageTicket = positivations.achieved > 0 ? achieved / positivations.achieved : 0;
    const inadimplenciaValor = achieved * (inadimplencia / 100);

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Sales Projection Logic
    const today = new Date();
    const currentDay = today.getDate();
    const safeCurrentDay = Math.max(1, currentDay);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    let projectedSales = 0;
    let willReachTarget = false;

    if (achieved > 0 && currentDay < daysInMonth) {
        const dailyAverage = achieved / safeCurrentDay;
        projectedSales = dailyAverage * daysInMonth;
        willReachTarget = projectedSales >= target;
    } else if (achieved >= target) {
        projectedSales = achieved;
        willReachTarget = true;
    }

    const predictionFooter = (
        <div className="flex items-center gap-1.5">
            {willReachTarget ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
                <XCircle className="h-4 w-4 text-red-500" />
            )}
            <div>
                <span className="font-semibold">Projeção:</span>
                <span className={cn("font-bold ml-1", willReachTarget ? "text-green-600" : "text-red-600")}>
                    {formatCurrency(projectedSales)}
                </span>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
                icon={Target}
                title="Meta"
                value={formatCurrency(target)}
            />
            <KpiCard
                icon={DollarSign}
                title="Vendido"
                value={formatCurrency(achieved)}
                footer={predictionFooter}
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
