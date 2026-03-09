# ReadTrack

A Chrome extension that tracks the time you spend reading across the web — and tells you where your reading time actually goes.

## Features

### Tracking
- **Automatic time tracking** — starts and stops as you browse, switch tabs, or step away
- **Idle detection** — timer pauses after 30 seconds of inactivity, resumes when you return
- **Icon badge** — shows today's total reading time at a glance, color-coded by intensity

### Categorization
- **Smart categorization** — automatically classifies every site into a parent category and subcategory
- **5 parent categories** — Technology, Reading, Academia, Social, Other
- **12 subcategories** — Documentation, Tutorials & Courses, Dev Blogs, Tech News, Blogs & Newsletters, News & Media, eBooks & Literature, Research Papers, Academic Journals, Social Media, Forums & Communities, Uncategorized
- **100+ built-in domains** — with subdomain suffix rules and URL path heuristics as fallback
- **Manual overrides** — reassign any domain to a different subcategory from the Settings page

### Stats
- **Popup** — current site time, today's total, and top 5 sites at a glance
- **Flexible time range** — view stats for the last 7, 10, 14, 21, or 30 days
- **Day-of-week filter** — click any day (Mon–Sun) to see aggregated stats for just that weekday across your selected range
- **Nested category breakdown** — reading time split by parent category with subcategories expanded underneath
- **Per-domain list** — all tracked sites sorted by time for the selected period
- **Weekly bar chart** — daily reading bars with today highlighted

### Data & Privacy
- **Data export** — download all your history as JSON or CSV
- **Clear all data** — wipe everything from the Settings page with one click
- **100% private** — all data stored locally on your device, never sent anywhere

## Badge Color Guide

| Color | Meaning |
|---|---|
| Gray | Less than 30 minutes read today |
| Blue | 30–60 minutes |
| Green | 1–2 hours |
| Orange | More than 2 hours |

## Installation

### From the Chrome Web Store
_Coming soon._

### Load unpacked (development)
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The ReadTrack icon will appear in your toolbar

## Usage

- **Popup** — click the extension icon to see your current site, its subcategory, time on it today, and your top 5 sites
- **Full stats** — click "View full stats" in the popup to open the stats page in a new tab
- **Stats page** — use the range dropdown and day buttons to explore your reading patterns
- **Settings** — right-click the extension icon → **Options** to manage category overrides, export data, or clear all history

## Privacy

ReadTrack stores all data in `chrome.storage.local` on your own device. No account is required, no data is transmitted to any server, and no third-party analytics are used. You can view exactly what is stored by opening the browser DevTools console and running `chrome.storage.local.get(null, console.log)`. You can delete all stored data at any time from the Settings page.

## Tech Stack

- Manifest V3
- Vanilla JavaScript (ES Modules)
- `chrome.tabs`, `chrome.windows`, `chrome.storage`, `chrome.idle`, `chrome.action`, `chrome.runtime`
- Pure CSS — no frameworks, no build tools

## License

MIT
