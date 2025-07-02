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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Bot, GripVertical, ListTree, LogIn, MessageSquare, MoreVertical, Plus, Trash2, Edit, Clock, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export type FlowNodeType = 'initial' | 'message' | 'options' | 'wait' | 'transfer';

export type FlowNodeData = {
  text?: string;
  options?: string[];
  duration?: string;
};

export type FlowNode = {
  id: string;
  type: FlowNodeType;
  title: string;
  description: string;
  data: FlowNodeData;
};

const initialNodes: FlowNode[] = [
  { id: 'node-1', type: 'initial', title: 'Gatilho Inicial', description: 'A primeira mensagem que o cliente envia.', data: {} },
  { id: 'node-2', type: 'message', title: 'Mensagem de Boas-Vindas', description: 'Olá! Bem-vindo(a) ao atendimento da Vendas Ágil. Para agilizar, selecione uma das opções abaixo.', data: { text: 'Olá! Bem-vindo(a) ao atendimento da Vendas Ágil. Para agilizar, selecione uma das opções abaixo.' } },
  { id: 'node-3', type: 'options', title: 'Menu de Opções', description: '1. Financeiro\n2. Vendas\n3. Suporte Técnico', data: { options: ['Financeiro', 'Vendas', 'Suporte Técnico'] } },
  { id: 'node-4', type: 'wait', title: 'Aguardar Resposta', description: 'Aguardar até 5 minutos pela resposta do cliente.', data: { duration: '5 minutos' } },
  { id: 'node-5', type: 'transfer', title: 'Transferir para Atendente', description: 'A conversa será direcionada para a fila de atendimento.', data: {} },
];

const nodeConfig: Record<FlowNodeType, { icon: React.ElementType; color: string; }> = {
    initial: { icon: LogIn, color: 'text-gray-500' },
    message: { icon: MessageSquare, color: 'text-blue-500' },
    options: { icon: ListTree, color: 'text-purple-500' },
    wait: { icon: Clock, color: 'text-yellow-500' },
    transfer: { icon: User, color: 'text-green-500' },
}

function FlowNodeCard({ node, isOverlay }: { node: FlowNode, isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, data: node });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const NodeIcon = nodeConfig[node.type].icon;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-card touch-manipulation transform mb-4",
        isDragging && "opacity-75 z-50 shadow-lg",
        isOverlay && "shadow-2xl"
      )}
    >
        <CardContent className="p-4 flex items-start gap-4">
            <div className="flex items-center gap-2 text-muted-foreground cursor-grab" {...listeners} {...attributes}>
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-shrink-0">
                <NodeIcon className={cn("h-6 w-6", nodeConfig[node.type].color)} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{node.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{node.description}</p>
            </div>
            <div className="flex-shrink-0">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardContent>
    </Card>
  );
}

export default function WhatsAppFlowBuilder() {
  const [nodes, setNodes] = React.useState<FlowNode[]>(initialNodes);
  const [activeNode, setActiveNode] = React.useState<FlowNode | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveNode(nodes.find(n => n.id === active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNode(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over!.id);
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        return newItems;
      });
    }
  };

  const handleSave = () => {
    toast({
        title: "Fluxo Salvo!",
        description: "O fluxo de atendimento foi salvo com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etapas do Fluxo</CardTitle>
        <CardDescription>
          Arraste as etapas para reordenar o fluxo de atendimento do chatbot. As etapas são executadas de cima para baixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                <FlowNodeCard node={node} />
                {index < nodes.length - 1 && (
                    <div className="absolute left-9 top-full h-4 w-0.5 bg-border -translate-x-1/2" />
                )}
              </div>
            ))}
          </SortableContext>
          <DragOverlay>
            {activeNode ? <FlowNodeCard node={activeNode} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
      <CardFooter className="flex justify-between">
         <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Etapa
         </Button>
         <Button onClick={handleSave}>Salvar Fluxo</Button>
      </CardFooter>
    </Card>
  );
}
