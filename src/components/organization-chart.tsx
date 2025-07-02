'use client';

import * as React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Identifier } from 'dnd-core';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/data/users';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

type Team = {
    id: string;
    nome: string;
    gestor_id: number;
    gestor_master_id: number;
};

const ItemTypes = {
  USER: 'user',
};

const DraggableUserCard = ({ user }: { user: User }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.USER,
    item: { user },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card className="p-2 mb-2 text-center">
        <Avatar className="w-12 h-12 mx-auto">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-bold mt-2 text-sm">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.position}</p>
        <span className={cn('text-xs', user.online ? 'text-green-600' : 'text-red-500')}>
            {user.online ? 'Online' : 'Offline'}
        </span>
      </Card>
    </div>
  );
};

const TeamNode = ({ gestor, membros, onDropUser, equipeId }: { gestor: User; membros: User[]; onDropUser: (user: User, novaEquipeId: string) => void; equipeId: string }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.USER,
    drop: (item: { user: User }) => onDropUser(item.user, equipeId),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [gestor, equipeId, onDropUser]);

  return (
    <div ref={drop} className={cn('border-l-2 pl-4 ml-4', isOver ? 'bg-primary/10' : '')}>
      <div className="bg-muted p-2 rounded text-center mb-2">
        <p className="font-semibold">{gestor.name}</p>
        <p className="text-sm text-muted-foreground">{gestor.position}</p>
      </div>
      <div className="ml-4">
        {membros.map((m) => (
          <DraggableUserCard key={m.id} user={m} />
        ))}
      </div>
    </div>
  );
};

const UnassignedUsersPool = ({ users, onDropUser }: { users: User[], onDropUser: (user: User, novaEquipeId: string | null) => void }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.USER,
      drop: (item: { user: User }) => onDropUser(item.user, null),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }), [onDropUser]);
  
    return (
        <Card ref={drop} className={cn("mt-10", isOver ? 'border-primary' : '')}>
            <CardHeader>
                <h3 className="font-bold text-lg text-destructive">Usuários sem Equipe</h3>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 min-h-24">
                {users.filter((u) => !u.equipe_id).map((user) => (
                    <DraggableUserCard key={user.id} user={user} />
                ))}
            </CardContent>
      </Card>
    );
};


const OrganizationChartInner = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [usersRes, teamsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/teams'),
            ]);
            const usersData = await usersRes.json();
            const teamsData = await teamsRes.json();
            setUsers(usersData);
            setTeams(teamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar os dados do organograma.' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const handleDropUser = React.useCallback(async (user: User, novaEquipeId: string | null) => {
    if (user.equipe_id === novaEquipeId) return;

    const originalEquipeId = user.equipe_id;
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, equipe_id: novaEquipeId || undefined } : u))
    );

    try {
        const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipe_id: novaEquipeId }),
        });
        if (!response.ok) throw new Error('Falha ao atualizar usuário.');
        toast({ title: "Usuário Movido!", description: `${user.name} foi movido para uma nova equipe.`});
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível mover o usuário. Revertendo.' });
        setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === user.id ? { ...u, equipe_id: originalEquipeId } : u))
        );
    }
  }, [toast]);

  const handleCreateTeam = async () => {
    const nome = prompt('Nome da nova equipe:');
    if (!nome) return;
    const gestorId = prompt('ID do gestor da equipe (número):');
    if (!gestorId) return;
    const gestorMasterId = prompt('ID do gestor master (número):');
     if (!gestorMasterId) return;

    try {
        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, gestor_id: parseInt(gestorId), gestor_master_id: parseInt(gestorMasterId) }),
        });
        if (!response.ok) throw new Error('Falha ao criar equipe.');
        const novaEquipe = await response.json();
        setTeams(prev => [...prev, novaEquipe]);
        toast({ title: 'Equipe Criada!', description: `A equipe "${nome}" foi criada com sucesso.` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar a equipe.' });
    }
  };
  
  const buildHierarchy = () => {
    const hierarchy: Record<string, Team[]> = {};
    teams.forEach((team) => {
      const masterId = String(team.gestor_master_id);
      if (!hierarchy[masterId]) {
        hierarchy[masterId] = [];
      }
      hierarchy[masterId].push(team);
    });
    return hierarchy;
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  const gruposPorMaster = buildHierarchy();

  return (
      <div className="p-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Organograma Hierárquico</h2>
          <Button onClick={handleCreateTeam}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Equipe
          </Button>
        </div>
        {Object.entries(gruposPorMaster).map(([masterId, equipesDoMaster]) => {
          const master = users.find((u) => u.id === parseInt(masterId));
          return (
            <div key={masterId} className="mb-8">
              <div className="bg-primary/80 p-3 rounded text-center text-primary-foreground font-bold">
                Gestor Master: {master?.name || 'Desconhecido'}
              </div>
              <div className="ml-4 mt-4 space-y-6">
                {equipesDoMaster.map((equipe) => {
                  const gestor = users.find((u) => u.id === equipe.gestor_id);
                  const membros = users.filter((u) => u.equipe_id === equipe.id && u.id !== equipe.gestor_id);
                  if (!gestor) return null;
                  return (
                    <TeamNode
                      key={equipe.id}
                      equipeId={equipe.id}
                      gestor={gestor}
                      membros={membros}
                      onDropUser={handleDropUser}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

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
