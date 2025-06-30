
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import IndividualDashboard from '@/components/individual-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function IndividualSalesPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericId = parseInt(id, 10);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        // A manager can view any page, but a salesperson can only view their own.
        if (user.role === 'vendedor' && user.salesPersonId !== numericId) {
            // Redirect to their own page if they try to access another
            router.replace(`/sales/${user.salesPersonId}`);
        }

    }, [user, isLoading, router, numericId]);

    // Basic validation for the ID
    if (isNaN(numericId)) {
        return (
            <main className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Vendedor não encontrado</h1>
                    <p className="text-muted-foreground">O ID fornecido não é válido.</p>
                </div>
            </main>
        )
    }

    if (isLoading || !user || (user.role === 'vendedor' && user.salesPersonId !== numericId)) {
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

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <IndividualDashboard salespersonId={numericId} />
        </main>
    );
}
