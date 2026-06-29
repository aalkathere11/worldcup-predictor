'use client';

import { cn } from '@/lib/utils';

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  label?: string;
}

export function ScoreInput({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 20,
  label,
}: ScoreInputProps) {
  const decrease = () => {
    if (!disabled && value > min) onChange(value - 1);
  };

  const increase = () => {
    if (!disabled && value < max) onChange(value + 1);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="flex items-center gap-0">
        {/* Decrease button */}
        <button
          type="button"
          onClick={decrease}
          disabled={disabled || value <= min}
          aria-label="Decrease"
          className={cn(
            'w-11 h-11 rounded-l-xl flex items-center justify-center',
            'text-xl font-bold transition-all duration-150 select-none',
            'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            disabled || value <= min
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
          )}
        >
          −
        </button>

        {/* Score display */}
        <div
          className={cn(
            'w-14 h-11 flex items-center justify-center',
            'text-2xl font-black tabular-nums',
            'bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700',
            disabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
          )}
        >
          {value}
        </div>

        {/* Increase button */}
        <button
          type="button"
          onClick={increase}
          disabled={disabled || value >= max}
          aria-label="Increase"
          className={cn(
            'w-11 h-11 rounded-r-xl flex items-center justify-center',
            'text-xl font-bold transition-all duration-150 select-none',
            'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            disabled || value >= max
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}
