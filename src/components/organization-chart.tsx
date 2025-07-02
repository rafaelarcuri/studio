'use client';

import * as React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MoreVertical } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/data/users';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

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
      if (item.user.id !== user.id) {
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

const OrganizationChartInner = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [tree, setTree] = React.useState<UserNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            setUsers(usersData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar os usuários.' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [toast]);

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

  const handleDropUser = React.useCallback(async (user: User, newManagerId: number | null) => {
    const originalManagerId = user.gestor_id;
    
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, gestor_id: newManagerId || undefined } : u))
    );

    try {
        const newManager = users.find(u => u.id === newManagerId);
        const updates = {
            gestor_id: newManagerId ?? null,
            equipe_id: newManager?.equipe_id ?? null,
        };

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
  }, [toast, users]);

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
        <h2 className="text-xl font-bold mb-4">Organograma Hierárquico</h2>
        {tree.map(rootNode => (
            <ul key={rootNode.id}>
                <OrgTreeNode node={rootNode} onDropUser={handleDropUser} />
            </ul>
        ))}
        <UnassignedUsersPool users={users} onDropUser={handleDropUser} />
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
