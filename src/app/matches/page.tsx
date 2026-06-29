'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MatchCard } from '@/components/match/MatchCard';
import { MatchCardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useI18n } from '@/i18n';
import { getMatches, getUserPredictions } from '@/lib/api';
import { cn, getRoundLabel, ROUND_ORDER } from '@/lib/utils';
import type { Match, Prediction } from '@/types';

export default function MatchesPage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();

  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allMatches, allPredictions] = await Promise.all([
        getMatches(),
        user ? getUserPredictions() : Promise.resolve([]),
      ]);

      setMatches(allMatches);
      setPredictions(allPredictions);

      // Extract unique rounds in correct order
      const rounds = ROUND_ORDER.filter((r) =>
        allMatches.some((m) => m.round === r)
      );
      setAvailableRounds(rounds);
      setLoading(false);
    }
    load().catch(console.error);
  }, [user]);

  const filteredMatches =
    selectedRound === 'all'
      ? matches
      : matches.filter((m) => m.round === selectedRound);

  const getPrediction = useCallback(
    (matchId: string) => predictions.find((p) => p.match_id === matchId) ?? null,
    [predictions]
  );

  const handlePredictionSaved = useCallback((pred: Prediction) => {
    setPredictions((prev) => {
      const existing = prev.findIndex((p) => p.match_id === pred.match_id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = pred;
        return updated;
      }
      return [...prev, pred];
    });
  }, []);

  return (
    <AppLayout title={t('matches.title')}>
      <div className="space-y-4">
        {/* Round filter tabs */}
        {!loading && availableRounds.length > 0 && (
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
              {/* All */}
              <RoundTab
                label={t('matches.all_rounds')}
                active={selectedRound === 'all'}
                onClick={() => setSelectedRound('all')}
              />
              {availableRounds.map((round) => (
                <RoundTab
                  key={round}
                  label={getRoundLabel(round, locale)}
                  active={selectedRound === round}
                  onClick={() => setSelectedRound(round)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Match cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="card p-8 flex flex-col items-center gap-3 text-slate-400">
            <span className="text-4xl">📅</span>
            <p className="text-base font-medium">{t('matches.title')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getPrediction(match.id)}
                onPredictionSaved={handlePredictionSaved}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface RoundTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function RoundTab({ label, active, onClick }: RoundTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap',
        'transition-all duration-150 active:scale-95',
        active
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
      )}
    >
      {label}
    </button>
  );
}
