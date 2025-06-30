
'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

import type { Task, Status } from '@/data/tasks';
import type { User } from '@/data/users';
import { KanbanCard } from './kanban-card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: Status;
  title: string;
  tasks: Task[];
  assignees: User[];
}

export function KanbanColumn({ id, title, tasks, assignees }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getAssignee = (assigneeId: number) => {
    return assignees.find(u => u.id === assigneeId);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/60 rounded-lg flex flex-col h-full transition-colors',
        isOver ? 'bg-muted' : ''
      )}
    >
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5 font-bold">{tasks.length}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-4 w-4" />
        </Button>
      </header>

      <div className="p-4 flex-grow overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} assignee={getAssignee(task.assigneeId)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
