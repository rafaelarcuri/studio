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

const mockIntegrations: Integration[] = [
  { id: 'erp_senior', name: 'ERP Senior', description: 'Integração com o sistema ERP Senior para sincronização de dados.', logo: '/path/to/senior-logo.png', status: 'ativo', apiKey: 'senior_mock_api_key_12345' },
  { id: 'salesforce', name: 'Salesforce', description: 'Conecte seu CRM Salesforce para unificar informações de clientes.', logo: '/path/to/salesforce-logo.png', status: 'inativo', apiKey: '' },
  { id: 'google_cloud', name: 'Google Cloud', description: 'Utilize serviços do Google Cloud para armazenamento e análise de dados.', logo: '/path/to/google-cloud-logo.png', status: 'ativo', apiKey: 'gcloud_mock_api_key_67890' },
  { id: 'rd_station', name: 'RD Station', description: 'Sincronize leads e oportunidades com a plataforma RD Station Marketing.', logo: '/path/to/rd-logo.png', status: 'inativo', apiKey: '' },
  { id: 'data_query_api', name: 'Data Query API', description: 'Conecte-se à nossa API para realizar consultas avançadas em seus dados de vendas.', logo: '/path/to/api-logo.png', status: 'inativo', apiKey: '' },
];

// Get all integrations from Firestore
export const getIntegrations = async (): Promise<Integration[]> => {
  if (!db) return mockIntegrations;
  try {
    const snapshot = await db.collection('integrations').get();
    if (snapshot.empty) {
      // If Firestore is empty, let's populate it with our mock data for the first time.
      console.log('Populating "integrations" collection with mock data.');
      const batch = db.batch();
      mockIntegrations.forEach((integration) => {
        const docRef = db.collection('integrations').doc(integration.id);
        batch.set(docRef, integration);
      });
      await batch.commit();
      return mockIntegrations;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Integration));
  } catch (error) {
    console.error("Error fetching integrations: ", error);
    return [];
  }
};

// Update an integration's API key in Firestore
export const updateIntegrationApiKey = async (id: string, apiKey: string): Promise<boolean> => {
  if (!db) {
    const index = mockIntegrations.findIndex(i => i.id === id);
    if (index > -1) {
      mockIntegrations[index].apiKey = apiKey;
      return true;
    }
    return false;
  }
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
  if (!db) {
    const index = mockIntegrations.findIndex(i => i.id === id);
    if (index > -1) {
      mockIntegrations[index].status = status;
      return true;
    }
    return false;
  }
  try {
    await db.collection('integrations').doc(id).update({ status });
    console.log(`[LOG] Status for ${id} changed to ${status}.`);
    return true;
  } catch (error) {
    console.error(`Error updating status for integration ${id}: `, error);
    return false;
  }
};
