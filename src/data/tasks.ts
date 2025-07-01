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

// Fetch all tasks from Firestore
export const getTasks = async (): Promise<Task[]> => {
  if (!db) return [];
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
