import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any).from('users').select('role').eq('id', user.id).single();
  return (data as any)?.role === 'admin' ? user : null;
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = params;
  const tempPassword = generateTempPassword();

  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Force user to change password on next login
  await adminClient
    .from('users')
    .update({ force_password_change: true })
    .eq('id', userId);

  return NextResponse.json({ temp_password: tempPassword });
}
