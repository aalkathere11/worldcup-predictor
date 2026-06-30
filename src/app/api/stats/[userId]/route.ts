import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = params;

  // Users can only view their own stats unless admin
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userId !== user.id && (profile as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all predictions with match data
  const { data: predictions, error } = await (supabase as any)
    .from('predictions')
    .select('*, match:matches(round, kickoff_at)')
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const preds = predictions ?? [];

  let exact_predictions = 0;
  let winner_predictions = 0;
  let wrong_predictions = 0;
  let total_points = 0;

  // Points by round
  const roundMap = new Map<string, number>();

  for (const p of preds) {
    if ((p as any).points === null) continue; // no result yet
    total_points += (p as any).points;
    if ((p as any).points === 2) exact_predictions++;
    else if ((p as any).points === 1) winner_predictions++;
    else wrong_predictions++;

    const round = ((p as any).match as { round: string })?.round ?? 'Unknown';
    roundMap.set(round, (roundMap.get(round) ?? 0) + (p as any).points);
  }

  const total_predictions = exact_predictions + winner_predictions + wrong_predictions;
  const accuracy =
    total_predictions > 0
      ? Math.round(((exact_predictions + winner_predictions) / total_predictions) * 100)
      : 0;

  // Round order for chart
  const ROUND_ORDER = [
    'Group Stage', 'Round of 32', 'Round of 16',
    'Quarter Final', 'Semi Final', 'Third Place', 'Final',
  ];

  const round_stats = ROUND_ORDER
    .filter((r) => roundMap.has(r))
    .map((r) => ({ round: r, points: roundMap.get(r) ?? 0 }));

  // Get rank from leaderboard calculation
  const { data: allUsers } = await (supabase as any)
    .from('users')
    .select('id')
    .eq('role', 'user');

  const { data: allPredictions } = await (supabase as any)
    .from('predictions')
    .select('user_id, points')
    .not('points', 'is', null);

  const pointsMap = new Map<string, number>();
  for (const p of allPredictions ?? []) {
    pointsMap.set((p as any).user_id, (pointsMap.get((p as any).user_id) ?? 0) + ((p as any).points ?? 0));
  }

  const sorted = (allUsers ?? [])
    .map((u) => ({ id: (u as any).id, pts: pointsMap.get((u as any).id) ?? 0 }))
    .sort((a, b) => b.pts - a.pts);

  const rank = sorted.findIndex((u) => (u as any).id === userId) + 1;

  return NextResponse.json({
    exact_predictions,
    winner_predictions,
    wrong_predictions,
    total_predictions,
    accuracy,
    rank: rank || (allUsers?.length ?? 0) + 1,
    total_points,
    round_stats,
  });
}
