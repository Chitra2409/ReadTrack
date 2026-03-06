// options/options.js
// Manages user-defined category overrides for specific domains.

import { storageGet, storageSet, todayKey } from "../utils/storage.js";

const STORAGE_KEY = "categoryOverrides";

const form = document.getElementById("override-form");
const domainInput = document.getElementById("override-domain");
const categorySelect = document.getElementById("override-category");
const formError = document.getElementById("form-error");
const list = document.getElementById("overrides-list");

/**
 * Normalises a raw domain input: lowercase, strip protocol and paths, trim whitespace.
 */
function normaliseDomain(raw) {
  let value = raw.trim().toLowerCase();
  try {
    if (value.includes("://")) {
      value = new URL(value).hostname;
    } else {
      value = new URL("https://" + value).hostname;
    }
  } catch {
    // Not a valid URL — return as-is and let validation catch it
  }
  return value;
}

function isValidDomain(domain) {
  return /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
}

/**
 * Renders the full list of overrides from storage.
 */
async function renderList() {
  const overrides = await storageGet(STORAGE_KEY, {});
  list.innerHTML = "";

  const entries = Object.entries(overrides);

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No overrides yet.";
    list.appendChild(empty);
    return;
  }

  for (const [domain, category] of entries) {
    const li = document.createElement("li");

    const domainSpan = document.createElement("span");
    domainSpan.className = "override-domain";
    domainSpan.textContent = domain;

    const right = document.createElement("div");
    right.className = "override-right";

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = category;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove override for ${domain}`);
    removeBtn.addEventListener("click", () => removeOverride(domain));

    right.appendChild(badge);
    right.appendChild(removeBtn);
    li.appendChild(domainSpan);
    li.appendChild(right);
    list.appendChild(li);
  }
}

async function addOverride(domain, category) {
  const overrides = await storageGet(STORAGE_KEY, {});
  overrides[domain] = category;
  await storageSet(STORAGE_KEY, overrides);
  await renderList();
}

async function removeOverride(domain) {
  const overrides = await storageGet(STORAGE_KEY, {});
  delete overrides[domain];
  await storageSet(STORAGE_KEY, overrides);
  await renderList();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const domain = normaliseDomain(domainInput.value);
  const category = categorySelect.value;

  if (!domain) {
    formError.textContent = "Please enter a domain.";
    return;
  }
  if (!isValidDomain(domain)) {
    formError.textContent = "Enter a valid domain, e.g. example.com";
    return;
  }
  if (!category) {
    formError.textContent = "Please select a category.";
    return;
  }

  await addOverride(domain, category);
  domainInput.value = "";
  categorySelect.value = "";
});

// --- Export -----------------------------------------------------------------

function getAllStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, resolve);
  });
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("export-json").addEventListener("click", async () => {
  const data = await getAllStorage();
  const filename = `readtrack-export-${todayKey()}.json`;
  downloadFile(filename, JSON.stringify(data, null, 2), "application/json");
});

document.getElementById("export-csv").addEventListener("click", async () => {
  const data = await getAllStorage();
  const rows = [["date", "domain", "milliseconds", "seconds", "minutes"]];

  for (const [key, value] of Object.entries(data)) {
    // Only process day entries (YYYY-MM-DD keys)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
    for (const [domain, ms] of Object.entries(value.byDomain ?? {})) {
      rows.push([key, domain, ms, Math.floor(ms / 1000), (ms / 60000).toFixed(2)]);
    }
  }

  const csv = rows.map((r) => r.join(",")).join("\n");
  downloadFile(`readtrack-export-${todayKey()}.csv`, csv, "text/csv");
});

// --- Clear all data ---------------------------------------------------------

document.getElementById("clear-data").addEventListener("click", async () => {
  const confirmed = window.confirm(
    "This will permanently delete all your reading history and settings. Are you sure?"
  );
  if (!confirmed) return;

  await new Promise((resolve) => chrome.storage.local.clear(resolve));
  await renderList();
});

// --- Init -------------------------------------------------------------------

renderList();
