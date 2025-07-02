import { NextResponse } from 'next/server';
import { getUsers } from '@/data/users';

export async function GET() {
    try {
        const users = await getUsers();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
