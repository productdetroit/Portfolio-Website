"use client";

import { useEffect, useRef } from "react";

/** One orchestrated count-up on load — 600ms, staggered, once (spec §8).
 *  Server-rendered markup carries the final value, so no-JS and
 *  prefers-reduced-motion readers see the real number immediately. */
export default function CountUp({
  value,
  order = 0,
}: {
  value: number;
  order?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dur = 600;
    const t0 = performance.now() + order * 70;
    let raf: number;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = String(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, order]);

  return <span ref={ref}>{value}</span>;
}
