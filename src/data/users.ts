
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
};

export const users: User[] = [
  {
    id: 101,
    name: 'Gerente de Vendas',
    email: 'gerente@vendasagil.com',
    password: 'password',
    role: 'gerente',
  },
  {
    id: 1, // Must match an ID in sales.ts
    name: 'Ana Beatriz',
    email: 'ana@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 1,
  },
  {
    id: 2, // Must match an ID in sales.ts
    name: 'Carlos Silva',
    email: 'carlos@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 2,
  },
  {
    id: 3, // Must match an ID in sales.ts
    name: 'Daniela Costa',
    email: 'daniela@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 3,
  },
  {
    id: 4, // Must match an ID in sales.ts
    name: 'Eduardo Lima',
    email: 'eduardo@vendasagil.com',
    password: 'password',
    role: 'vendedor',
    salesPersonId: 4,
  },
];
