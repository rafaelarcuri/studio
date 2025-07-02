
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import AnalyticsDashboard from '@/components/analytics-dashboard';

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'gerente') {
      router.replace(`/`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'gerente') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Análise de Produtividade</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e a eficiência da sua equipe.
          </p>
        </div>
      </header>
      <AnalyticsDashboard />
    </main>
  );
}
