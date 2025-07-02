'use client';

import * as React from 'react';
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
} from 'lucide-react';
import Image from 'next/image';

import type { WhatsAppNumber } from '@/data/whatsapp-numbers';
import { addWhatsAppNumber, deleteWhatsAppNumber, getWhatsAppNumbers, updateWhatsAppNumberStatus } from '@/data/whatsapp-numbers';
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

const statusConfig = {
  online: { icon: CheckCircle2, color: 'bg-green-500', text: 'Online' },
  offline: { icon: XCircle, color: 'bg-gray-500', text: 'Offline' },
  expired: { icon: AlertCircle, color: 'bg-red-500', text: 'Expirado' },
  pending: { icon: RefreshCw, color: 'bg-yellow-500 animate-spin', text: 'Pendente' },
};

export default function WhatsAppManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = React.useState<WhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPairingModalOpen, setIsPairingModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [numberToDelete, setNumberToDelete] = React.useState<WhatsAppNumber | null>(null);
  const [newNumber, setNewNumber] = React.useState({ name: '', phone: '' });

  const fetchNumbers = React.useCallback(async () => {
    setIsLoading(true);
    const data = await getWhatsAppNumbers();
    setNumbers(data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const handleReconnect = async (id: string) => {
    // In a real app, this would trigger the QR code generation again
    await updateWhatsAppNumberStatus(id, 'online');
    toast({ title: 'Reconectado!', description: `A sessão para o número ${id} foi reestabelecida.` });
    fetchNumbers();
  };

  const handleDisconnect = async (id: string) => {
    await updateWhatsAppNumberStatus(id, 'offline');
    toast({ title: 'Desconectado!', description: `O número ${id} foi desconectado.` });
    fetchNumbers();
  };

  const openDeleteModal = (number: WhatsAppNumber) => {
    setNumberToDelete(number);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (numberToDelete) {
        await deleteWhatsAppNumber(numberToDelete.id);
        toast({
            variant: 'destructive',
            title: 'Número Removido',
            description: `O número ${numberToDelete.name} (${numberToDelete.id}) foi removido.`,
        });
        fetchNumbers();
    }
    setIsDeleteModalOpen(false);
    setNumberToDelete(null);
  };

  const handleAddNewNumber = async () => {
    if (!newNumber.name || !newNumber.phone) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Nome e número são obrigatórios.' });
        return;
    }
    const newEntry: Omit<WhatsAppNumber, 'docId'> = {
        id: newNumber.phone,
        name: newNumber.name,
        status: 'pending',
        lastPairedAt: new Date().toISOString(),
        pairedBy: user?.name ?? 'Admin',
    };
    await addWhatsAppNumber(newEntry);
    toast({ title: 'Escaneie o QR Code', description: `Vincule o número ${newNumber.phone} usando o app do WhatsApp.` });
    
    // Simulate pairing process
    setTimeout(() => {
        updateWhatsAppNumberStatus(newEntry.id, 'online');
        fetchNumbers();
        setIsPairingModalOpen(false);
        setNewNumber({ name: '', phone: '' });
        toast({ title: 'Número Conectado!', description: `O número ${newEntry.name} foi conectado com sucesso.` });
    }, 5000);
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
        <Button onClick={() => setIsPairingModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Novo Número
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {numbers.map((number) => {
          const SIcon = statusConfig[number.status].icon;
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
                  <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[number.status].color}`} />
                  <span className="text-sm font-medium">{statusConfig[number.status].text}</span>
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

      {/* Pairing Modal */}
      <Dialog open={isPairingModalOpen} onOpenChange={setIsPairingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Parear Novo Número</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com o app do WhatsApp para conectar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="number-name">Nome de Identificação</Label>
                <Input id="number-name" placeholder="Ex: Vendas Varejo" value={newNumber.name} onChange={(e) => setNewNumber(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number-phone">Número com DDI e DDD</Label>
                <Input id="number-phone" placeholder="+5511999998888" value={newNumber.phone} onChange={(e) => setNewNumber(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <Image src="https://placehold.co/256x256.png" width={256} height={256} alt="QR Code" data-ai-hint="qr code"/>
              </div>
              <p className="text-xs text-muted-foreground text-center">O QR Code é atualizado a cada 30 segundos.</p>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsPairingModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddNewNumber}>Conectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
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
