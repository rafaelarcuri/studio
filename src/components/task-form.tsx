
'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Task, Category, Status, Priority } from "@/data/tasks";
import { addTask, updateTask } from "@/data/tasks";
import type { User } from "@/data/users";
import type { CustomerSale } from "@/data/customers";

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    task: Task | null;
    users: User[];
    customers: CustomerSale[];
}

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  assigneeId: z.coerce.number({ required_error: "Selecione um responsável." }),
  clientId: z.coerce.number({ required_error: "Selecione um cliente." }),
  dueDate: z.date({ required_error: "A data de vencimento é obrigatória." }),
  category: z.enum(['inadimplencia', 'carteira', 'prospeccao', 'inativos'], { required_error: "Selecione uma categoria." }),
  status: z.enum(['pendente', 'em_andamento', 'concluida'], { required_error: "Selecione um status." }),
  priority: z.enum(['low', 'medium', 'high'], { required_error: "Selecione uma prioridade." }),
});

export function TaskForm({ isOpen, onClose, task, onSuccess, users, customers }: TaskFormProps) {
    const { toast } = useToast();
    
    const defaultValues = React.useMemo(() => ({
        title: task?.title || "",
        assigneeId: task?.assigneeId,
        clientId: task?.clientId,
        dueDate: task ? new Date(task.dueDate) : new Date(),
        category: task?.category || undefined,
        status: task?.status || 'pendente',
        priority: task?.priority || 'medium',
    }), [task]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });
    
    React.useEffect(() => {
        form.reset(defaultValues);
    }, [task, defaultValues, form]);


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const customer = customers.find(c => c.id === values.clientId);
        if (!customer) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Cliente não encontrado.' });
            return;
        }
        
        const taskData = {
            ...values,
            dueDate: format(values.dueDate, 'yyyy-MM-dd'),
            clientName: customer.name,
            clientPhone: customer.phone,
            commentsCount: task?.commentsCount || 0,
        };

        let success = false;
        if (task) {
            // Update existing task
            success = await updateTask(task.id, taskData);
        } else {
            // Add new task
            const newId = await addTask(taskData);
            success = !!newId;
        }

        if (success) {
            toast({
                title: `Tarefa ${task ? 'Atualizada' : 'Criada'}!`,
                description: `A tarefa "${values.title}" foi salva com sucesso.`,
            });
            onSuccess();
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro!',
                description: `Não foi possível salvar a tarefa.`,
            });
        }
    };
    
    const salespersons = users.filter(u => u.role === 'vendedor');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da tarefa e atribua a um responsável.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título da Tarefa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Ligar para o cliente para negociar débito" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Responsável</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {salespersons.map(user => (
                                                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map(customer => (
                                                    <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data de Vencimento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                    format(field.value, "PPP", { locale: ptBR })
                                                    ) : (
                                                    <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="inadimplencia">Inadimplência</SelectItem>
                                                <SelectItem value="carteira">Carteira</SelectItem>
                                                <SelectItem value="prospeccao">Prospecção</SelectItem>
                                                <SelectItem value="inativos">Inativos</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                                <SelectItem value="concluida">Concluída</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baixa</SelectItem>
                                                <SelectItem value="medium">Média</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button type="submit">Salvar Tarefa</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
