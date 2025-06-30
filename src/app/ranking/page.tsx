
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerRankingDashboard from '@/components/customer-ranking-dashboard';

export default function RankingPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
       <header className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="icon" className="shrink-0">
                <Link href="/">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Ranking de Clientes</h1>
                <p className="text-muted-foreground">
                    Comparação de totais de vendas por cliente.
                </p>
            </div>
        </header>
        <CustomerRankingDashboard />
    </main>
  );
}
