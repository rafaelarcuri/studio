
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
import { initialTasks } from '@/data/tasks';
import { users } from '@/data/users';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const initialColumns: { id: Status; title: string }[] = [
  { id: 'pendente', title: 'Pendentes' },
  { id: 'em_andamento', title: 'Em Andamento' },
  { id: 'concluida', title: 'Concluídas' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

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
      setTasks((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overId = over.id;
        
        const overIsColumn = initialColumns.some(c => c.id === overId);

        if (overIsColumn) {
           const newStatus = overId as Status;
           items[activeIndex].status = newStatus;
           return [...items];
        }

        // This part is for reordering within a column, which we don't implement in this iteration
        // to keep drag-to-change-status simple.
        return items;
      });
    }
  };
  
  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status);
  }

  const getAssignee = (assigneeId: number) => {
    return users.find(u => u.id === assigneeId);
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
                    </Header>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTasksByStatus('em_andamento').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                    </Header>
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
