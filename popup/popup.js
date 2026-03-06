// popup/popup.js
// Renders today's reading stats and the current site's tracked time.

import { getToday } from "../utils/storage.js";
import { formatMs } from "../utils/time.js";
import { categorize } from "../utils/categorizer.js";

const TOP_SITES_LIMIT = 5;

/**
 * Returns the domain of the currently active tab, or null if not trackable.
 */
async function getActiveDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;

  try {
    const { hostname } = new URL(tab.url);
    return hostname || null;
  } catch {
    return null;
  }
}

/**
 * Sorts byDomain entries and returns the top N by time spent.
 */
function getTopSites(byDomain, limit) {
  return Object.entries(byDomain)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

async function render() {
  const [today, activeDomain] = await Promise.all([getToday(), getActiveDomain()]);

  // Today's total
  document.getElementById("today-total").textContent = formatMs(today.totalMs);

  // Current site
  if (activeDomain) {
    const [siteCategory] = await Promise.all([
      categorize(activeDomain, (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.url ?? ""),
    ]);

    document.getElementById("current-domain").textContent = activeDomain;
    const siteMs = today.byDomain[activeDomain] ?? 0;
    document.getElementById("current-time").textContent = formatMs(siteMs);
    document.getElementById("current-category").textContent = siteCategory;
  } else {
    document.getElementById("current-domain").textContent = "Not a web page";
    document.getElementById("current-time").textContent = "—";
    document.getElementById("current-category").textContent = "";
  }

  // Top sites list
  const list = document.getElementById("top-sites-list");
  const topSites = getTopSites(today.byDomain, TOP_SITES_LIMIT);

  if (topSites.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No reading tracked yet today.";
    list.appendChild(empty);
    return;
  }

  for (const [domain, ms] of topSites) {
    const li = document.createElement("li");

    const domainSpan = document.createElement("span");
    domainSpan.className = "site-domain";
    domainSpan.textContent = domain;

    const timeSpan = document.createElement("span");
    timeSpan.className = "site-time";
    timeSpan.textContent = formatMs(ms);

    li.appendChild(domainSpan);
    li.appendChild(timeSpan);
    list.appendChild(li);
  }
}

render();

document.getElementById("stats-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("stats/stats.html") });
});
