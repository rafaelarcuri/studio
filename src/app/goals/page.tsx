
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GoalsPage() {
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
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gestão de Metas</h1>
          <p className="text-muted-foreground">
            Ajuste as metas individuais e da equipe.
          </p>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Página em Construção</CardTitle>
          <CardDescription>
            A funcionalidade de gestão de metas está sendo desenvolvida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
          <Target className="h-16 w-16 mb-4" />
          <p>Em breve você poderá gerenciar as metas aqui.</p>
        </CardContent>
      </Card>
    </main>
  );
}
