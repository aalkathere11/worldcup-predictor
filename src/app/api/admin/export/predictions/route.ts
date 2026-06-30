import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { formatMatchDate, formatMatchTime } from '@/lib/utils';

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

  // Fetch predictions with user and match info
  const { data: predictions } = await adminClient
    .from('predictions')
    .select(`
      *,
      user:users(full_name, nickname, email),
      match:matches(round, team_a, team_b, kickoff_at, score_a, score_b)
    `)
    .order('created_at', { ascending: true });

  const rows = (predictions ?? []).map((p) => {
    const user = (p as any).user as { full_name: string; nickname: string; email: string } | null;
    const match = (p as any).match as {
      round: string; team_a: string; team_b: string;
      kickoff_at: string; score_a: number | null; score_b: number | null;
    } | null;

    return {
      'Player Name': user?.full_name ?? '-',
      'Nickname': user?.nickname ?? '-',
      'Email': user?.email ?? '-',
      'Round': match?.round ?? '-',
      'Match': `${match?.team_a ?? '-'} vs ${match?.team_b ?? '-'}`,
      'Date': match?.kickoff_at ? formatMatchDate(match.kickoff_at, 'en') : '-',
      'Time (Makkah)': match?.kickoff_at ? formatMatchTime(match.kickoff_at, 'en') : '-',
      'Predicted Score': `${p.score_a} - ${p.score_b}`,
      'Actual Score': match?.score_a !== null ? `${match!.score_a} - ${match!.score_b}` : 'Pending',
      'Points': (p as any).points !== null ? (p as any).points : 'Pending',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Predictions');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="predictions.xlsx"',
    },
  });
}

