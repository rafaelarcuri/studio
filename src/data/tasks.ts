'use server';

import { db } from '@/lib/firebase';

export type Category = 'inadimplencia' | 'carteira' | 'prospeccao' | 'inativos';
export type Status = 'pendente' | 'em_andamento' | 'concluida';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string; // Firestore document ID
  title: string;
  clientName: string;
  assigneeId: number;
  dueDate: string; // YYYY-MM-DD
  category: Category;
  status: Status;
  priority: Priority;
  commentsCount: number;
};

const mockTasks: Task[] = [
    { id: 'task-1', title: 'Ligar para cliente inadimplente', clientName: 'Supermercado Central', assigneeId: 1, dueDate: '2024-07-25', category: 'inadimplencia', status: 'pendente', priority: 'high', commentsCount: 2 },
    { id: 'task-2', title: 'Enviar nova proposta comercial', clientName: 'Tecidos & Cia', assigneeId: 2, dueDate: '2024-07-28', category: 'prospeccao', status: 'em_andamento', priority: 'medium', commentsCount: 0 },
    { id: 'task-3', title: 'Agendar visita de demonstração', clientName: 'Construtora Rocha Forte', assigneeId: 2, dueDate: '2024-08-02', category: 'prospeccao', status: 'pendente', priority: 'high', commentsCount: 1 },
    { id: 'task-4', title: 'Acompanhar pedido recente', clientName: 'Restaurante Sabor Divino', assigneeId: 3, dueDate: '2024-07-24', category: 'carteira', status: 'concluida', priority: 'medium', commentsCount: 5 },
    { id: 'task-5', title: 'Reativar cliente antigo', clientName: 'Oficina Mecânica Veloz', assigneeId: 3, dueDate: '2024-07-30', category: 'inativos', status: 'em_andamento', priority: 'low', commentsCount: 0 },
    { id: 'task-6', title: 'Negociar dívida', clientName: 'Farmácia Bem-Estar', assigneeId: 4, dueDate: '2024-07-22', category: 'inadimplencia', status: 'concluida', priority: 'high', commentsCount: 3 },
    { id: 'task-7', title: 'Apresentar novos produtos', clientName: 'Distribuidora de Bebidas Gelada', assigneeId: 5, dueDate: '2024-08-05', category: 'carteira', status: 'pendente', priority: 'medium', commentsCount: 0 },
    { id: 'task-8', title: 'Enviar catálogo atualizado', clientName: 'Petshop Amigo Fiel', assigneeId: 5, dueDate: '2024-07-26', category: 'carteira', status: 'em_andamento', priority: 'low', commentsCount: 1 },
    { id: 'task-9', title: 'Follow-up de proposta', clientName: 'Academia Corpo em Movimento', assigneeId: 6, dueDate: '2024-07-29', category: 'prospeccao', status: 'pendente', priority: 'medium', commentsCount: 0 },
    { id: 'task-10', title: 'Recuperar cliente inativo', clientName: 'Salão de Beleza Charme', assigneeId: 6, dueDate: '2024-08-01', category: 'inativos', status: 'pendente', priority: 'low', commentsCount: 0 },
    { id: 'task-11', title: 'Cobrança amigável', clientName: 'Material de Construção Casa Nova', assigneeId: 7, dueDate: '2024-07-23', category: 'inadimplencia', status: 'em_andamento', priority: 'high', commentsCount: 4 },
    { id: 'task-12', title: 'Renovar contrato', clientName: 'Escola de Idiomas Global', assigneeId: 7, dueDate: '2024-08-10', category: 'carteira', status: 'pendente', priority: 'high', commentsCount: 0 },
    { id: 'task-13', title: 'Verificar satisfação do cliente', clientName: 'Gráfica Impressão Rápida', assigneeId: 8, dueDate: '2024-07-27', category: 'carteira', status: 'concluida', priority: 'low', commentsCount: 2 },
    { id: 'task-14', title: 'Prospectar novo contato', clientName: 'Agência de Viagens Mundo Afora', assigneeId: 8, dueDate: '2024-07-31', category: 'prospeccao', status: 'em_andamento', priority: 'medium', commentsCount: 1 },
    { id: 'task-15', title: 'Oferecer upgrade de plano', clientName: 'Loja de Eletrônicos InovaTec', assigneeId: 9, dueDate: '2024-08-08', category: 'carteira', status: 'pendente', priority: 'medium', commentsCount: 0 },
    { id: 'task-16', title: 'Resolver pendência de entrega', clientName: 'Padaria Pão Quente', assigneeId: 1, dueDate: '2024-07-25', category: 'carteira', status: 'em_andamento', priority: 'high', commentsCount: 3 },
    { id: 'task-17', title: 'Prospecção de feira de negócios', clientName: 'Cliente Novo A', assigneeId: 10, dueDate: '2024-08-15', category: 'prospeccao', status: 'pendente', priority: 'medium', commentsCount: 0 },
    { id: 'task-18', title: 'Entender motivo de inatividade', clientName: 'Advocacia & Associados', assigneeId: 10, dueDate: '2024-08-04', category: 'inativos', status: 'pendente', priority: 'low', commentsCount: 0 },
];


// Fetch all tasks from Firestore
export const getTasks = async (): Promise<Task[]> => {
  if (!db) return mockTasks;
  try {
    const snapshot = await db.collection('tasks').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    console.error("Error fetching tasks: ", error);
    return [];
  }
};

// Add a new task to Firestore
export const addTask = async (taskData: Omit<Task, 'id'>): Promise<string | null> => {
  if (!db) return null;
  try {
    const docRef = await db.collection('tasks').add(taskData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    return null;
  }
};

// Update an existing task in Firestore
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  if (!db) return false;
  try {
    await db.collection('tasks').doc(taskId).update(updates);
    return true;
  } catch (error) {
    console.error(`Error updating task ${taskId}: `, error);
    return false;
  }
};
