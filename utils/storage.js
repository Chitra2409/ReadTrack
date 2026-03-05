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
 * Adds `ms` milliseconds to the tracked time for `domain` on today's date.
 * Creates the day entry if it does not exist yet.
 */
export async function addTime(domain, ms) {
  if (!domain || ms <= 0) return;

  const key = todayKey();
  const day = await storageGet(key, { totalMs: 0, byDomain: {} });

  day.totalMs = (day.totalMs || 0) + ms;
  day.byDomain[domain] = (day.byDomain[domain] || 0) + ms;

  await storageSet(key, day);
}

/**
 * Returns today's aggregated data: { totalMs, byDomain }
 */
export async function getToday() {
  return storageGet(todayKey(), { totalMs: 0, byDomain: {} });
}
