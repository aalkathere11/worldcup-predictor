import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { current_password, new_password } = await req.json();

  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (new_password.length < 8) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 });
  }

  // Re-authenticate with current password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  });

  if (signInError) {
    return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Update force_password_change flag
  await supabase
    .from('users')
    .update({ force_password_change: false })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}

