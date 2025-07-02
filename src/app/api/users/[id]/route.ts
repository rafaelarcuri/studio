import { NextResponse } from 'next/server';
import { updateUser } from '@/data/users';

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
    
    const updates = { ...body };
    if (updates.gestor_id === undefined) {
        updates.gestor_id = null;
    }
    if (updates.equipe_id === undefined) {
        updates.equipe_id = null;
    }

    const success = await updateUser(userId, updates);

    if (success) {
        return NextResponse.json({ message: 'User updated successfully' });
    } else {
        return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
