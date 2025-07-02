
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import OrganizationChart from '@/components/organization-chart';
import { Network } from 'lucide-react';

export default function OrganizationPage() {
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
      <div className="p-8 max-w-full mx-auto space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Network className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Organograma da Equipe</h1>
          <p className="text-muted-foreground">
            Visualize a estrutura hierárquica e a distribuição de responsabilidades.
          </p>
        </div>
      </header>
      <OrganizationChart />
    </main>
  );
}
