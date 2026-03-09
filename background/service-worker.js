// background/service-worker.js
// Tracks time spent on each domain by listening to tab and window focus events.

import { addTime, getToday } from "../utils/storage.js";
import { categorize } from "../utils/categorizer.js";
import { formatBadge, badgeColor } from "../utils/time.js";

const IDLE_THRESHOLD_SECS = 30;

// --- State (in-memory, lives as long as the service worker is alive) ----------

let activeTabId = null;   // currently focused tab
let activeUrl = null;     // URL of the active tab
let sessionStart = null;  // timestamp (ms) when the current session began

// --- Helpers -----------------------------------------------------------------

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function isTrackableUrl(url) {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Saves elapsed time for the current session to storage, then resets state.
 */
async function flushSession() {
  if (!sessionStart || !isTrackableUrl(activeUrl)) {
    sessionStart = null;
    return;
  }

  const elapsed = Date.now() - sessionStart;
  const domain = extractDomain(activeUrl);

  if (domain && elapsed > 0) {
    const { category, subcategory } = await categorize(domain, activeUrl);
    await addTime(domain, category, subcategory, elapsed);
    await updateBadge();
  }

  sessionStart = null;
}

/**
 * Starts tracking a new session for the given tab.
 */
async function startSession(tabId, url) {
  await flushSession();

  if (!isTrackableUrl(url)) {
    activeTabId = null;
    activeUrl = null;
    return;
  }

  activeTabId = tabId;
  activeUrl = url;
  sessionStart = Date.now();
}

// --- Event Listeners ---------------------------------------------------------

// User switches to a different tab
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await startSession(tabId, tab.url);
  } catch {
    // Tab may have closed before we could query it
  }
});

// URL changes within the active tab (navigation, single-page app route change)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== activeTabId) return;
  if (changeInfo.status !== "complete") return;

  await startSession(tabId, tab.url);
});

// Browser window loses or regains focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus — save and pause
    await flushSession();
    return;
  }

  // Window regained focus — resume tracking the active tab in that window
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      await startSession(tab.id, tab.url);
    }
  } catch {
    // No active tab found
  }
});

// User goes idle — pause tracking
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "idle" || state === "locked") {
    await flushSession();
  } else if (state === "active") {
    // Resume tracking whichever tab is currently active
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (tab) {
        await startSession(tab.id, tab.url);
      }
    } catch {
      // No active tab found
    }
  }
});

// --- Badge ------------------------------------------------------------------

async function updateBadge() {
  const today = await getToday();
  chrome.action.setBadgeText({ text: formatBadge(today.totalMs) });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor(today.totalMs) });
}

// Set idle detection threshold and initialise badge on startup
chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECS);
updateBadge();
