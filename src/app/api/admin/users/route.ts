import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any).from('users').select('role').eq('id', user.id).single();
  return (data as any)?.role === 'admin' ? user : null;
}

export async function GET() {
  const supabase = createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, nickname, avatar_url, role, created_at, force_password_change, force_avatar_upload')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, full_name, temp_password } = await req.json();

  if (!email || !full_name || !temp_password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Create auth user with service role
  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: temp_password,
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  // Create profile
  const { data: profile, error: profileError } = await adminClient
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      nickname: null,
      avatar_url: null,
      role: 'user',
      force_password_change: true,
      force_avatar_upload: true,
    })
    .select()
    .single();

  if (profileError) {
    // Cleanup: delete auth user if profile creation fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json(profile, { status: 201 });
}

