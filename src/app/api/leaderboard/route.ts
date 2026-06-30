import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Aggregate points per user from predictions where points are calculated
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('user_id, points, score_a, score_b')
    .not('points', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, nickname, avatar_url')
    .eq('role', 'user');

  if (!users) return NextResponse.json([]);

  // Aggregate stats per user
  const statsMap = new Map<string, {
    total_points: number;
    exact_predictions: number;
    winner_predictions: number;
    wrong_predictions: number;
    total_predictions: number;
  }>();

  for (const pred of predictions ?? []) {
    if (!statsMap.has(pred.user_id)) {
      statsMap.set(pred.user_id, {
        total_points: 0,
        exact_predictions: 0,
        winner_predictions: 0,
        wrong_predictions: 0,
        total_predictions: 0,
      });
    }
    const s = statsMap.get(pred.user_id)!;
    s.total_predictions++;
    if (pred.points === 2) s.exact_predictions++;
    else if (pred.points === 1) s.winner_predictions++;
    else s.wrong_predictions++;
    s.total_points += pred.points ?? 0;
  }

  // Build leaderboard
  const leaderboard = users
    .map((u) => {
      const s = statsMap.get(u.id) ?? {
        total_points: 0,
        exact_predictions: 0,
        winner_predictions: 0,
        wrong_predictions: 0,
        total_predictions: 0,
      };
      const accuracy =
        s.total_predictions > 0
          ? Math.round(
              ((s.exact_predictions + s.winner_predictions) / s.total_predictions) * 100
            )
          : 0;
      return {
        user_id: u.id,
        full_name: u.full_name,
        nickname: u.nickname,
        avatar_url: u.avatar_url,
        ...s,
        accuracy,
        rank: 0,
      };
    })
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.exact_predictions !== a.exact_predictions)
        return b.exact_predictions - a.exact_predictions;
      return b.accuracy - a.accuracy;
    });

  // Assign ranks
  leaderboard.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return NextResponse.json(leaderboard);
}

