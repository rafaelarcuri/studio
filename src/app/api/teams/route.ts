import { NextResponse } from 'next/server';
import { getTeams, addTeam } from '@/data/teams';

export async function GET() {
    try {
        const teams = await getTeams();
        return NextResponse.json(teams);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nome, gestor_id, gestor_master_id } = body;
        if (!nome || !gestor_id || !gestor_master_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const newTeam = await addTeam({ nome, gestor_id, gestor_master_id });
        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}
