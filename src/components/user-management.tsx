
'use client';

import * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  Download,
  Edit,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash,
  UserX,
  UserCheck
} from 'lucide-react';

import { users as initialUsers, updateUser, setUserStatus, type User } from '@/data/users';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';

const editFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  position: z.string().min(2, { message: "O cargo é obrigatório." }),
  team: z.string().min(2, { message: "A equipe é obrigatória." }),
  role: z.enum(["vendedor", "gerente"]),
});

export default function UserManagement() {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState({ role: 'all', status: 'all' });

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false);
  const [statusChangeUser, setStatusChangeUser] = React.useState<User | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
        name: user.name,
        email: user.email,
        position: user.position,
        team: user.team,
        role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (user: User) => {
    setStatusChangeUser(user);
    setIsStatusDialogOpen(true);
  };
  
  const confirmStatusChange = () => {
    if (statusChangeUser) {
        const newStatus = statusChangeUser.status === 'ativo' ? 'inativo' : 'ativo';
        setUserStatus(statusChangeUser.id, newStatus);
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === statusChangeUser.id ? { ...u, status: newStatus } : u
            )
        );
        toast({
            title: "Status do Usuário Alterado!",
            description: `O status de ${statusChangeUser.name} foi alterado para ${newStatus}.`,
        });
    }
    setIsStatusDialogOpen(false);
    setStatusChangeUser(null);
  };

  const onSubmit = (values: z.infer<typeof editFormSchema>) => {
    if (editingUser) {
        updateUser(editingUser.id, values);
        setUsers(prevUsers =>
            prevUsers.map(u => (u.id === editingUser.id ? { ...u, ...values } : u))
        );
        toast({
            title: "Usuário Atualizado!",
            description: `Os dados de ${values.name} foram salvos com sucesso.`,
        });
    }
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = filters.role === 'all' || user.role === filters.role;
      const statusMatch = filters.status === 'all' || user.status === filters.status;
      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, searchTerm, filters]);

  const handleExport = () => {
    const csvRows = [
        "ID,Nome,Email,Cargo,Time,Tipo de Acesso,Status"
    ];
    filteredUsers.forEach(user => {
        const row = [
            user.id,
            `"${user.name}"`,
            `"${user.email}"`,
            `"${user.position}"`,
            `"${user.team}"`,
            `"${user.role}"`,
            `"${user.status}"`
        ].join(',');
        csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportação Iniciada', description: 'O download do arquivo CSV foi iniciado.' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nome ou e-mail..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                        Função: {filters.role === 'all' ? 'Todas' : filters.role} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, role: 'all'}))}>Todas</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, role: 'gerente'}))}>Gerente</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, role: 'vendedor'}))}>Vendedor</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                        Status: {filters.status === 'all' ? 'Todos' : filters.status} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, status: 'all'}))}>Todos</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, status: 'ativo'}))}>Ativo</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilters(f => ({...f, status: 'inativo'}))}>Inativo</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleExport} variant="secondary" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
            </Button>
            <Button onClick={() => router.push('/sales/new')} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Usuário
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.team}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                        <Badge variant={user.status === 'ativo' ? 'default' : 'destructive'} className={user.status === 'ativo' ? 'bg-green-600' : ''}>
                            {user.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'ativo' ? (
                                <DropdownMenuItem onSelect={() => handleStatusChange(user)} className="text-red-600 focus:text-red-600">
                                    <UserX className="mr-2 h-4 w-4" /> Desativar
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onSelect={() => handleStatusChange(user)} className="text-green-600 focus:text-green-600">
                                    <UserCheck className="mr-2 h-4 w-4" /> Ativar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                    <DialogDescription>
                        Altere os dados do usuário. Clique em salvar para aplicar as mudanças.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="position" render={({ field }) => (<FormItem><FormLabel>Cargo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="team" render={({ field }) => (<FormItem><FormLabel>Time/Setor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Função (Tipo de Acesso)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="vendedor">Vendedor</SelectItem>
                                        <SelectItem value="gerente">Gerente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Alterações</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Deactivate/Activate Confirmation Dialog */}
        <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Alteração de Status</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você tem certeza que deseja {statusChangeUser?.status === 'ativo' ? 'desativar' : 'ativar'} o usuário {statusChangeUser?.name}?
                        {statusChangeUser?.status === 'ativo' && " Ele perderá o acesso ao sistema."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmStatusChange}>
                        Sim, {statusChangeUser?.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}
