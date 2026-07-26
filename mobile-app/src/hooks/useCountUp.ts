import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly tweens a number from 0 up to `target` using requestAnimationFrame.
 * Direct RN port of frontend/src/hooks/useCountUp.ts.
 */
export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | undefined>(undefined);
  const fromRef = useRef(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(target) ? target : 0;
    fromRef.current = 0;
    startRef.current = undefined;

    if (duration <= 0) {
      setValue(safeTarget);
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === undefined) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(fromRef.current + (safeTarget - fromRef.current) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setValue(safeTarget);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
