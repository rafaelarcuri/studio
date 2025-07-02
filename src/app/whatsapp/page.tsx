
'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import WhatsAppChat from '@/components/whatsapp-chat';
import type { WhatsAppNumber } from '@/data/whatsapp-numbers';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function WhatsAppPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = React.useState<'online' | 'offline'>('offline');
  const [isLoadingStatus, setIsLoadingStatus] = React.useState(true);

  useEffect(() => {
    const checkStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const response = await fetch('/api/whatsapp/numbers');
            if (!response.ok) {
                throw new Error('Failed to fetch numbers');
            }
            const numbers: WhatsAppNumber[] = await response.json();
            const isAnyOnline = numbers.some(n => n.status === 'online');
            setConnectionStatus(isAnyOnline ? 'online' : 'offline');
        } catch (error) {
            console.error("Failed to check WhatsApp status:", error);
            setConnectionStatus('offline'); // Default to offline on error
        } finally {
            setIsLoadingStatus(false);
        }
    };
    checkStatus();
  }, []);

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
        <div className="flex justify-between items-center">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex h-[calc(100vh-theme(spacing.40))] border rounded-lg">
            <Skeleton className="w-full md:w-1/3 lg:w-1/4 h-full border-r" />
            <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Central de Atendimento</h1>
                {isLoadingStatus ? (
                    <Skeleton className="h-6 w-28" />
                ) : (
                    <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'} className={connectionStatus === 'online' ? 'bg-green-600' : ''}>
                        {connectionStatus === 'online' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                        {connectionStatus === 'online' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                )}
            </div>
          <p className="text-muted-foreground">
            Gerencie suas conversas do WhatsApp em um único lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
            {(isLoading || isLoadingStatus) ? (
                <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
                user && (
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )
            )}
        </div>
      </header>
      <WhatsAppChat />
    </main>
  );
}
