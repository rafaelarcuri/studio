
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerRankingDashboard from '@/components/customer-ranking-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function RankingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'gerente') {
      router.replace(`/sales/${user.salesPersonId}`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'gerente') {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
       <header className="flex items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Ranking de Clientes</h1>
                <p className="text-muted-foreground">
                    Comparação de totais de vendas por cliente.
                </p>
            </div>
        </header>
        <CustomerRankingDashboard />
    </main>
  );
}
