import { NextResponse } from 'next/server';
import { updateUserTeam } from '@/data/users';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { equipe_id } = body;

    if (equipe_id === undefined) {
        return NextResponse.json({ error: 'equipe_id is required' }, { status: 400 });
    }

    const success = await updateUserTeam(userId, equipe_id);

    if (success) {
        return NextResponse.json({ message: 'User updated successfully' });
    } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
