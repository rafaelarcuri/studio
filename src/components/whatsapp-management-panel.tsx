'use client';

import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Phone,
  PlusCircle,
  PowerOff,
  RefreshCw,
  Trash2,
  XCircle,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

import type { WhatsAppNumber } from '@/data/whatsapp-numbers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from './ui/input';
import { Label } from './ui/label';

const BACKEND_URL = process.env.NEXT_PUBLIC_WHATSAPP_BACKEND_URL || 'http://localhost:3000';

const statusConfig = {
  online: { icon: CheckCircle2, color: 'bg-green-500', text: 'Online' },
  offline: { icon: XCircle, color: 'bg-gray-500', text: 'Offline' },
  expired: { icon: AlertCircle, color: 'bg-red-500', text: 'Expirado' },
  pending: { icon: RefreshCw, color: 'bg-yellow-500', text: 'Pendente' },
};

export default function WhatsAppManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = React.useState<WhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPairingModalOpen, setIsPairingModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [numberToDelete, setNumberToDelete] = React.useState<WhatsAppNumber | null>(null);
  
  const [pairingStep, setPairingStep] = React.useState<'form' | 'qr'>('form');
  const [pairingData, setPairingData] = React.useState({ name: '', phone: '' });
  const [qrCode, setQrCode] = React.useState('');
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  const fetchNumbers = React.useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/numbers');
      if (!response.ok) throw new Error('Failed to fetch numbers');
      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro de Rede', description: 'Não foi possível buscar os números do WhatsApp.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchNumbers();
    
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('qr', ({ number, qr }) => {
      setQrCode(qr);
      setPairingStep('qr');
      setIsConnecting(false);
      toast({ title: 'Escaneie o QR Code', description: `Vincule o número ${number} usando o app do WhatsApp.` });
    });

    newSocket.on('ready', ({ number: readyNumber }) => {
      toast({ title: 'Número Conectado!', description: `O número ${readyNumber.name} foi conectado com sucesso.` });
      fetchNumbers();
      setIsPairingModalOpen(false);
    });

    newSocket.on('pairing-error', ({ message }) => {
      toast({ variant: 'destructive', title: 'Erro de Pareamento', description: message });
      setIsConnecting(false);
    });

    newSocket.on('status-update', ({ number: updatedNumber }) => {
        setNumbers(prev => prev.map(n => n.id === updatedNumber.id ? updatedNumber : n));
    });

    newSocket.on('number-deleted', ({ id }) => {
        setNumbers(prev => prev.filter(n => n.id !== id));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchNumbers, toast]);
  
  const updateStatus = async (id: string, status: WhatsAppNumber['status']) => {
    try {
        const response = await fetch(`/api/whatsapp/numbers/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error(`Failed to update status`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
  }

  const handleReconnect = async (id: string) => {
    toast({ title: 'Reconectando...', description: `Iniciando nova sessão para o número ${id}.` });
    const success = await updateStatus(id, 'online');
    if (success) {
      toast({ title: 'Reconectado!', description: `A sessão foi reestabelecida.` });
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: `Não foi possível reconectar.` });
    }
  };

  const handleDisconnect = async (id: string) => {
    const success = await updateStatus(id, 'offline');
    if (success) {
        toast({ title: 'Desconectado!', description: `O número ${id} foi desconectado.` });
    } else {
        toast({ variant: 'destructive', title: 'Erro!', description: `Não foi possível desconectar.` });
    }
  };

  const openDeleteModal = (number: WhatsAppNumber) => {
    setNumberToDelete(number);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (numberToDelete) {
        try {
            const response = await fetch(`/api/whatsapp/numbers/${numberToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            toast({
                variant: 'destructive',
                title: 'Número Removido',
                description: `O número ${numberToDelete.name} (${numberToDelete.id}) foi removido.`,
            });
            // The socket 'number-deleted' event will update the state
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro!', description: `Não foi possível remover o número.` });
        }
    }
    setIsDeleteModalOpen(false);
    setNumberToDelete(null);
  };
  
  const openPairingModal = () => {
    setPairingData({ name: '', phone: '' });
    setPairingStep('form');
    setQrCode('');
    setIsConnecting(false);
    setIsPairingModalOpen(true);
  }

  const handleInitiatePairing = async () => {
    if (!pairingData.name || !pairingData.phone) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Nome e número são obrigatórios.' });
        return;
    }
    if (!socket) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Conexão com o servidor não estabelecida.' });
        return;
    }
    setIsConnecting(true);
    socket.emit('start-session', { ...pairingData, pairedBy: user?.name ?? 'Admin' });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openPairingModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Novo Número
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {numbers.map((number) => {
          const SIcon = statusConfig[number.status]?.icon || AlertCircle;
          return (
            <Card key={number.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {number.name}
                  </CardTitle>
                  <CardDescription>{number.id}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleReconnect(number.id)} disabled={number.status === 'online'}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Reconectar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDisconnect(number.id)} disabled={number.status !== 'online'}>
                        <PowerOff className="mr-2 h-4 w-4" /> Desconectar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => openDeleteModal(number)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[number.status]?.color || 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">{statusConfig[number.status]?.text || 'Desconhecido'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pareado por {number.pairedBy} em {format(new Date(number.lastPairedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" variant="secondary" onClick={() => handleReconnect(number.id)} disabled={number.status === 'online'}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {number.status === 'expired' ? 'Reparear Agora' : 'Reconectar'}
                 </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isPairingModalOpen} onOpenChange={setIsPairingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Parear Novo Número</DialogTitle>
             <DialogDescription>
              {pairingStep === 'form' 
                ? "Preencha os dados do número para gerar o QR Code de conexão." 
                : "Escaneie o QR Code com o app do WhatsApp para conectar."}
            </DialogDescription>
          </DialogHeader>
          
          {pairingStep === 'form' && (
             <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="number-name">Nome de Identificação</Label>
                <Input id="number-name" placeholder="Ex: Vendas Varejo" value={pairingData.name} onChange={(e) => setPairingData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number-phone">Número com DDI e DDD</Label>
                <Input id="number-phone" placeholder="+5511999998888" value={pairingData.phone} onChange={(e) => setPairingData(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
          )}

          {pairingStep === 'qr' && (
            <div className="py-4">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                {isConnecting ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : qrCode ? (
                    <Image src={qrCode} width={256} height={256} alt="QR Code" data-ai-hint="qr code"/>
                ) : (
                    <Skeleton className="h-64 w-64" />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Aguardando leitura... O QR Code expira em breve.</p>
            </div>
          )}

          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsPairingModalOpen(false)}>Cancelar</Button>
             {pairingStep === 'form' && (
                <Button onClick={handleInitiatePairing} disabled={isConnecting}>
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar QR Code
                </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                <AlertDialogDescription>
                    Você tem certeza que deseja remover o número {numberToDelete?.name} ({numberToDelete?.id})? Esta ação não pode ser desfeita e irá interromper o atendimento por este canal.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                    Sim, Remover
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
