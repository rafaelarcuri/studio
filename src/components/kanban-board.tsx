
'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PieChart, ListFilter, Calendar } from 'lucide-react';

import type { Task, Status } from '@/data/tasks';
import { getTasks, updateTask } from '@/data/tasks';
import type { User } from '@/data/users';
import { getUsers } from '@/data/users';
import { KanbanColumn } from '@/components/kanban-column';
import { KanbanCard } from '@/components/kanban-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';

const initialColumns: { id: Status; title: string }[] = [
  { id: 'pendente', title: 'Pendentes' },
  { id: 'em_andamento', title: 'Em Andamento' },
  { id: 'concluida', title: 'Concluídas' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [fetchedTasks, fetchedUsers] = await Promise.all([
            getTasks(),
            getUsers()
        ]);
        setTasks(fetchedTasks);
        setUsers(fetchedUsers);
        setIsLoading(false);
    };
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (over && active.id !== over.id) {
      const activeIndex = tasks.findIndex((item) => item.id === active.id);
      const overId = over.id;
      
      const overIsColumn = initialColumns.some(c => c.id === overId);

      if (overIsColumn) {
          const newStatus = overId as Status;
          if (tasks[activeIndex].status !== newStatus) {
            const updatedTask = { ...tasks[activeIndex], status: newStatus };
            // Update local state for immediate feedback
            setTasks(items => {
                items[activeIndex] = updatedTask;
                return [...items];
            });
            // Persist change to the database
            updateTask(active.id as string, { status: newStatus });
          }
      }
    }
  };
  
  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status);
  }

  const getAssignee = (assigneeId: number) => {
    return users.find(u => u.id === assigneeId);
  }

  if (isLoading) {
    return (
        <div className="flex flex-col flex-grow overflow-hidden">
            <div className="shrink-0 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6 h-full">
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
        {/* Top Dashboard Section */}
        <div className="shrink-0 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTasksByStatus('pendente').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTasksByStatus('em_andamento').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTasksByStatus('concluida').length}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                    </CardContent>
                </Card>
            </div>
             <div className="flex items-center gap-2 mt-4">
                <Button variant="outline"><Calendar className="mr-2 h-4 w-4"/> Mês Atual</Button>
                <Button variant="outline"><ListFilter className="mr-2 h-4 w-4"/> Filtros</Button>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-grow overflow-x-auto overflow-y-hidden pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                items={initialColumns.map(c => c.id)}
                strategy={horizontalListSortingStrategy}
                >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                    {initialColumns.map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        tasks={getTasksByStatus(column.id)}
                        assignees={users}
                    />
                    ))}
                </div>
                </SortableContext>
                <DragOverlay>
                    {activeTask ? (
                        <KanbanCard task={activeTask} assignee={getAssignee(activeTask.assigneeId)} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    </div>
  );
}
