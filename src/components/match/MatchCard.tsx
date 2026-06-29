'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Lock } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { Countdown } from '@/components/ui/Countdown';
import { ScoreInput } from '@/components/ui/ScoreInput';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { savePrediction } from '@/lib/api';
import {
  cn,
  getPredictionStatus,
  getPredictionColor,
  getPredictionPointsBadgeColor,
  getRoundLabel,
  formatMatchDate,
  formatMatchTime,
} from '@/lib/utils';
import type { Match, Prediction } from '@/types';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onPredictionSaved?: (prediction: Prediction) => void;
}

export function MatchCard({ match, prediction, onPredictionSaved }: MatchCardProps) {
  const { t, locale, isRTL } = useI18n();

  // Determine if locked
  const kickoff = new Date(match.kickoff_at).getTime();
  const lockAt = kickoff - 5 * 60 * 1000;
  const now = Date.now();
  const isLocked = now >= lockAt;

  // Score state — default from existing prediction
  const [scoreA, setScoreA] = useState(prediction?.score_a ?? 0);
  const [scoreB, setScoreB] = useState(prediction?.score_b ?? 1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(
    prediction ?? null
  );

  // Prediction status (for result coloring)
  const status = currentPrediction
    ? getPredictionStatus(
        currentPrediction.score_a,
        currentPrediction.score_b,
        match.score_a,
        match.score_b,
        isLocked
      )
    : 'pending';

  const hasPrediction = currentPrediction !== null;
  const hasResult = match.result_entered;

  // Validation: no draws in knockout
  const isKnockout = ![
    'Group Stage',
  ].includes(match.round);
  const isDraw = scoreA === scoreB;
  const drawWarning = isKnockout && isDraw;

  const handleSave = useCallback(async () => {
    if (isLocked || (isKnockout && isDraw)) return;

    setSaving(true);
    try {
      const pred = await savePrediction(match.id, scoreA, scoreB);
      setCurrentPrediction(pred);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onPredictionSaved?.(pred);
      toast.success(t('matches.prediction_saved'));
    } catch (err) {
      toast.error(t('errors.generic'));
    } finally {
      setSaving(false);
    }
  }, [isLocked, isKnockout, isDraw, match.id, scoreA, scoreB, t, onPredictionSaved]);

  const cardColorClass = getPredictionColor(status);

  return (
    <div
      className={cn(
        'rounded-2xl border-2 transition-all duration-300',
        'shadow-sm hover:shadow-md',
        cardColorClass,
        'animate-slide-up'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {getRoundLabel(match.round, locale)} · {t('matches.match_number')} {match.match_number}
        </span>
        {hasResult && currentPrediction && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              getPredictionPointsBadgeColor(currentPrediction.points ?? 0)
            )}
          >
            {currentPrediction.points} {t('predictions.points')}
          </span>
        )}
      </div>

      {/* Date & Time */}
      <div className="flex items-center justify-between px-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{formatMatchDate(match.kickoff_at, locale)}</span>
        <span>{formatMatchTime(match.kickoff_at, locale)} · {t('common.timezone')}</span>
      </div>

      {/* Teams & Scores */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {/* Team A */}
        <div
          className={cn(
            'flex-1 flex flex-col items-center gap-2',
            isRTL ? 'items-end' : 'items-start'
          )}
          style={{ alignItems: 'center' }}
        >
          <Flag code={match.team_a_code} size="lg" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center leading-tight">
            {match.team_a}
          </span>
          {hasResult && (
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {match.score_a}
            </span>
          )}
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1 px-1">
          {hasResult ? (
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">FT</span>
          ) : (
            <span className="text-base font-bold text-slate-400 dark:text-slate-500">
              {t('matches.vs')}
            </span>
          )}
        </div>

        {/* Team B */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <Flag code={match.team_b_code} size="lg" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 text-center leading-tight">
            {match.team_b}
          </span>
          {hasResult && (
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {match.score_b}
            </span>
          )}
        </div>
      </div>

      {/* Countdown */}
      {!hasResult && (
        <div className="flex justify-center px-4 pb-3">
          <Countdown kickoffAt={match.kickoff_at} />
        </div>
      )}

      {/* Prediction section */}
      {!isLocked && !hasResult && (
        <div
          className={cn(
            'mx-3 mb-3 p-3 rounded-xl',
            'bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60',
            'backdrop-blur-sm'
          )}
        >
          {/* Score inputs */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <ScoreInput
              value={scoreA}
              onChange={setScoreA}
              disabled={isLocked}
              label={match.team_a.split(' ')[0]}
            />
            <span className="text-slate-400 font-bold text-lg">–</span>
            <ScoreInput
              value={scoreB}
              onChange={setScoreB}
              disabled={isLocked}
              label={match.team_b.split(' ')[0]}
            />
          </div>

          {/* Draw warning */}
          {drawWarning && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 mb-2">
              ⚠️ {t('matches.draw_not_allowed')}
            </p>
          )}

          {/* Save button */}
          <Button
            variant={saved ? 'success' : 'primary'}
            size="lg"
            fullWidth
            loading={saving}
            disabled={drawWarning}
            onClick={handleSave}
            className="gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t('matches.saved_successfully')}
              </>
            ) : hasPrediction ? (
              t('matches.prediction_updated')
            ) : (
              t('matches.save_prediction')
            )}
          </Button>

          {/* Current prediction hint */}
          {hasPrediction && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t('matches.your_prediction')}: {currentPrediction!.score_a} –{' '}
              {currentPrediction!.score_b}
            </p>
          )}
        </div>
      )}

      {/* Locked / result display */}
      {(isLocked || hasResult) && (
        <div
          className={cn(
            'mx-3 mb-3 p-3 rounded-xl',
            'bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50'
          )}
        >
          {isLocked && !hasResult && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Lock className="w-4 h-4" />
              {t('matches.predictions_closed')}
            </div>
          )}

          {hasPrediction && (
            <div className="text-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {t('matches.your_prediction')}:{' '}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {currentPrediction!.score_a} – {currentPrediction!.score_b}
              </span>
            </div>
          )}

          {!hasPrediction && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              {t('matches.no_prediction')}
            </p>
          )}

          {/* Result indicator */}
          {hasResult && hasPrediction && (
            <div className="flex items-center justify-center gap-2 mt-2">
              {status === 'correct_exact' && (
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  ✓ {t('predictions.exact')} (+2)
                </span>
              )}
              {status === 'correct_winner' && (
                <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">
                  ✓ {t('predictions.winner')} (+1)
                </span>
              )}
              {status === 'wrong' && (
                <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                  ✗ {t('predictions.wrong')} (+0)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
