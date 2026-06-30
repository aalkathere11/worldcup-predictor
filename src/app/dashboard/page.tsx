'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, TrendingUp, Zap } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Countdown } from '@/components/ui/Countdown';
import { Flag } from '@/components/ui/Flag';
import { MatchCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/i18n';
import { getLeaderboard, getUpcomingMatches } from '@/lib/api';
import { cn, getRankOrdinal, calculateAccuracy } from '@/lib/utils';
import type { Match, LeaderboardEntry } from '@/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [leaderboard, upcoming] = await Promise.all([
        getLeaderboard(),
        getUpcomingMatches(1),
      ]);
      const me = leaderboard.find((e) => e.user_id === user!.id) ?? null;
      setUserEntry(me);
      setNextMatch(upcoming[0] ?? null);
      setDataLoading(false);
    }

    load().catch(console.error);
  }, [user]);

  function getMotivationalMessage(): string {
    if (!userEntry) return t('dashboard.motivational.keep_going');
    if (userEntry.rank <= 3) return t('dashboard.motivational.top_three');
    return t('dashboard.motivational.keep_going');
  }

  const displayName = user?.nickname || user?.full_name?.split(' ')[0] || '';
  const accuracy = userEntry
    ? calculateAccuracy(
        userEntry.exact_predictions + userEntry.winner_predictions,
        userEntry.total_predictions
      )
    : 0;

  if (authLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-5 text-white shadow-lg">
          <div className="relative z-10 flex items-center gap-4">
            {user && (
              <Avatar
                src={user.avatar_url}
                name={user.full_name}
                size="lg"
                ring
                ringColor="ring-white/50"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-brand-100 text-sm font-medium">
                {t('dashboard.welcome')},
              </p>
              <h2 className="text-2xl font-black truncate">{displayName}</h2>
              {userEntry && (
                <p className="text-brand-200 text-sm mt-0.5">
                  {getMotivationalMessage()}
                </p>
              )}
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute -right-4 -bottom-12 w-48 h-48 rounded-full bg-white/5" />
          <span className="absolute right-4 top-4 text-5xl opacity-20">⚽</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label={t('dashboard.your_rank')}
            value={userEntry ? `#${userEntry.rank}` : '–'}
            loading={dataLoading}
            color="brand"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label={t('dashboard.your_points')}
            value={userEntry ? String(userEntry.total_points) : '0'}
            loading={dataLoading}
            color="amber"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label={t('predictions.exact')}
            value={userEntry ? String(userEntry.exact_predictions) : '0'}
            loading={dataLoading}
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label={t('dashboard.accuracy')}
            value={`${accuracy}%`}
            loading={dataLoading}
            color="purple"
          />
        </div>

        {/* Next match */}
        <div>
          <h3 className="section-title">{t('dashboard.next_match')}</h3>
          {dataLoading ? (
            <MatchCardSkeleton />
          ) : nextMatch ? (
            <NextMatchCard match={nextMatch} locale={locale} />
          ) : (
            <div className="card p-6 flex flex-col items-center gap-2 text-slate-400">
              <span className="text-3xl">🏆</span>
              <p className="text-sm font-medium">{t('dashboard.no_next_match')}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// --------------------------------
// Sub-components
// --------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
  color: 'brand' | 'amber' | 'emerald' | 'purple';
}

const colorMap = {
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-950/30',
    icon: 'text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50',
    value: 'text-brand-700 dark:text-brand-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
    value: 'text-amber-700 dark:text-amber-300',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50',
    value: 'text-purple-700 dark:text-purple-300',
  },
};

function StatCard({ icon, label, value, loading, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn('rounded-xl p-4 flex flex-col gap-2', c.bg)}>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', c.icon)}>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <p className={cn('text-2xl font-black', c.value)}>{value}</p>
      )}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function NextMatchCard({ match, locale }: { match: Match; locale: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-900 p-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {match.round}
        </span>
        <span className="text-xs text-slate-400">{match.match_number}</span>
      </div>

      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Flag code={match.team_a_code} size="lg" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center">
            {match.team_a}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-slate-400">VS</span>
          <Countdown kickoffAt={match.kickoff_at} />
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <Flag code={match.team_b_code} size="lg" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center">
            {match.team_b}
          </span>
        </div>
      </div>
    </div>
  );
}

