
export type Category = 'inadimplencia' | 'carteira' | 'prospeccao' | 'inativos';
export type Status = 'pendente' | 'em_andamento' | 'concluida';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  clientName: string;
  assigneeId: number;
  dueDate: string; // YYYY-MM-DD
  category: Category;
  status: Status;
  priority: Priority;
  commentsCount: number;
};

const today = new Date();
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getDate = (offsetDays: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offsetDays);
    return formatDate(date);
};

export const initialTasks: Task[] = [
  // User 1 - Ana Beatriz
  {
    id: 'task-1',
    title: 'Analisar pendências financeiras',
    clientName: 'Mobilita Com Ind e R',
    assigneeId: 1,
    dueDate: getDate(-2),
    category: 'inadimplencia',
    status: 'pendente',
    priority: 'high',
    commentsCount: 3,
  },
  {
    id: 'task-2',
    title: 'Apresentar nova coleção',
    clientName: 'Armarinhos Fernando',
    assigneeId: 1,
    dueDate: getDate(5),
    category: 'carteira',
    status: 'em_andamento',
    priority: 'medium',
    commentsCount: 1,
  },
  {
    id: 'task-3',
    title: 'Enviar proposta comercial',
    clientName: 'Prospecto XYZ',
    assigneeId: 1,
    dueDate: getDate(1),
    category: 'prospeccao',
    status: 'pendente',
    priority: 'high',
    commentsCount: 0,
  },

  // User 2 - Carlos Silva
  {
    id: 'task-4',
    title: 'Fazer follow-up da proposta',
    clientName: 'Wms Supermercados',
    assigneeId: 2,
    dueDate: getDate(0),
    category: 'carteira',
    status: 'em_andamento',
    priority: 'high',
    commentsCount: 5,
  },
  {
    id: 'task-5',
    title: 'Coletar documentação para cadastro',
    clientName: 'Uniao de Lojas Leade',
    assigneeId: 2,
    dueDate: getDate(10),
    category: 'carteira',
    status: 'concluida',
    priority: 'medium',
    commentsCount: 2,
  },
  {
    id: 'task-6',
    title: 'Reativar contato antigo',
    clientName: 'Cliente Inativo SA',
    assigneeId: 2,
    dueDate: getDate(7),
    category: 'inativos',
    status: 'pendente',
    priority: 'low',
    commentsCount: 0,
  },

  // User 3 - Daniela Costa
  {
    id: 'task-7',
    title: 'Agendar reunião de demonstração',
    clientName: 'Financeiro Americana',
    assigneeId: 3,
    dueDate: getDate(3),
    category: 'prospeccao',
    status: 'em_andamento',
    priority: 'medium',
    commentsCount: 0,
  },
  {
    id: 'task-8',
    title: 'Resolver problema de entrega',
    clientName: 'Hopi Hari S A',
    assigneeId: 3,
    dueDate: getDate(-5),
    category: 'inadimplencia',
    status: 'em_andamento',
    priority: 'high',
    commentsCount: 8,
  },
  
  // User 4 - Eduardo Lima
  {
    id: 'task-9',
    title: 'Enviar relatório de vendas mensal',
    clientName: 'Brascol Com. de Roup',
    assigneeId: 4,
    dueDate: getDate(4),
    category: 'carteira',
    status: 'concluida',
    priority: 'low',
    commentsCount: 0,
  },
   {
    id: 'task-10',
    title: 'Ligar para prospect novo da lista',
    clientName: 'Futuro Cliente Corp',
    assigneeId: 4,
    dueDate: getDate(1),
    category: 'prospeccao',
    status: 'pendente',
    priority: 'medium',
    commentsCount: 0,
  },
];
