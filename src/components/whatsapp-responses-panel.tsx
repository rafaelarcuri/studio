
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';

import type { AutomatedMessage, QuickReply } from '@/data/whatsapp-responses';
import {
  getAutomatedMessages,
  getQuickReplies,
  updateAutomatedMessage,
  addQuickReply,
  updateQuickReply,
  deleteQuickReply
} from '@/data/whatsapp-responses';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from './ui/skeleton';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';


const quickReplySchema = z.object({
  shortcut: z.string().startsWith('/', { message: "O atalho deve começar com /" }).min(2, "O atalho deve ter pelo menos 2 caracteres."),
  message: z.string().min(5, "A mensagem deve ter pelo menos 5 caracteres."),
});


const AutomatedMessageCard = ({ messageData }: { messageData: AutomatedMessage }) => {
    const [message, setMessage] = React.useState(messageData.message);
    const [isEnabled, setIsEnabled] = React.useState(messageData.enabled);
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        setIsSaving(true);
        await updateAutomatedMessage(messageData.id, { message, enabled: isEnabled });
        setIsSaving(false);
        toast({ title: "Mensagem Atualizada!", description: `A ${messageData.title.toLowerCase()} foi salva.` });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{messageData.title}</CardTitle>
                        <CardDescription>{messageData.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id={`switch-${messageData.id}`} checked={isEnabled} onCheckedChange={setIsEnabled} />
                        <Label htmlFor={`switch-${messageData.id}`}>{isEnabled ? 'Ativa' : 'Inativa'}</Label>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Digite sua mensagem aqui..."
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Mensagem
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function WhatsAppResponsesPanel() {
  const [automatedMessages, setAutomatedMessages] = React.useState<AutomatedMessage[]>([]);
  const [quickReplies, setQuickReplies] = React.useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReply, setEditingReply] = React.useState<QuickReply | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingReplyId, setDeletingReplyId] = React.useState<string | null>(null);
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof quickReplySchema>>({
    resolver: zodResolver(quickReplySchema),
    defaultValues: { shortcut: "", message: "" }
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    const [autoMsgs, quickReps] = await Promise.all([
      getAutomatedMessages(),
      getQuickReplies(),
    ]);
    setAutomatedMessages(autoMsgs);
    setQuickReplies(quickReps.sort((a, b) => a.shortcut.localeCompare(b.shortcut)));
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (reply: QuickReply | null) => {
    setEditingReply(reply);
    form.reset(reply ? { shortcut: reply.shortcut, message: reply.message } : { shortcut: "/", message: "" });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingReply(null);
    setIsFormOpen(false);
  };

  const handleDelete = (replyId: string) => {
    setDeletingReplyId(replyId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingReplyId) {
        await deleteQuickReply(deletingReplyId);
        toast({ title: "Resposta Rápida Removida" });
        await fetchData(); // Refresh data
    }
    setIsDeleteDialogOpen(false);
    setDeletingReplyId(null);
  };

  const onFormSubmit = async (values: z.infer<typeof quickReplySchema>) => {
    let success = false;
    if (editingReply) {
        success = await updateQuickReply(editingReply.id, values);
    } else {
        const newReply = await addQuickReply(values);
        success = !!newReply;
    }
    
    if (success) {
        toast({ title: `Resposta Rápida ${editingReply ? 'Atualizada' : 'Criada'}!` });
        await fetchData(); // Refresh
        handleCloseForm();
    } else {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a resposta.' });
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {automatedMessages.map(msg => <AutomatedMessageCard key={msg.id} messageData={msg} />)}

      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle>Respostas Rápidas (Atalhos)</CardTitle>
            <CardDescription>Crie atalhos para enviar mensagens usadas com frequência.</CardDescription>
          </div>
          <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Atalho
          </Button>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Atalho</TableHead>
                            <TableHead>Mensagem</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quickReplies.map(reply => (
                            <TableRow key={reply.id}>
                                <TableCell className="font-mono font-medium">{reply.shortcut}</TableCell>
                                <TableCell className="text-muted-foreground">{reply.message}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(reply)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(reply.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {quickReplies.length === 0 && (
                    <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma resposta rápida encontrada.</p>
                )}
            </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingReply ? 'Editar Resposta Rápida' : 'Adicionar Resposta Rápida'}</DialogTitle>
                <DialogDescription>
                    Preencha o atalho e a mensagem. O atalho será usado para acionar a mensagem rapidamente no chat.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
                     <FormField
                        control={form.control}
                        name="shortcut"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Atalho</FormLabel>
                                <FormControl>
                                    <Input placeholder="/atalho" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mensagem Completa</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} placeholder="Digite a mensagem completa a ser enviada..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleCloseForm}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                    Você tem certeza que deseja excluir esta resposta rápida? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                    Sim, Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
