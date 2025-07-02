
'use server';

import { db } from '@/lib/firebase';

export type Category = 'inadimplencia' | 'carteira' | 'prospeccao' | 'inativos';
export type Status = 'pendente' | 'em_andamento' | 'concluida';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string; // Firestore document ID
  title: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  assigneeId: number;
  dueDate: string; // YYYY-MM-DD
  category: Category;
  status: Status;
  priority: Priority;
  commentsCount: number;
  responseTimeMinutes?: number;
  interactions?: number;
};

const mockTasks: Task[] = [
    { id: 'task-1', title: 'Ligar para cliente inadimplente', clientId: 101, clientName: 'Supermercado Central', clientPhone: '(11) 98765-4321', assigneeId: 1, dueDate: '2024-07-25', category: 'inadimplencia', status: 'pendente', priority: 'high', commentsCount: 2, responseTimeMinutes: 15, interactions: 5 },
    { id: 'task-2', title: 'Enviar nova proposta comercial', clientId: 103, clientName: 'Tecidos & Cia', clientPhone: '(21) 99876-5432', assigneeId: 2, dueDate: '2024-07-28', category: 'prospeccao', status: 'em_andamento', priority: 'medium', commentsCount: 0, responseTimeMinutes: 30, interactions: 8 },
    { id: 'task-3', title: 'Agendar visita de demonstração', clientId: 104, clientName: 'Construtora Rocha Forte', clientPhone: '(31) 98765-1234', assigneeId: 2, dueDate: '2024-08-02', category: 'prospeccao', status: 'pendente', priority: 'high', commentsCount: 1, responseTimeMinutes: 10, interactions: 3 },
    { id: 'task-4', title: 'Acompanhar pedido recente', clientId: 105, clientName: 'Restaurante Sabor Divino', clientPhone: '(41) 91234-9876', assigneeId: 3, dueDate: '2024-07-24', category: 'carteira', status: 'concluida', priority: 'medium', commentsCount: 5, responseTimeMinutes: 5, interactions: 12 },
    { id: 'task-5', title: 'Reativar cliente antigo', clientId: 106, clientName: 'Oficina Mecânica Veloz', clientPhone: '(51) 98765-5678', assigneeId: 3, dueDate: '2024-07-30', category: 'inativos', status: 'em_andamento', priority: 'low', commentsCount: 0, responseTimeMinutes: 45, interactions: 6 },
    { id: 'task-6', title: 'Negociar dívida', clientId: 107, clientName: 'Farmácia Bem-Estar', clientPhone: '(61) 91234-1234', assigneeId: 4, dueDate: '2024-07-22', category: 'inadimplencia', status: 'concluida', priority: 'high', commentsCount: 3, responseTimeMinutes: 8, interactions: 9 },
    { id: 'task-7', title: 'Apresentar novos produtos', clientId: 109, clientName: 'Distribuidora de Bebidas Gelada', clientPhone: '(81) 91234-5555', assigneeId: 5, dueDate: '2024-08-05', category: 'carteira', status: 'pendente', priority: 'medium', commentsCount: 0, responseTimeMinutes: 20, interactions: 4 },
    { id: 'task-8', title: 'Enviar catálogo atualizado', clientId: 110, clientName: 'Petshop Amigo Fiel', clientPhone: '(91) 98765-4444', assigneeId: 5, dueDate: '2024-07-26', category: 'carteira', status: 'em_andamento', priority: 'low', commentsCount: 1, responseTimeMinutes: 25, interactions: 7 },
    { id: 'task-9', title: 'Follow-up de proposta', clientId: 111, clientName: 'Academia Corpo em Movimento', clientPhone: '(12) 91234-3333', assigneeId: 6, dueDate: '2024-07-29', category: 'prospeccao', status: 'pendente', priority: 'medium', commentsCount: 0, responseTimeMinutes: 12, interactions: 2 },
    { id: 'task-10', title: 'Recuperar cliente inativo', clientId: 112, clientName: 'Salão de Beleza Charme', clientPhone: '(13) 98765-2222', assigneeId: 6, dueDate: '2024-08-01', category: 'inativos', status: 'pendente', priority: 'low', commentsCount: 0, responseTimeMinutes: 60, interactions: 5 },
    { id: 'task-11', title: 'Cobrança amigável', clientId: 113, clientName: 'Material de Construção Casa Nova', clientPhone: '(14) 91234-1111', assigneeId: 7, dueDate: '2024-07-23', category: 'inadimplencia', status: 'em_andamento', priority: 'high', commentsCount: 4, responseTimeMinutes: 18, interactions: 11 },
    { id: 'task-12', title: 'Renovar contrato', clientId: 114, clientName: 'Escola de Idiomas Global', clientPhone: '(15) 98765-0000', assigneeId: 7, dueDate: '2024-08-10', category: 'carteira', status: 'pendente', priority: 'high', commentsCount: 0, responseTimeMinutes: 22, interactions: 8 },
    { id: 'task-13', title: 'Verificar satisfação do cliente', clientId: 115, clientName: 'Gráfica Impressão Rápida', clientPhone: '(16) 91234-9999', assigneeId: 8, dueDate: '2024-07-27', category: 'carteira', status: 'concluida', priority: 'low', commentsCount: 2, responseTimeMinutes: 3, interactions: 4 },
    { id: 'task-14', title: 'Prospectar novo contato', clientId: 116, clientName: 'Agência de Viagens Mundo Afora', clientPhone: '(17) 98765-8888', assigneeId: 8, dueDate: '2024-07-31', category: 'prospeccao', status: 'em_andamento', priority: 'medium', commentsCount: 1, responseTimeMinutes: 35, interactions: 9 },
    { id: 'task-15', title: 'Oferecer upgrade de plano', clientId: 117, clientName: 'Loja de Eletrônicos InovaTec', clientPhone: '(18) 91234-7777', assigneeId: 9, dueDate: '2024-08-08', category: 'carteira', status: 'pendente', priority: 'medium', commentsCount: 0, responseTimeMinutes: 28, interactions: 6 },
    { id: 'task-16', title: 'Resolver pendência de entrega', clientId: 102, clientName: 'Padaria Pão Quente', clientPhone: '(11) 91234-5678', assigneeId: 1, dueDate: '2024-07-25', category: 'carteira', status: 'em_andamento', priority: 'high', commentsCount: 3, responseTimeMinutes: 13, interactions: 10 },
    { id: 'task-17', title: 'Prospecção de feira de negócios', clientId: 901, clientName: 'Cliente Novo A', clientPhone: '(99) 99999-9999', assigneeId: 10, dueDate: '2024-08-15', category: 'prospeccao', status: 'pendente', priority: 'medium', commentsCount: 0, responseTimeMinutes: 40, interactions: 1 },
    { id: 'task-18', title: 'Entender motivo de inatividade', clientId: 119, clientName: 'Advocacia & Associados', clientPhone: '(22) 91234-5555', assigneeId: 10, dueDate: '2024-08-04', category: 'inativos', status: 'pendente', priority: 'low', commentsCount: 0, responseTimeMinutes: 55, interactions: 4 },
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

// Delete a task from Firestore
export const deleteTask = async (taskId: string): Promise<boolean> => {
  if (!db) {
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index > -1) {
        mockTasks.splice(index, 1);
        return true;
    }
    return false;
  }
  try {
    await db.collection('tasks').doc(taskId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting task ${taskId}: `, error);
    return false;
  }
};

// Bulk add tasks to Firestore
export const bulkAddTasks = async (tasks: Omit<Task, 'id' | 'commentsCount'>[]): Promise<boolean> => {
    if (!db) return false;
    const batch = db.batch();
    try {
        tasks.forEach(taskData => {
            const docRef = db.collection('tasks').doc(); // Firestore generates ID
            const newTask = {
                ...taskData,
                commentsCount: 0 // Default value for new tasks
            };
            batch.set(docRef, newTask);
        });
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error bulk adding tasks: ", error);
        return false;
    }
};
