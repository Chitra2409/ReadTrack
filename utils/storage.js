// utils/storage.js
// Wrapper around chrome.storage.local with helpers for ReadTrack's data model.

/**
 * Returns today's date string in YYYY-MM-DD format (local time).
 */
export function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Reads a key from chrome.storage.local.
 * Returns the stored value, or `defaultValue` if the key is not set.
 */
export function storageGet(key, defaultValue = null) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] !== undefined ? result[key] : defaultValue);
    });
  });
}

/**
 * Writes a key-value pair to chrome.storage.local.
 */
export function storageSet(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

/**
 * Adds `ms` milliseconds to the tracked time for `domain` and `category` on today's date.
 * Creates the day entry if it does not exist yet.
 */
export async function addTime(domain, category, ms) {
  if (!domain || ms <= 0) return;

  const key = todayKey();
  const day = await storageGet(key, { totalMs: 0, byDomain: {}, byCategory: {} });

  day.totalMs = (day.totalMs || 0) + ms;
  day.byDomain[domain] = (day.byDomain[domain] || 0) + ms;
  day.byCategory[category] = (day.byCategory[category] || 0) + ms;

  await storageSet(key, day);
}

/**
 * Returns today's aggregated data: { totalMs, byDomain, byCategory }
 */
export async function getToday() {
  return storageGet(todayKey(), { totalMs: 0, byDomain: {}, byCategory: {} });
}

/**
 * Returns an array of { date, totalMs, byDomain, byCategory } for the last `n` days
 * (including today), ordered from oldest to newest.
 */
export async function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    days.push({ date: key, index: i });
  }

  const keys = days.map((d) => d.date);
  const results = await new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });

  return days.map(({ date }) => ({
    date,
    ...(results[date] ?? { totalMs: 0, byDomain: {}, byCategory: {} }),
  }));
}
