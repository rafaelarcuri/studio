
'use server';

import { db } from '@/lib/firebase';

export type User = {
  id: number;
  docId: string; // Firestore document ID
  name: string;
  email: string;
  password?: string; // Should be handled securely, only used for login check
  role: 'vendedor' | 'gerente';
  salesPersonId?: number; // Links to the ID in sales.ts
  position: string;
  team: string;
  status: 'ativo' | 'inativo';
  avatar?: string;
  gestor_id?: number;
  equipe_id?: string;
  online?: boolean;
};

const adminUser: User = {
    id: 999,
    docId: 'admin-user',
    name: 'Admin Developer',
    email: 'rhibler@magnumtires.com.br',
    password: '123456',
    role: 'gerente',
    position: 'Desenvolvedor Chefe',
    team: 'Desenvolvimento',
    status: 'ativo',
    avatar: 'https://placehold.co/100x100.png',
    equipe_id: 'equipe-dev',
    online: true,
};

const mockUsers: User[] = [
  { id: 1, docId: 'mock-user-1', name: 'Ana Beatriz', email: 'ana.beatriz@example.com', password: '123', role: 'vendedor', salesPersonId: 1, position: 'Vendedor Jr', team: 'Varejo', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=1`, gestor_id: 999, equipe_id: 'equipe-varejo', online: true },
  { id: 2, docId: 'mock-user-2', name: 'Carlos Silva', email: 'carlos.silva@example.com', password: '123', role: 'gerente', salesPersonId: 2, position: 'Gerente de Vendas', team: 'Atacado', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=2`, gestor_id: 999, equipe_id: 'equipe-atacado', online: true },
  { id: 3, docId: 'mock-user-3', name: 'Daniela Costa', email: 'daniela.costa@example.com', password: '123', role: 'vendedor', salesPersonId: 3, position: 'Vendedor Sênior', team: 'Atacado', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=3`, gestor_id: 2, equipe_id: 'equipe-atacado', online: true },
  { id: 4, docId: 'mock-user-4', name: 'Eduardo Lima', email: 'eduardo.lima@example.com', password: '123', role: 'vendedor', salesPersonId: 4, position: 'Vendedor Jr', team: 'Key Account', status: 'inativo', avatar: `https://i.pravatar.cc/150?u=4`, gestor_id: 999, equipe_id: 'equipe-key-account', online: false },
  { id: 5, docId: 'mock-user-5', name: 'Fernanda Souza', email: 'fernanda.souza@example.com', password: '123', role: 'vendedor', salesPersonId: 5, position: 'Vendedor Pleno', team: 'Atacado', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=5`, gestor_id: 2, equipe_id: 'equipe-atacado', online: true },
  { id: 6, docId: 'mock-user-6', name: 'Gustavo Pereira', email: 'gustavo.pereira@example.com', password: '123', role: 'vendedor', salesPersonId: 6, position: 'Vendedor Sênior', team: 'Varejo', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=6`, gestor_id: 999, equipe_id: 'equipe-varejo', online: true },
  { id: 7, docId: 'mock-user-7', name: 'Helena Martins', email: 'helena.martins@example.com', password: '123', role: 'vendedor', salesPersonId: 7, position: 'Vendedor Jr', team: 'Key Account', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=7`, gestor_id: 999, equipe_id: 'equipe-key-account', online: true },
  { id: 8, docId: 'mock-user-8', name: 'Igor Almeida', email: 'igor.almeida@example.com', password: '123', role: 'vendedor', salesPersonId: 8, position: 'Vendedor Pleno', team: 'Atacado', status: 'inativo', avatar: `https://i.pravatar.cc/150?u=8`, gestor_id: 2, equipe_id: 'equipe-atacado', online: false },
  { id: 9, docId: 'mock-user-9', name: 'Juliana Ribeiro', email: 'juliana.ribeiro@example.com', password: '123', role: 'vendedor', salesPersonId: 9, position: 'Vendedor Sênior', team: 'Varejo', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=9`, gestor_id: 999, equipe_id: 'equipe-varejo', online: true },
  { id: 10, docId: 'mock-user-10', name: 'Lucas Ferreira', email: 'lucas.ferreira@example.com', password: '123', role: 'vendedor', salesPersonId: 10, position: 'Vendedor Jr', team: 'Key Account', status: 'ativo', avatar: `https://i.pravatar.cc/150?u=10`, gestor_id: 999, equipe_id: 'equipe-key-account', online: true },
];

export const updateUserTeam = async (userId: number, equipeId: string | null): Promise<boolean> => {
    // This is a mock implementation
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        mockUsers[userIndex].equipe_id = equipeId ?? undefined;
        // Also update the gestor_id if the user is moved to a new team
        // This is a simplification; a real app might need more complex logic
        if (equipeId) {
            // Find team's manager, for now mock this logic.
            if(equipeId === 'equipe-atacado') mockUsers[userIndex].gestor_id = 2;
            else mockUsers[userIndex].gestor_id = 999;
        }

        console.log(`[LOG] Updated user ${userId} team to ${equipeId}`);
        return true;
    }
    if (adminUser.id === userId) {
        adminUser.equipe_id = equipeId ?? undefined;
        console.log(`[LOG] Updated user ${userId} team to ${equipeId}`);
        return true;
    }
    return false;
};

export const getUsers = async (): Promise<User[]> => {
    if (!db) {
        const allUsers = [adminUser, ...mockUsers];
        // Return a copy of mock users without the password for security.
        return allUsers.map(({ password, ...user }) => ({...user, online: user.status === 'ativo'}));
    }
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) return [];
        const users: User[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Exclude password from general user fetches
            delete data.password;
            users.push({ docId: doc.id, ...data, online: data.status === 'ativo' } as User);
        });
        return users;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    if (email.toLowerCase() === adminUser.email) {
        return adminUser;
    }
    if (!db) {
        return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    try {
        const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { docId: doc.id, ...doc.data() } as User;
    } catch (error) {
        console.error(`Error fetching user by email ${email}: `, error);
        return null;
    }
}

export const getUserById = async (id: number): Promise<User | null> => {
    if (id === adminUser.id) {
        return adminUser;
    }
    if (!db) {
        const allUsers = [adminUser, ...mockUsers];
        return allUsers.find(u => u.id === id) || null;
    }
    try {
        const snapshot = await db.collection('users').where('id', '==', id).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { docId: doc.id, ...doc.data() } as User;
    } catch (error) {
        console.error(`Error fetching user by id ${id}: `, error);
        return null;
    }
}

export const addUser = async (newUser: Omit<User, 'docId'>): Promise<string | null> => {
    if (!db) return null;
    try {
        // Check if user already exists
        const existingUser = await getUserByEmail(newUser.email);
        if (existingUser && existingUser.id !== adminUser.id) {
            console.error("User with this email already exists.");
            throw new Error("User with this email already exists.");
        }
        const docRef = await db.collection('users').add(newUser);
        return docRef.id;
    } catch (error) {
        console.error("Error adding user: ", error);
        return null;
    }
};

export const updateUser = async (userId: number, updatedData: Partial<Omit<User, 'id' | 'docId' | 'password'>>): Promise<boolean> => {
    if (!db) {
        if (userId === adminUser.id) {
            Object.assign(adminUser, updatedData);
            console.log(`[LOG] Updated admin user with`, updatedData);
            return true;
        }
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
            console.log(`[LOG] Updated user ${userId} with`, updatedData);
            return true;
        }
        return false;
    }
    try {
        const snapshot = await db.collection('users').where('id', '==', userId).limit(1).get();
        if (snapshot.empty) return false;
        
        const docId = snapshot.docs[0].id;
        await db.collection('users').doc(docId).update(updatedData);
        return true;
    } catch (error) {
        console.error(`Error updating user ${userId}: `, error);
        return false;
    }
};

export const setUserStatus = async (userId: number, status: 'ativo' | 'inativo'): Promise<boolean> => {
    if (!db) return false;
    try {
        const snapshot = await db.collection('users').where('id', '==', userId).limit(1).get();
        if (snapshot.empty) return false;

        const docId = snapshot.docs[0].id;
        await db.collection('users').doc(docId).update({ status });
        return true;
    } catch (error) {
        console.error(`Error setting status for user ${userId}: `, error);
        return false;
    }
};
