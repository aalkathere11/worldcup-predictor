import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename);

  // Cache-bust with timestamp
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      avatar_url: avatarUrl,
      force_avatar_upload: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}

