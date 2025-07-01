'use server';

import { db } from '@/lib/firebase';

export type Integration = {
  id: string; // This will be the document ID in Firestore
  name: string;
  description: string;
  logo: string;
  status: 'ativo' | 'inativo';
  apiKey: string;
};

// Get all integrations from Firestore
export const getIntegrations = async (): Promise<Integration[]> => {
  try {
    const snapshot = await db.collection('integrations').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Integration));
  } catch (error) {
    console.error("Error fetching integrations: ", error);
    return [];
  }
};

// Update an integration's API key in Firestore
export const updateIntegrationApiKey = async (id: string, apiKey: string): Promise<boolean> => {
  try {
    await db.collection('integrations').doc(id).update({ apiKey });
    console.log(`[LOG] API Key for ${id} updated.`);
    return true;
  } catch (error) {
    console.error(`Error updating API key for integration ${id}: `, error);
    return false;
  }
};

// Update an integration's status in Firestore
export const updateIntegrationStatus = async (id: string, status: 'ativo' | 'inativo'): Promise<boolean> => {
  try {
    await db.collection('integrations').doc(id).update({ status });
    console.log(`[LOG] Status for ${id} changed to ${status}.`);
    return true;
  } catch (error) {
    console.error(`Error updating status for integration ${id}: `, error);
    return false;
  }
};
