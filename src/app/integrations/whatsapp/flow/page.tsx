'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import WhatsAppFlowBuilder from '@/components/whatsapp-flow-builder';

export default function WhatsAppFlowPage() {
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
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
         <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link href="/integrations/whatsapp">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar para Gerenciamento do WhatsApp</span>
            </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            Editor de Fluxo de Atendimento
          </h1>
          <p className="text-muted-foreground">
            Modele o fluxo inicial do chatbot que interage com o cliente antes do atendimento humano.
          </p>
        </div>
      </header>
      <WhatsAppFlowBuilder />
    </main>
  );
}
