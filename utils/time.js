// utils/time.js
// Helpers for formatting millisecond durations into human-readable strings.

/**
 * Converts milliseconds to a short readable string.
 * Examples: 3661000 → "1h 1m"  |  75000 → "1m 15s"  |  9000 → "9s"
 */
export function formatMs(ms) {
  if (ms <= 0) return "0s";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
