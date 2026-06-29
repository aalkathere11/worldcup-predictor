'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/i18n';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title={t('leaderboard.title')}>
      {loading ? (
        <LeaderboardSkeleton />
      ) : (
        <Leaderboard entries={entries} currentUserId={user?.id} />
      )}
    </AppLayout>
  );
}
