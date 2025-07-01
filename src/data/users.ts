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
};

export const getUsers = async (): Promise<User[]> => {
    if (!db) return [];
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) return [];
        const users: User[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Exclude password from general user fetches
            delete data.password;
            users.push({ docId: doc.id, ...data } as User);
        });
        return users;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    if (!db) return null;
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
    if (!db) return null;
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
        if (existingUser) {
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
    if (!db) return false;
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
