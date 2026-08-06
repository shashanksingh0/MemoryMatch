import { useEffect, useRef, useState } from 'react';

export interface TimerApi {
  remainingMs: number;
  progress: number;
  timeUsedMs: number;
  running: boolean;
}

export function useTimer(limitMs: number | null, active: boolean, onExpire?: () => void): TimerApi {
  const [remainingMs, setRemainingMs] = useState(limitMs ?? 0);
  const [timeUsedMs, setTimeUsedMs] = useState(0);
  const startedAtRef = useRef(0);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (limitMs != null) {
      setRemainingMs(limitMs);
    }
  }, [limitMs]);

  useEffect(() => {
    if (!active) {
      return;
    }
    startedAtRef.current = Date.now();
    expiredRef.current = false;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setTimeUsedMs(elapsed);
      if (limitMs != null) {
        const remaining = Math.max(0, limitMs - elapsed);
        setRemainingMs(remaining);
        if (remaining <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(interval);
          onExpireRef.current?.();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [limitMs, active]);

  const progress = limitMs == null ? 1 : Math.max(0, Math.min(1, remainingMs / limitMs));

  return {
    remainingMs,
    progress,
    timeUsedMs,
    running: active && (limitMs == null || remainingMs > 0),
  };
}
