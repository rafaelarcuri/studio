
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import SalesDashboard from '@/components/sales-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    } else if (user?.role === 'vendedor') {
      router.replace(`/sales/${user.salesPersonId}`);
    }
  }, [user, isLoading, router]);

  // Show a loading state or a blank screen while redirecting
  if (isLoading || !user || user.role !== 'gerente') {
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

  // Only render the main dashboard for managers
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SalesDashboard />
    </main>
  );
}
