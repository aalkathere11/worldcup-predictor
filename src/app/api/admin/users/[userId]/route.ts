import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any).from('users').select('role').eq('id', user.id).single();
  return (data as any)?.role === 'admin' ? user : null;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = params;

  // Prevent deleting self
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Delete predictions first (cascade)
  await (adminClient as any).from('predictions').delete().eq('user_id', userId);
  await (adminClient as any).from('achievements').delete().eq('user_id', userId);

  // Delete profile
  await (adminClient as any).from('users').delete().eq('id', userId);

  // Delete auth user
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
