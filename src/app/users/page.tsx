
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import UserManagement from '@/components/user-management';

export default function UserManagementPage() {
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
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Button asChild variant="outline" size="icon" className="shrink-0">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
                    <p className="text-muted-foreground">
                        Visualize, edite e gerencie as permissões dos usuários da plataforma.
                    </p>
                </div>
            </header>
            <UserManagement />
        </main>
    );
}
