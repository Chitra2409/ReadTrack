// stats/stats.js
// Renders the full stats page: bar chart, category breakdown, per-domain list.
// All sections respond to the range dropdown and day-of-week filter.

import { getLastNDays } from "../utils/storage.js";
import { formatMs } from "../utils/time.js";
import { SUBCATEGORY_TO_CATEGORY } from "../utils/categorizer.js";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Data helpers -----------------------------------------------------------

/**
 * Merges byDomain and byCategory across all days in the range into a single aggregate.
 */
function aggregateDays(days) {
  const byDomain = {};
  const byCategory = {};
  const bySubcategory = {};
  let totalMs = 0;

  for (const day of days) {
    totalMs += day.totalMs || 0;

    for (const [domain, ms] of Object.entries(day.byDomain || {})) {
      byDomain[domain] = (byDomain[domain] || 0) + ms;
    }
    for (const [category, ms] of Object.entries(day.byCategory || {})) {
      byCategory[category] = (byCategory[category] || 0) + ms;
    }
    for (const [subcategory, ms] of Object.entries(day.bySubcategory || {})) {
      bySubcategory[subcategory] = (bySubcategory[subcategory] || 0) + ms;
    }
  }

  return { totalMs, byDomain, byCategory, bySubcategory };
}

// --- Bar chart --------------------------------------------------------------

function renderChart(days) {
  const chart = document.getElementById("weekly-chart");
  chart.innerHTML = "";

  const maxMs = Math.max(...days.map((d) => d.totalMs), 1);
  const rangeTotal = days.reduce((sum, d) => sum + d.totalMs, 0);
  const daysWithData = days.filter((d) => d.totalMs > 0).length;
  const avg = daysWithData > 0 ? rangeTotal / daysWithData : 0;

  document.getElementById("week-total-label").textContent = `Total: ${formatMs(rangeTotal)}`;
  document.getElementById("week-avg-label").textContent = `Daily avg: ${formatMs(avg)}`;

  const todayStr = new Date().toISOString().slice(0, 10);

  for (const day of days) {
    const heightPct = Math.max((day.totalMs / maxMs) * 100, day.totalMs > 0 ? 2 : 0);
    const date = new Date(day.date + "T00:00:00");
    const isToday = day.date === todayStr;

    // For ranges > 14 days show date number, otherwise show day name
    const label = days.length > 14
      ? String(date.getDate())
      : DAY_LABELS[date.getDay()];

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
    dayLabelEl.textContent = label;

    col.appendChild(timeLabel);
    col.appendChild(bar);
    col.appendChild(dayLabelEl);
    chart.appendChild(col);
  }
}

// --- Category breakdown (nested) --------------------------------------------

function renderCategoryBreakdown(aggregate) {
  const container = document.getElementById("category-breakdown");
  container.innerHTML = "";

  if (Object.keys(aggregate.byCategory).length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No data for this period.";
    container.appendChild(empty);
    return;
  }

  // Sort parent categories by time
  const parentEntries = Object.entries(aggregate.byCategory).sort(([, a], [, b]) => b - a);
  const maxCategoryMs = parentEntries[0][1];

  for (const [category, categoryMs] of parentEntries) {
    const pct = Math.round((categoryMs / aggregate.totalMs) * 100);
    const barWidth = Math.round((categoryMs / maxCategoryMs) * 100);

    // Parent row
    const group = document.createElement("div");
    group.className = "category-group";

    const meta = document.createElement("div");
    meta.className = "category-meta";

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = `${category} · ${pct}%`;

    const time = document.createElement("span");
    time.className = "category-time";
    time.textContent = formatMs(categoryMs);

    meta.appendChild(name);
    meta.appendChild(time);

    const track = document.createElement("div");
    track.className = "category-bar-track";

    const fill = document.createElement("div");
    fill.className = "category-bar-fill";
    fill.style.width = `${barWidth}%`;

    track.appendChild(fill);
    group.appendChild(meta);
    group.appendChild(track);

    // Subcategory rows — find subcategories belonging to this parent
    const subEntries = Object.entries(aggregate.bySubcategory)
      .filter(([sub]) => SUBCATEGORY_TO_CATEGORY[sub] === category)
      .sort(([, a], [, b]) => b - a);

    if (subEntries.length > 0) {
      const subList = document.createElement("div");
      subList.className = "subcategory-list";

      for (const [subcategory, subMs] of subEntries) {
        const subPct = Math.round((subMs / categoryMs) * 100);

        const subRow = document.createElement("div");
        subRow.className = "subcategory-row";

        const subName = document.createElement("span");
        subName.className = "subcategory-name";
        subName.textContent = `${subcategory} · ${subPct}%`;

        const subTime = document.createElement("span");
        subTime.className = "subcategory-time";
        subTime.textContent = formatMs(subMs);

        subRow.appendChild(subName);
        subRow.appendChild(subTime);
        subList.appendChild(subRow);
      }

      group.appendChild(subList);
    }

    container.appendChild(group);
  }
}

// --- Domain list ------------------------------------------------------------

function renderDomainList(aggregate) {
  const list = document.getElementById("domain-list");
  list.innerHTML = "";

  const entries = Object.entries(aggregate.byDomain).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No sites tracked in this period.";
    list.appendChild(empty);
    return;
  }

  for (const [domain, ms] of entries) {
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

// --- Section heading updater ------------------------------------------------

function updateHeadings(n, selectedDay) {
  const DAY_NAMES = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  const rangeLabel = selectedDay !== null
    ? `${DAY_NAMES[selectedDay]} in last ${n} days`
    : `Last ${n} days`;

  document.getElementById("range-heading").textContent = rangeLabel;
  document.getElementById("category-heading").textContent = `${rangeLabel} by category`;
  document.getElementById("domain-heading").textContent = `${rangeLabel} by site`;
}

// --- Day selector -----------------------------------------------------------

let selectedDay = null; // 0 = Sun, 1 = Mon, … 6 = Sat, null = all days

const dayButtons = document.querySelectorAll(".day-btn");

dayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const day = Number(btn.dataset.day);

    if (selectedDay === day) {
      // Clicking the active day deselects it
      selectedDay = null;
      btn.classList.remove("active");
    } else {
      selectedDay = day;
      dayButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    }

    render(Number(rangeSelect.value), selectedDay);
  });
});

// --- Entry point ------------------------------------------------------------

async function render(n, dayFilter = null) {
  let days = await getLastNDays(n);

  if (dayFilter !== null) {
    days = days.filter((d) => new Date(d.date + "T00:00:00").getDay() === dayFilter);
  }

  const aggregate = aggregateDays(days);

  updateHeadings(n, dayFilter);
  renderChart(days);
  renderCategoryBreakdown(aggregate);
  renderDomainList(aggregate);
}

const rangeSelect = document.getElementById("range-select");

rangeSelect.addEventListener("change", () => {
  render(Number(rangeSelect.value), selectedDay);
});

render(Number(rangeSelect.value), selectedDay);
