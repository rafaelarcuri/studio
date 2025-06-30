
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import NewSalespersonForm from '@/components/new-salesperson-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewSalespersonPage() {
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
            <div className="p-8 max-w-2xl mx-auto space-y-8">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <main className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Button asChild variant="outline" size="icon" className="shrink-0">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Adicionar Novo Vendedor</h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para cadastrar um novo membro na equipe.
                    </p>
                </div>
            </header>
            <NewSalespersonForm />
        </main>
    );
}
