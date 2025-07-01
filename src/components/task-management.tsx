
'use client';

import * as React from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ListFilter,
} from 'lucide-react';

import type { Task, Status, Category } from '@/data/tasks';
import { getTasks, deleteTask } from '@/data/tasks';
import type { User } from '@/data/users';
import { getUsers } from '@/data/users';
import type { CustomerSale } from '@/data/customers';
import { getCustomerSalesData } from '@/data/customers';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from './ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskForm } from './task-form';
import TaskUploader from './task-uploader';

const categoryLabels: Record<Category, string> = {
    inadimplencia: 'Inadimplência',
    carteira: 'Carteira',
    prospeccao: 'Prospecção',
    inativos: 'Inativos',
};

const statusLabels: Record<Status, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
};

export default function TaskManagement() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [customers, setCustomers] = React.useState<CustomerSale[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null);

  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    const [tasksData, usersData, customersData] = await Promise.all([
        getTasks(),
        getUsers(),
        getCustomerSalesData()
    ]);
    setTasks(tasksData.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
    setUsers(usersData);
    setCustomers(customersData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (task: Task | null) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const handleDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingTaskId) {
        const success = await deleteTask(deletingTaskId);
        if(success) {
            setTasks(prev => prev.filter(t => t.id !== deletingTaskId));
            toast({
                title: "Tarefa Removida!",
                description: "A tarefa foi removida com sucesso.",
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro!',
                description: "Não foi possível remover a tarefa.",
            });
        }
    }
    setIsDeleteDialogOpen(false);
    setDeletingTaskId(null);
  };

  const onFormSuccess = () => {
    fetchData(); // Refresh data after add/edit
    handleCloseForm();
  };
  
  const onUploadSuccess = () => {
    fetchData(); // Refresh data after bulk upload
  }

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const assignee = users.find(u => u.id === task.assigneeId);
      const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [tasks, searchTerm, users]);

  const getAssignee = (assigneeId: number) => users.find(u => u.id === assigneeId);

  return (
    <Tabs defaultValue="manual">
        <TabsList className="mb-4">
            <TabsTrigger value="manual">Manutenção Manual</TabsTrigger>
            <TabsTrigger value="bulk">Carregar em Massa</TabsTrigger>
        </TabsList>
        <TabsContent value="manual">
            <Card>
                <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por título, cliente, responsável..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                         <Button variant="outline" className="w-full sm:w-auto">
                            <ListFilter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                        <Button onClick={() => handleOpenForm(null)} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nova Tarefa
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredTasks.map((task) => {
                                const assignee = getAssignee(task.assigneeId);
                                return (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground">{categoryLabels[task.category]}</div>
                                    </TableCell>
                                    <TableCell>{task.clientName}</TableCell>
                                    <TableCell>
                                    {assignee && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{assignee.name}</span>
                                        </div>
                                    )}
                                    </TableCell>
                                    <TableCell>{format(parseISO(task.dueDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell><Badge variant="outline">{statusLabels[task.status]}</Badge></TableCell>
                                    <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleOpenForm(task)}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDelete(task.id)} className="text-red-600 focus:text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                    )}
                </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="bulk">
            <TaskUploader users={users} customers={customers} onUploadSuccess={onUploadSuccess} />
        </TabsContent>

        {isFormOpen && (
            <TaskForm 
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                task={editingTask}
                onSuccess={onFormSuccess}
                users={users}
                customers={customers}
            />
        )}


        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>
                        Sim, Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Tabs>
  );
}
