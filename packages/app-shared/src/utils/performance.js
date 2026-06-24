/**
 * Performance measurement utilities (Task 17.4)
 */

export const PERFORMANCE_TARGETS = {
  lighthouseScore: 90,
  fcpMs: 1800,
  ttiMs: 3800,
  themeSwitchMs: 100,
};

/**
 * Record theme switch duration for devtools / audits.
 * @param {number} durationMs
 */
export function recordThemeSwitchMs(durationMs) {
  if (typeof window === 'undefined') return;
  window.__SKOOLIFIC_PERF__ = {
    ...(window.__SKOOLIFIC_PERF__ || {}),
    lastThemeSwitchMs: durationMs,
    themeSwitchWithinTarget: durationMs <= PERFORMANCE_TARGETS.themeSwitchMs,
  };
}

/**
 * Measure async work and return duration in ms.
 * @param {() => void | Promise<void>} fn
 * @returns {Promise<number>}
 */
export async function measureDuration(fn) {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

/**
 * Compare build-time bundle hints (dev only).
 * @returns {Object|null}
 */
export function getPerformanceSnapshot() {
  if (typeof window === 'undefined') return null;
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return {
    themeSwitchMs: window.__SKOOLIFIC_PERF__?.lastThemeSwitchMs ?? null,
    domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
    loadEventMs: nav?.loadEventEnd ?? null,
    targets: PERFORMANCE_TARGETS,
  };
}
