
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import KanbanBoard from '@/components/kanban-board';


export default function TasksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center gap-4 mb-6 shrink-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Quadro de Tarefas</h1>
                <p className="text-muted-foreground">
                    Monitore e gerencie as atividades da sua equipe.
                </p>
            </div>
        </header>
        <KanbanBoard />
    </main>
  );
}
