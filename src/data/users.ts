
// NOTE: This is a mock user database for prototyping purposes.
// In a real-world application, you would NEVER store passwords in plaintext.
// They should be securely hashed and stored in a database.

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string; // This is insecure and only for the prototype
  role: 'vendedor' | 'gerente';
  salesPersonId?: number; // Links to the ID in sales.ts
  position: string; // "Cargo", e.g., "Vendedor Pleno", "Gerente de Vendas"
  team: string; // "Time/setor", e.g., "Varejo", "Corporativo"
  status: 'ativo' | 'inativo';
};

export let users: User[] = [
  {
    id: 102,
    name: 'Admin',
    email: 'rhibler@magnumtires.com.br',
    password: '123456',
    role: 'gerente',
    position: 'Administrador',
    team: 'TI',
    status: 'ativo',
  },
  {
    id: 101,
    name: 'Gerente de Vendas',
    email: 'gerente@vendasagil.com',
    password: 'password',
    role: 'gerente',
    position: 'Gerente de Vendas',
    team: 'Gestão',
    status: 'ativo',
  },
  {
    id: 1, // Must match an ID in sales.ts
    name: 'Ana Beatriz',
    email: 'ana@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 1,
    position: 'Vendedora Pleno',
    team: 'Varejo SP',
    status: 'ativo',
  },
  {
    id: 2, // Must match an ID in sales.ts
    name: 'Carlos Silva',
    email: 'carlos@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 2,
    position: 'Vendedor Sênior',
    team: 'Varejo RJ',
    status: 'ativo',
  },
  {
    id: 3, // Must match an ID in sales.ts
    name: 'Daniela Costa',
    email: 'daniela@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 3,
    position: 'Vendedora Júnior',
    team: 'Varejo SP',
    status: 'inativo',
  },
  {
    id: 4, // Must match an ID in sales.ts
    name: 'Eduardo Lima',
    email: 'eduardo@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 4,
    position: 'Vendedor Pleno',
    team: 'Varejo MG',
    status: 'ativo',
  },
];

export const addUser = (newUser: User) => {
    const existingUser = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (existingUser) {
        console.error("User with this email already exists.");
        return;
    }
    users.push(newUser);
};


// In a real app, this function would make an API call to your backend.
// The backend would handle the database update and log the change.
export const updateUser = (userId: number, updatedData: Partial<Omit<User, 'id' | 'password'>>) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const originalUser = { ...users[userIndex] };
        users[userIndex] = { ...users[userIndex], ...updatedData };
        
        // Mock logging the change
        console.log(`[LOG] User ${userId} updated. By: Admin. Timestamp: ${new Date().toISOString()}. From: ${JSON.stringify(originalUser)} To: ${JSON.stringify(users[userIndex])}`);
        return true;
    }
    return false;
};

// In a real app, this function would make an API call to your backend.
export const setUserStatus = (userId: number, status: 'ativo' | 'inativo') => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].status = status;

        // Mock logging the change
        console.log(`[LOG] User ${userId} status changed to ${status}. By: Admin. Timestamp: ${new Date().toISOString()}.`);
        return true;
    }
    return false;
};
