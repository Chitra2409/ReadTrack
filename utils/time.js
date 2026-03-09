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

/**
 * Compact format for the extension icon badge (max ~4 chars).
 * Shows only the dominant unit for readability at small sizes.
 * Examples: 5400000 → "1.5h" | 2700000 → "45m" | 45000 → "<1m"
 */
export function formatBadge(ms) {
  if (ms <= 0) return "";

  const totalMinutes = ms / 60000;

  if (totalMinutes < 1) return "<1m";
  if (totalMinutes < 60) return `${Math.floor(totalMinutes)}m`;

  const hours = totalMinutes / 60;
  // Show one decimal only when it adds info (e.g. 1.5h), drop it for whole hours
  return Number.isInteger(Math.round(hours * 2) / 2) && hours % 1 === 0
    ? `${Math.floor(hours)}h`
    : `${(Math.round(hours * 2) / 2).toFixed(1)}h`;
}

/**
 * Returns a badge background color based on daily reading time.
 * Gray → Blue → Green → Orange as reading time increases.
 */
export function badgeColor(ms) {
  const minutes = ms / 60000;
  if (minutes < 30)  return "#888888"; // < 30 min  — neutral gray
  if (minutes < 60)  return "#4a7cf7"; // 30–60 min — blue
  if (minutes < 120) return "#2db670"; // 1–2 hours — green
  return "#f7934a";                    // > 2 hours — orange
}
