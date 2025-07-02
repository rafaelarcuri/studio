'use client';

import * as React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/data/users';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


type UserNode = User & { children: UserNode[] };

const ItemTypes = {
  USER: 'user',
};

const DraggableUserCard = ({ user, onDropUser }: { user: UserNode; onDropUser: (draggedUser: User, newManagerId: number | null) => void; }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.USER,
    item: { user },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.USER,
    drop: (item: { user: User }) => {
      if (item.user.id !== user.id && item.user.gestor_id !== user.id) {
        onDropUser(item.user, user.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [user, onDropUser]);

  return (
    <Card ref={(node) => drag(drop(node))} className={cn("p-2 mb-2 w-72 cursor-move", isDragging && "opacity-50", isOver && "ring-2 ring-primary")}>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.online && (
                   <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                )}
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.position}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
    </Card>
  );
};

const OrgTreeNode = ({ node, onDropUser }: { node: UserNode, onDropUser: (draggedUser: User, newManagerId: number | null) => void; }) => {
  const isRoot = !node.gestor_id;
  return (
    <li className="relative list-none">
      <DraggableUserCard user={node} onDropUser={onDropUser} />
      {node.children && node.children.length > 0 && (
        <ul className="pl-12 pt-2 relative before:content-[''] before:absolute before:left-6 before:top-0 before:h-full before:w-px before:bg-border">
          {node.children.map((child) => (
             <OrgTreeNode key={child.id} node={child} onDropUser={onDropUser} />
          ))}
        </ul>
      )}
      {!isRoot && <div className="absolute left-6 top-8 h-px w-6 bg-border"></div>}
    </li>
  );
};

const UnassignedUsersPool = ({ users, onDropUser }: { users: User[]; onDropUser: (user: User, newManagerId: number | null) => void }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.USER,
      drop: (item: { user: User }) => onDropUser(item.user, null),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }), [onDropUser]);
  
    const unassigned = users.filter((u) => u.gestor_id === undefined || u.gestor_id === null);

    if (unassigned.length === 0) return null;

    return (
        <div ref={drop} className={cn("mt-10 p-4 border-2 border-dashed rounded-lg", isOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/30')}>
            <h3 className="font-bold text-lg text-destructive mb-4">Usuários sem Equipe</h3>
            <div className="flex flex-wrap gap-4 min-h-24">
                {unassigned.map((user) => (
                    <DraggableUserCard key={user.id} user={{...user, children: []}} onDropUser={onDropUser} />
                ))}
            </div>
        </div>
    );
};

const createTeamFormSchema = z.object({
  nome: z.string().min(2, { message: "O nome da equipe deve ter pelo menos 2 caracteres." }),
  gestor_id: z.coerce.number({ required_error: "É necessário selecionar um gestor." }),
});


const OrganizationChartInner = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [allUsersForForm, setAllUsersForForm] = React.useState<User[]>([]);
  const [tree, setTree] = React.useState<UserNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData);
        setAllUsersForForm(usersData);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar os usuários.' });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (users.length > 0) {
      const buildTree = (usersList: User[]): UserNode[] => {
        const userMap = new Map<number, UserNode>();
        usersList.forEach(user => userMap.set(user.id, { ...user, children: [] }));

        const treeData: UserNode[] = [];
        usersList.forEach(user => {
          if (user.gestor_id && userMap.has(user.gestor_id)) {
            const parent = userMap.get(user.gestor_id);
            const child = userMap.get(user.id);
            if (parent && child) {
              parent.children.push(child);
            }
          } else {
            const rootNode = userMap.get(user.id);
            if (rootNode) {
              treeData.push(rootNode);
            }
          }
        });
        return treeData;
      };
      setTree(buildTree(users));
    }
  }, [users]);

  const form = useForm<z.infer<typeof createTeamFormSchema>>({
    resolver: zodResolver(createTeamFormSchema),
  });

  const handleCreateTeamSubmit = async (values: z.infer<typeof createTeamFormSchema>) => {
    try {
        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao criar equipe.');
        }

        const newTeam = await response.json();
        toast({ title: "Equipe Criada!", description: `A equipe "${newTeam.nome}" foi criada com sucesso.`});
        setIsCreateTeamModalOpen(false);
        fetchData(); // Refetch data to update the UI if needed
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível criar a equipe.' });
    }
  };

  const handleDropUser = React.useCallback(async (user: User, newManagerId: number | null) => {
    const originalManagerId = user.gestor_id;
    
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, gestor_id: newManagerId || undefined } : u))
    );

    try {
        const updates = { gestor_id: newManagerId ?? null };

        const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Falha ao atualizar usuário.');
        toast({ title: "Usuário Movido!", description: `${user.name} foi movido com sucesso.`});
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível mover o usuário. Revertendo.' });
        setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === user.id ? { ...u, gestor_id: originalManagerId } : u))
        );
    }
  }, [toast]);

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-20 w-72" />
            <div className="pl-12">
                <Skeleton className="h-20 w-72" />
            </div>
        </div>
    );
  }
  
  return (
    <div className="p-1">
        <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Organograma Hierárquico</h2>
             <Button onClick={() => setIsCreateTeamModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Equipe
            </Button>
        </header>
        {tree.map(rootNode => (
            <ul key={rootNode.id}>
                <OrgTreeNode node={rootNode} onDropUser={handleDropUser} />
            </ul>
        ))}
        <UnassignedUsersPool users={users} onDropUser={handleDropUser} />

        <Dialog open={isCreateTeamModalOpen} onOpenChange={setIsCreateTeamModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Equipe</DialogTitle>
                    <DialogDescription>
                        Defina um nome para a nova equipe e selecione um gestor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateTeamSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Equipe</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Varejo Interior" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="gestor_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gestor da Equipe</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione um gestor" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allUsersForForm.map(user => (
                                                <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsCreateTeamModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Equipe</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default function OrganizationChart() {
    return (
        <DndProvider backend={HTML5Backend}>
            <OrganizationChartInner />
        </DndProvider>
    );
}
