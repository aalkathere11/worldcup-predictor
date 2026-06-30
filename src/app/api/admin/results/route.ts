import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { calculatePoints } from '@/lib/utils';

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any).from('users').select('role').eq('id', user.id).single();
  return (data as any)?.role === 'admin' ? user : null;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { match_id, score_a, score_b } = await req.json();

  if (!match_id || score_a === undefined || score_b === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Update match result
  const { error: matchError } = await (adminClient as any)
    .from('matches')
    .update({
      score_a,
      score_b,
      result_entered: true,
    })
    .eq('id', match_id);

  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 });

  // Fetch all predictions for this match
  const { data: predictions } = await adminClient
    .from('predictions')
    .select('id, score_a, score_b')
    .eq('match_id', match_id);

  if (!predictions || predictions.length === 0) {
    return NextResponse.json({ success: true, updated: 0 });
  }

  // Calculate and update points for each prediction
  const updates = predictions.map((p) => ({
    id: p.id,
    points: calculatePoints(p.score_a, p.score_b, score_a, score_b),
    updated_at: new Date().toISOString(),
  }));

  // Batch update
  for (const update of updates) {
    await adminClient
      .from('predictions')
      .update({ points: update.points, updated_at: update.updated_at })
      .eq('id', update.id);
  }

  // Check for achievements
  await checkAndGrantAchievements(adminClient);

  return NextResponse.json({ success: true, updated: updates.length });
}

async function checkAndGrantAchievements(adminClient: ReturnType<typeof createAdminClient>) {
  const { data: users } = await adminClient
    .from('users')
    .select('id')
    .eq('role', 'user');

  if (!users) return;

  for (const user of users) {
    const { data: preds } = await adminClient
      .from('predictions')
      .select('points')
      .eq('user_id', user.id)
      .not('points', 'is', null);

    if (!preds) continue;

    const correctCount = preds.filter((p) => (p as any).points !== null && (p as any).points > 0).length;
    const winnerCount = preds.filter((p) => (p as any).points === 1 || (p as any).points === 2).length;
    const exactCount = preds.filter((p) => (p as any).points === 2).length;

    // first_correct
    if (correctCount >= 1) await grantIfNew(adminClient, user.id, 'first_correct');
    // ten_winners
    if (winnerCount >= 10) await grantIfNew(adminClient, user.id, 'ten_winners');

    // Check streak of 5
    const sorted = preds.map((p) => (p as any).points ?? 0);
    let maxStreak = 0;
    let streak = 0;
    for (const pts of sorted) {
      if (pts > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;
    }
    if (maxStreak >= 5) await grantIfNew(adminClient, user.id, 'five_streak');
  }
}

async function grantIfNew(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
  badgeKey: string
) {
  const { data } = await client
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_key', badgeKey)
    .single();

  if (!data) {
    await (client as any).from('achievements').insert({ user_id: userId, badge_key: badgeKey });
  }
}

