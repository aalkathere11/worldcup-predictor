'use client';

import { useState, useEffect, useRef } from 'react';
import { timeUntilLock, formatCountdown, isMatchLocked } from '@/lib/utils';

interface CountdownState {
  display: { h: string; m: string; s: string };
  isLocked: boolean;
  isUrgent: boolean; // < 1 hour
  remainingMs: number;
}

export function useCountdown(kickoffAt: string): CountdownState {
  const [remainingMs, setRemainingMs] = useState<number>(() => timeUntilLock(kickoffAt));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function tick() {
      const ms = timeUntilLock(kickoffAt);
      setRemainingMs(ms);
      if (ms <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [kickoffAt]);

  const isLocked = isMatchLocked(kickoffAt);
  const isUrgent = !isLocked && remainingMs < 60 * 60 * 1000; // < 1 hour

  return {
    display: formatCountdown(remainingMs),
    isLocked,
    isUrgent,
    remainingMs,
  };
}

