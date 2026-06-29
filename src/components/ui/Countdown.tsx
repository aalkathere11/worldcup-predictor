'use client';

import { useCountdown } from '@/lib/hooks/useCountdown';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface CountdownProps {
  kickoffAt: string;
  className?: string;
}

export function Countdown({ kickoffAt, className }: CountdownProps) {
  const { display, isLocked, isUrgent } = useCountdown(kickoffAt);
  const { t } = useI18n();

  if (isLocked) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
        {t('matches.predictions_closed')}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span
        className={cn(
          'text-xs font-medium uppercase tracking-wide',
          isUrgent ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {t('matches.countdown_label')}
      </span>
      <div className="flex items-center gap-1">
        {[display.h, display.m, display.s].map((unit, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span
                className={cn(
                  'text-lg font-bold',
                  isUrgent ? 'text-red-500' : 'text-slate-400'
                )}
              >
                :
              </span>
            )}
            <span
              className={cn(
                'inline-block min-w-[2.2rem] text-center text-2xl font-black tabular-nums',
                'rounded-lg px-1.5 py-0.5',
                isUrgent
                  ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
                  : 'text-slate-800 bg-slate-100 dark:text-slate-100 dark:bg-slate-800'
              )}
            >
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
