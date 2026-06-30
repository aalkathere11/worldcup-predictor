import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMatchLocked } from '@/lib/utils';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await (supabase as any)
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { match_id, score_a, score_b } = await req.json();

  if (match_id === undefined || score_a === undefined || score_b === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (typeof score_a !== 'number' || typeof score_b !== 'number') {
    return NextResponse.json({ error: 'Invalid scores' }, { status: 400 });
  }

  // Fetch the match to check lock status and knockout draw rule
  const { data: match, error: matchError } = await (supabase as any)
    .from('matches')
    .select('kickoff_at, round')
    .eq('id', match_id)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  if (isMatchLocked(match.kickoff_at)) {
    return NextResponse.json({ error: 'Predictions are closed for this match' }, { status: 403 });
  }

  // Knockout draw check
  const knockoutRounds = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Third Place', 'Final'];
  if (knockoutRounds.includes(match.round) && score_a === score_b) {
    return NextResponse.json({ error: 'Draws are not allowed in knockout rounds' }, { status: 400 });
  }

  // Upsert prediction
  const { data: prediction, error: upsertError } = await (supabase as any)
    .from('predictions')
    .upsert(
      {
        user_id: user.id,
        match_id,
        score_a,
        score_b,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single();

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

  // Grant first_prediction achievement if not already
  await grantAchievementIfNew(supabase, user.id, 'first_prediction');

  return NextResponse.json(prediction);
}

async function grantAchievementIfNew(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  badgeKey: string
) {
  const { data: existing } = await (supabase as any)
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_key', badgeKey)
    .single();

  if (!existing) {
    await (supabase as any)
    .from('achievements')
      .insert({ user_id: userId, badge_key: badgeKey });
  }
}

