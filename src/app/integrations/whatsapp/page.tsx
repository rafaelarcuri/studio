'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import WhatsAppManagementPanel from '@/components/whatsapp-management-panel';
import Link from 'next/link';
import { ChevronLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhatsAppManagementPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="shrink-0">
                <Link href="/integrations">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar para Integrações</span>
                </Link>
            </Button>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Números WhatsApp</h1>
            <p className="text-muted-foreground">
                Conecte, visualize o status e gerencie os números do WhatsApp Business.
            </p>
            </div>
        </div>
        <Button asChild>
            <Link href="/integrations/whatsapp/flow">
                <Bot className="mr-2 h-4 w-4" />
                Configurar Fluxo de Atendimento
            </Link>
        </Button>
      </header>
      <WhatsAppManagementPanel />
    </main>
  );
}
