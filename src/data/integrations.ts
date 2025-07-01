
export type Integration = {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: 'ativo' | 'inativo';
  apiKey: string;
};

let integrations: Integration[] = [
  {
    id: 'erp-senior',
    name: 'ERP Senior',
    description: 'Sincroniza dados de clientes, produtos e pedidos entre o Vendas Ágil e o seu sistema ERP Senior.',
    logo: 'https://placehold.co/100x100.png',
    status: 'ativo',
    apiKey: 'senior_prod_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  },
  {
    id: 'salesforce-crm',
    name: 'Salesforce CRM',
    description: 'Mantenha os leads, contatos e oportunidades sincronizados com a maior plataforma de CRM do mundo.',
    logo: 'https://placehold.co/100x100.png',
    status: 'inativo',
    apiKey: 'sf_live_x0y9z8w7v6u5t4s3r2q1p0o9n8m7l6k5',
  },
  {
    id: 'rd-station',
    name: 'RD Station Marketing',
    description: 'Envie leads gerados em suas campanhas de marketing diretamente para a prospecção da sua equipe de vendas.',
    logo: 'https://placehold.co/100x100.png',
    status: 'ativo',
    apiKey: 'rdstation_live_abc123def456ghi789jkl0mno',
  },
];

// Get all integrations
export const getIntegrations = (): Integration[] => {
  return JSON.parse(JSON.stringify(integrations));
};

// Update an integration's API key
export const updateIntegrationApiKey = (id: string, apiKey: string) => {
  const index = integrations.findIndex((i) => i.id === id);
  if (index !== -1) {
    integrations[index].apiKey = apiKey;
    console.log(`[LOG] API Key for ${id} updated.`);
    return true;
  }
  return false;
};

// Update an integration's status
export const updateIntegrationStatus = (id: string, status: 'ativo' | 'inativo') => {
  const index = integrations.findIndex((i) => i.id === id);
  if (index !== -1) {
    integrations[index].status = status;
    console.log(`[LOG] Status for ${id} changed to ${status}.`);
    return true;
  }
  return false;
};
