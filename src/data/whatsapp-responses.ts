
'use server';

export type AutomatedMessage = {
  id: 'welcome' | 'absence';
  title: string;
  description: string;
  message: string;
  enabled: boolean;
};

export type QuickReply = {
  id: string;
  shortcut: string; // e.g., /status
  message: string;
};

const mockAutomatedMessages: AutomatedMessage[] = [
  {
    id: 'welcome',
    title: 'Mensagem de Boas-vindas',
    description: 'Enviada quando um cliente inicia uma nova conversa.',
    message: 'Olá! Bem-vindo(a) ao nosso canal de atendimento. Como podemos ajudar você hoje?',
    enabled: true,
  },
  {
    id: 'absence',
    title: 'Mensagem de Ausência',
    description: 'Enviada fora do horário de atendimento (Seg-Sex, 9h-18h).',
    message: 'Olá! Agradecemos seu contato. Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Retornaremos sua mensagem assim que possível.',
    enabled: false,
  },
];

const mockQuickReplies: QuickReply[] = [
  { id: 'qr-1', shortcut: '/status', message: 'Para consultar o status do seu pedido, por favor, informe o número do pedido ou o seu CPF.' },
  { id: 'qr-2', shortcut: '/pagamento', message: 'Aceitamos as seguintes formas de pagamento: Cartão de Crédito (Visa, Master, Elo), Boleto Bancário e Pix.' },
  { id: 'qr-3', shortcut: '/frete', message: 'O valor e o prazo do frete podem ser calculados diretamente em nosso site, na página do produto ou no carrinho de compras.' },
  { id: 'qr-4', shortcut: '/horario', message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.' },
];

// --- API Functions ---

export const getAutomatedMessages = async (): Promise<AutomatedMessage[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAutomatedMessages;
};

export const updateAutomatedMessage = async (id: AutomatedMessage['id'], data: Partial<AutomatedMessage>): Promise<boolean> => {
  const index = mockAutomatedMessages.findIndex(m => m.id === id);
  if (index > -1) {
    mockAutomatedMessages[index] = { ...mockAutomatedMessages[index], ...data };
    console.log(`[LOG] Updated automated message ${id}`);
    return true;
  }
  return false;
};

export const getQuickReplies = async (): Promise<QuickReply[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockQuickReplies;
};

export const addQuickReply = async (data: Omit<QuickReply, 'id'>): Promise<QuickReply> => {
    const newReply: QuickReply = {
        ...data,
        id: `qr-${Date.now()}`
    };
    mockQuickReplies.push(newReply);
    console.log(`[LOG] Added quick reply ${newReply.id}`);
    return newReply;
};

export const updateQuickReply = async (id: string, data: Partial<QuickReply>): Promise<boolean> => {
    const index = mockQuickReplies.findIndex(r => r.id === id);
    if (index > -1) {
        mockQuickReplies[index] = { ...mockQuickReplies[index], ...data };
        console.log(`[LOG] Updated quick reply ${id}`);
        return true;
    }
    return false;
}

export const deleteQuickReply = async (id: string): Promise<boolean> => {
    const index = mockQuickReplies.findIndex(r => r.id === id);
    if (index > -1) {
        mockQuickReplies.splice(index, 1);
        console.log(`[LOG] Deleted quick reply ${id}`);
        return true;
    }
    return false;
}
