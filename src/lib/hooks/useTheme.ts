'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored || (prefersDark ? 'dark' : 'light');
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', t);
  }

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, mounted, isDark: theme === 'dark' };
}

