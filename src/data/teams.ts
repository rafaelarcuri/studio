'use server';

export type Team = {
    id: string;
    nome: string;
    gestor_id: number;
    gestor_master_id: number;
    docId: string;
};

// Using docId as id for simplicity in mock
const mockTeams: Team[] = [
    { id: 'equipe-atacado', docId: 'equipe-atacado', nome: 'Atacado', gestor_id: 2, gestor_master_id: 999 },
    { id: 'equipe-varejo', docId: 'equipe-varejo', nome: 'Varejo', gestor_id: 999, gestor_master_id: 999 },
    { id: 'equipe-key-account', docId: 'equipe-key-account', nome: 'Key Account', gestor_id: 999, gestor_master_id: 999 },
    { id: 'equipe-dev', docId: 'equipe-dev', nome: 'Desenvolvimento', gestor_id: 999, gestor_master_id: 999 },
];

export const getTeams = async (): Promise<Team[]> => {
    // In a real app, this would fetch from Firestore.
    return Promise.resolve(mockTeams);
};

export const addTeam = async (teamData: Omit<Team, 'id' | 'docId'>): Promise<Team> => {
    const newTeam: Team = {
        ...teamData,
        id: `equipe-${Date.now()}`,
        docId: `equipe-${Date.now()}`,
    };
    mockTeams.push(newTeam);
    console.log(`[LOG] Added team ${newTeam.id}`);
    return Promise.resolve(newTeam);
};
