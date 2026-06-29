'use client';

import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

// Animated frame for top 3
function PodiumCard({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
  const ringColors = {
    1: 'ring-4 ring-yellow-400 shadow-yellow-300/60',
    2: 'ring-4 ring-slate-300 shadow-slate-300/60',
    3: 'ring-4 ring-amber-600 shadow-amber-600/40',
  };
  const gradients = {
    1: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800',
    2: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border-slate-200 dark:border-slate-700',
    3: 'from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900',
  };

  const name = entry.nickname || entry.full_name;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-2xl border-2',
        'bg-gradient-to-b transition-all duration-300 animate-scale-in',
        gradients[position],
        position === 1 && 'scale-105'
      )}
      style={{ animationDelay: `${(position - 1) * 100}ms` }}
    >
      <span className="text-2xl">{medals[position]}</span>
      <div className={cn('relative', ringColors[position], 'rounded-full shadow-lg')}>
        <Avatar
          src={entry.avatar_url}
          name={entry.full_name}
          size={position === 1 ? 'xl' : 'lg'}
        />
        {position === 1 && (
          <span className="absolute -top-3 -right-1 text-lg">👑</span>
        )}
      </div>
      <div className="text-center">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 max-w-[80px] truncate">
          {name}
        </p>
        <p className="text-xl font-black text-brand-600 dark:text-brand-400">
          {entry.total_points}
        </p>
      </div>
      {/* Podium base */}
      <div
        className={cn(
          'w-full rounded-xl mt-1',
          heights[position],
          position === 1
            ? 'bg-yellow-400/30 dark:bg-yellow-600/20'
            : position === 2
            ? 'bg-slate-300/40 dark:bg-slate-600/30'
            : 'bg-amber-700/20 dark:bg-amber-800/20'
        )}
      />
    </div>
  );
}

// Regular row entry
function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const { t } = useI18n();
  const name = entry.nickname || entry.full_name;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        isCurrentUser
          ? 'bg-brand-50 border-brand-200 dark:bg-brand-950/30 dark:border-brand-800'
          : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800/80'
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
        #{entry.rank}
      </div>

      {/* Avatar */}
      <Avatar src={entry.avatar_url} name={entry.full_name} size="sm" />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-semibold truncate',
            isCurrentUser
              ? 'text-brand-700 dark:text-brand-300'
              : 'text-slate-800 dark:text-slate-100'
          )}
        >
          {name}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
          {entry.exact_predictions} {t('leaderboard.exact')} · {entry.winner_predictions}{' '}
          {t('leaderboard.winners')}
        </p>
      </div>

      {/* Points */}
      <div className="text-right">
        <p
          className={cn(
            'text-lg font-black',
            isCurrentUser
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-800 dark:text-slate-100'
          )}
        >
          {entry.total_points}
        </p>
        <p className="text-xs text-slate-400">
          {Math.round(entry.accuracy)}%
        </p>
      </div>
    </div>
  );
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const { t } = useI18n();

  const [top3, rest] = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.rank - b.rank);
    return [sorted.slice(0, 3), sorted.slice(3)];
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Trophy className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-base font-medium">{t('leaderboard.no_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Podium */}
      {top3.length >= 1 && (
        <div className="flex items-end justify-center gap-2 pt-4">
          {/* Order: 2nd, 1st, 3rd */}
          {top3[1] && (
            <div className="flex-1 max-w-[110px]">
              <PodiumCard entry={top3[1]} position={2} />
            </div>
          )}
          {top3[0] && (
            <div className="flex-1 max-w-[130px]">
              <PodiumCard entry={top3[0]} position={1} />
            </div>
          )}
          {top3[2] && (
            <div className="flex-1 max-w-[110px]">
              <PodiumCard entry={top3[2]} position={3} />
            </div>
          )}
        </div>
      )}

      {/* Rest of list */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((entry) => (
            <LeaderboardRow
              key={entry.user_id}
              entry={entry}
              isCurrentUser={entry.user_id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
