import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens a number from 0 up to `target` using requestAnimationFrame.
 * Re-runs whenever `target` changes, so values "roll up" instead of snapping.
 *
 * @param target   The value to count up to.
 * @param duration Animation duration in ms (default 1000).
 * @returns The current animated value (not rounded — round at the call site).
 */
export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();
  const fromRef = useRef(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(target) ? target : 0;
    fromRef.current = 0;
    startRef.current = undefined;

    // Respect reduced-motion preference: jump straight to the value.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || duration <= 0) {
      setValue(safeTarget);
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === undefined) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic for a natural decelerating roll.
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
