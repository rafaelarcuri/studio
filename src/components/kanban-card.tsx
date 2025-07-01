'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import type { Task, Category } from '@/data/tasks';
import type { User } from '@/data/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MessageSquare, Play, Check, Phone, User as UserIcon } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  assignee?: User;
  isOverlay?: boolean;
}

const categoryColors: Record<Category, string> = {
  inadimplencia: 'border-l-red-500',
  carteira: 'border-l-green-500',
  prospeccao: 'border-l-yellow-500',
  inativos: 'border-l-purple-500',
};

const dateColors = (dueDate: string) => {
    const today = new Date();
    const date = new Date(dueDate);
    today.setHours(0,0,0,0);
    
    if (date < today) return 'bg-red-500 text-white'; // Vencido
    if (date.getTime() === today.getTime()) return 'bg-yellow-500 text-white'; // Vence hoje
    return 'bg-green-500 text-white'; // A vencer
}

export function KanbanCard({ task, assignee, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'mb-4 touch-manipulation transform bg-card',
        categoryColors[task.category],
        'border-l-4',
        isDragging && 'opacity-50 z-50 shadow-lg',
        isOverlay && 'shadow-2xl'
      )}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-sm leading-tight">{task.title}</p>
          {assignee && (
            <div className="relative">
              <Avatar className="h-7 w-7">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {assignee.status === 'ativo' && (
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-card" />
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5">
                <UserIcon className="h-3 w-3" />
                <span>{task.clientName} (ID: {task.clientId})</span>
            </div>
             <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <span>{task.clientPhone}</span>
            </div>
        </div>

        <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
                <button className="hover:text-primary"><Play className="h-4 w-4" /></button>
                <button className="hover:text-primary"><Check className="h-4 w-4" /></button>
                <div className="flex items-center gap-1 hover:text-primary cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    <span>{task.commentsCount}</span>
                </div>
            </div>
            <Badge className={cn("px-2 py-0.5 font-bold", dateColors(task.dueDate))}>
                {format(new Date(task.dueDate), 'dd/MM')}
            </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
