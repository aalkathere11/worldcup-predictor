'use client';

import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggle, isDark, mounted } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
        'border-b border-slate-200 dark:border-slate-800',
        'pt-safe-top',
        'shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
      )}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        {/* App name / title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <h1 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
            {title ?? t('app.name')}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold',
              'transition-all duration-150 active:scale-95',
              'bg-slate-100 hover:bg-slate-200 text-slate-600',
              'dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
            )}
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggle}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                'transition-all duration-150 active:scale-95',
                'bg-slate-100 hover:bg-slate-200 text-slate-600',
                'dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              )}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
