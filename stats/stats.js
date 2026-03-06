// stats/stats.js
// Renders the full stats page: weekly bar chart, category breakdown, per-domain list.

import { getLastNDays, getToday } from "../utils/storage.js";
import { formatMs } from "../utils/time.js";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Weekly chart -----------------------------------------------------------

function renderWeeklyChart(days) {
  const chart = document.getElementById("weekly-chart");
  chart.innerHTML = "";

  const maxMs = Math.max(...days.map((d) => d.totalMs), 1);
  const weekTotal = days.reduce((sum, d) => sum + d.totalMs, 0);
  const daysWithData = days.filter((d) => d.totalMs > 0).length;
  const avg = daysWithData > 0 ? weekTotal / daysWithData : 0;

  document.getElementById("week-total-label").textContent = `Total: ${formatMs(weekTotal)}`;
  document.getElementById("week-avg-label").textContent = `Daily avg: ${formatMs(avg)}`;

  const todayStr = new Date().toISOString().slice(0, 10);

  for (const day of days) {
    const heightPct = Math.max((day.totalMs / maxMs) * 100, day.totalMs > 0 ? 2 : 0);
    const date = new Date(day.date + "T00:00:00");
    const dayLabel = DAY_LABELS[date.getDay()];
    const isToday = day.date === todayStr;

    const col = document.createElement("div");
    col.className = "bar-col";

    const timeLabel = document.createElement("span");
    timeLabel.className = "bar-time";
    timeLabel.textContent = day.totalMs > 0 ? formatMs(day.totalMs) : "";

    const bar = document.createElement("div");
    bar.className = `bar${day.totalMs === 0 ? " empty" : ""}${isToday ? " today" : ""}`;
    bar.style.height = `${heightPct}%`;
    bar.title = `${day.date}: ${formatMs(day.totalMs)}`;

    const dayLabelEl = document.createElement("span");
    dayLabelEl.className = "bar-day";
    dayLabelEl.textContent = dayLabel;

    col.appendChild(timeLabel);
    col.appendChild(bar);
    col.appendChild(dayLabelEl);
    chart.appendChild(col);
  }
}

// --- Category breakdown -----------------------------------------------------

function renderCategoryBreakdown(today) {
  const container = document.getElementById("category-breakdown");
  container.innerHTML = "";

  const entries = Object.entries(today.byCategory).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No data yet for today.";
    container.appendChild(empty);
    return;
  }

  const maxMs = entries[0][1];

  for (const [category, ms] of entries) {
    const pct = Math.round((ms / today.totalMs) * 100);
    const barWidth = Math.round((ms / maxMs) * 100);

    const row = document.createElement("div");
    row.className = "category-row";

    const meta = document.createElement("div");
    meta.className = "category-meta";

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = `${category} · ${pct}%`;

    const time = document.createElement("span");
    time.className = "category-time";
    time.textContent = formatMs(ms);

    meta.appendChild(name);
    meta.appendChild(time);

    const track = document.createElement("div");
    track.className = "category-bar-track";

    const fill = document.createElement("div");
    fill.className = "category-bar-fill";
    fill.style.width = `${barWidth}%`;

    track.appendChild(fill);
    row.appendChild(meta);
    row.appendChild(track);
    container.appendChild(row);
  }
}

// --- Domain list ------------------------------------------------------------

function renderDomainList(today) {
  const list = document.getElementById("domain-list");
  list.innerHTML = "";

  const entries = Object.entries(today.byDomain).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No sites tracked today.";
    list.appendChild(empty);
    return;
  }

  for (const [domain, ms] of entries) {
    const category = today.byCategory
      ? Object.entries(today.byCategory).find(([, v]) => v > 0)?.[0] ?? "Other"
      : "Other";

    const li = document.createElement("li");

    const domainName = document.createElement("span");
    domainName.className = "domain-name";
    domainName.textContent = domain;

    const right = document.createElement("div");
    right.className = "domain-right";

    const domainTime = document.createElement("span");
    domainTime.className = "domain-time";
    domainTime.textContent = formatMs(ms);

    right.appendChild(domainTime);
    li.appendChild(domainName);
    li.appendChild(right);
    list.appendChild(li);
  }
}

// --- Entry point ------------------------------------------------------------

async function render() {
  const [days, today] = await Promise.all([getLastNDays(7), getToday()]);
  renderWeeklyChart(days);
  renderCategoryBreakdown(today);
  renderDomainList(today);
}

render();
