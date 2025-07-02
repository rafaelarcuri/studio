
'use server';

import type { User } from './users';
import { getUsers } from './users';
import type { WhatsAppNumber } from './whatsapp-numbers';

export type OrganizationNode = User & {
    children: OrganizationNode[];
    whatsAppNumber?: WhatsAppNumber;
};

export const getOrganizationTree = async (): Promise<OrganizationNode[]> => {
    const users = await getUsers();
    
    let whatsAppNumbers: WhatsAppNumber[] = [];
    try {
        // Ensure this URL is correct and accessible from the server environment
        const numbersResponse = await fetch(process.env.WHATSAPP_BACKEND_URL || 'http://localhost:3000/numbers');
        if (numbersResponse.ok) {
            whatsAppNumbers = await numbersResponse.json();
        } else {
            console.error('Failed to fetch WhatsApp numbers for organization chart.');
        }
    } catch (error) {
        console.error('Error fetching WhatsApp numbers:', error);
    }

    const usersWithChildren: OrganizationNode[] = users.map(u => ({
        ...u,
        children: [],
        whatsAppNumber: whatsAppNumbers.find(n => n.pairedBy === u.name),
    }));

    const userMap = new Map(usersWithChildren.map(u => [u.id, u]));
    const tree: OrganizationNode[] = [];

    usersWithChildren.forEach(user => {
        // If the user has a manager and that manager exists in our map
        if (user.gestor_id && userMap.has(user.gestor_id)) {
            // Add this user to their manager's children array
            const manager = userMap.get(user.gestor_id);
            if (manager) {
                manager.children.push(user);
            }
        } else {
            // Otherwise, this is a root node
            tree.push(user);
        }
    });

    return tree;
};
