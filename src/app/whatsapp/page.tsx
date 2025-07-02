'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import WhatsAppChat from '@/components/whatsapp-chat';

export default function WhatsAppPage() {
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
        <div className="flex h-[calc(100vh-theme(spacing.40))] border rounded-lg">
            <Skeleton className="w-full md:w-1/3 lg:w-1/4 h-full border-r" />
            <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Central de Atendimento</h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas do WhatsApp em um único lugar.
          </p>
        </div>
      </header>
      <WhatsAppChat />
    </main>
  );
}
