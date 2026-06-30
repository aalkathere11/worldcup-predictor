import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

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

  const adminClient = createAdminClient();

  const { data: users } = await (adminClient as any)
    .from('users')
    .select('id, full_name, nickname, email')
    .eq('role', 'user');

  const { data: predictions } = await (adminClient as any)
    .from('predictions')
    .select('user_id, points')
    .not('points', 'is', null);

  const pointsMap = new Map<string, { total: number; exact: number; winner: number }>();
  for (const p of predictions ?? []) {
    if (!pointsMap.has((p as any).user_id)) {
      pointsMap.set((p as any).user_id, { total: 0, exact: 0, winner: 0 });
    }
    const s = pointsMap.get((p as any).user_id)!;
    s.total += (p as any).points ?? 0;
    if ((p as any).points === 2) s.exact++;
    else if ((p as any).points === 1) s.winner++;
  }

  const rows = (users ?? [])
    .map((u: any) => {
      const s = pointsMap.get((u as any).id) ?? { total: 0, exact: 0, winner: 0 };
      return { ...(u as any), ...s };
    })
    .sort((a: any, b: any) => b.total - a.total)
    .map((u: any, i: number) => ({
      Rank: i + 1,
      'Full Name': (u as any).full_name,
      Nickname: (u as any).nickname ?? '-',
      Email: (u as any).email,
      'Total Points': u.total,
      'Exact Predictions': u.exact,
      'Winner Predictions': u.winner,
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="leaderboard.xlsx"',
    },
  });
}

