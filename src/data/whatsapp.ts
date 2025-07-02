export type Contact = {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  isOnline: boolean;
  tags: string[];
};

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  sender: 'me' | 'contact';
  status: 'sent' | 'delivered' | 'read';
};

export type Chat = {
  contactId: string;
  unreadCount: number;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  tags: ('novo' | 'em andamento' | 'resolvido')[];
};

export const mockContacts: Contact[] = [
  { id: 'contact-1', name: 'João da Silva', avatar: 'https://i.pravatar.cc/150?u=11', phone: '+55 11 98765-4321', email: 'joao.silva@cliente.com', isOnline: true, tags: ['VIP', 'Compra Recorrente'] },
  { id: 'contact-2', name: 'Maria Oliveira', avatar: 'https://i.pravatar.cc/150?u=12', phone: '+55 21 91234-5678', email: 'maria.o@cliente.com', isOnline: false, tags: ['Suporte Pendente'] },
  { id: 'contact-3', name: 'Supermercado Central', avatar: 'https://i.pravatar.cc/150?u=13', phone: '+55 31 99876-5432', email: 'compras@central.com', isOnline: true, tags: ['Atacado'] },
  { id: 'contact-4', name: 'Padaria Pão Quente', avatar: 'https://i.pravatar.cc/150?u=14', phone: '+55 41 98765-1122', email: 'contato@paoquente.com', isOnline: false, tags: [] },
  { id: 'contact-5', name: 'Oficina Mecânica Veloz', avatar: 'https://i.pravatar.cc/150?u=15', phone: '+55 51 91234-2233', email: 'orcamento@oficinaveloz.com.br', isOnline: true, tags: ['Orçamento Aprovado'] },
];

export const mockChats: Chat[] = [
  {
    contactId: 'contact-1',
    unreadCount: 2,
    lastMessage: 'Ok, combinado. Fico no aguardo!',
    lastMessageTime: '14:30',
    tags: ['novo'],
    messages: [
      { id: 'msg-1-1', text: 'Olá, gostaria de saber mais sobre o produto X.', timestamp: '2024-07-02T14:28:00Z', sender: 'contact', status: 'read' },
      { id: 'msg-1-2', text: 'Claro, João! O produto X tem as seguintes características...', timestamp: '2024-07-02T14:29:00Z', sender: 'me', status: 'read' },
      { id: 'msg-1-3', text: 'Excelente!', timestamp: '2024-07-02T14:29:30Z', sender: 'contact', status: 'read' },
      { id: 'msg-1-4', text: 'Ok, combinado. Fico no aguardo!', timestamp: '2024-07-02T14:30:00Z', sender: 'contact', status: 'read' },
    ],
  },
  {
    contactId: 'contact-2',
    unreadCount: 0,
    lastMessage: 'Você: Perfeito, Maria. Pedido confirmado!',
    lastMessageTime: '11:15',
    tags: ['resolvido'],
    messages: [
      { id: 'msg-2-1', text: 'Bom dia, gostaria de confirmar meu pedido.', timestamp: '2024-07-02T11:14:00Z', sender: 'contact', status: 'read' },
      { id: 'msg-2-2', text: 'Perfeito, Maria. Pedido confirmado!', timestamp: '2024-07-02T11:15:00Z', sender: 'me', status: 'read' },
    ],
  },
  {
    contactId: 'contact-3',
    unreadCount: 0,
    lastMessage: 'Agradecemos o contato!',
    lastMessageTime: 'Ontem',
    tags: ['em andamento'],
    messages: [
      { id: 'msg-3-1', text: 'Qual o horário de funcionamento?', timestamp: '2024-07-01T18:05:00Z', sender: 'contact', status: 'read' },
      { id: 'msg-3-2', text: 'Olá! Funcionamos das 8h às 20h, de segunda a sábado.', timestamp: '2024-07-01T18:06:00Z', sender: 'me', status: 'delivered' },
      { id: 'msg-3-3', text: 'Agradecemos o contato!', timestamp: '2024-07-01T18:07:00Z', sender: 'me', status: 'sent' },
    ],
  },
    {
    contactId: 'contact-4',
    unreadCount: 1,
    lastMessage: 'Já estamos preparando para entrega.',
    lastMessageTime: '09:45',
    tags: ['em andamento'],
    messages: [
      { id: 'msg-4-1', text: 'Bom dia, meu pedido já saiu para entrega?', timestamp: '2024-07-02T09:44:00Z', sender: 'contact', status: 'read' },
      { id: 'msg-4-2', text: 'Bom dia! Já estamos preparando para entrega.', timestamp: '2024-07-02T09:45:00Z', sender: 'me', status: 'read' },
    ],
  },
   {
    contactId: 'contact-5',
    unreadCount: 0,
    lastMessage: 'Você: Sem problemas, tenha um bom dia!',
    lastMessageTime: 'Sexta',
    tags: ['resolvido'],
    messages: [
      { id: 'msg-5-1', text: 'Obrigado pelo retorno rápido!', timestamp: '2024-06-28T16:20:00Z', sender: 'contact', status: 'read' },
      { id: 'msg-5-2', text: 'Sem problemas, tenha um bom dia!', timestamp: '2024-06-28T16:21:00Z', sender: 'me', status: 'read' },
    ],
  },
];
