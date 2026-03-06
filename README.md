# ReadTrack

A Chrome extension that tracks the time you spend reading across the web — and tells you where your reading time actually goes.

## Features

- **Automatic time tracking** — starts and stops as you browse, switch tabs, or step away
- **Smart categorization** — classifies sites into Documentation, Blogs, News, Social Media, Research, eBooks, and more
- **Daily stats** — see total reading time and a top-sites breakdown right in the popup
- **Weekly chart** — a 7-day bar chart of your reading activity on the full stats page
- **Category breakdown** — percentage split of today's reading time by site type
- **Manual overrides** — reassign any domain to a different category from the settings page
- **Data export** — download all your data as JSON or CSV
- **100% private** — all data is stored locally on your device, never sent anywhere

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

- **Popup** — click the extension icon to see your current site's time, today's total, and your top 5 sites
- **Full stats** — click "View full stats" in the popup for the weekly chart and category breakdown
- **Settings** — right-click the extension icon and select **Options** to manage category overrides, export data, or clear all history

## Privacy

ReadTrack stores all data in `chrome.storage.local` on your own device. No account is required, no data is transmitted to any server, and no third-party analytics are used. You can delete all stored data at any time from the Settings page.

## Tech Stack

- Manifest V3
- Vanilla JavaScript (ES Modules)
- `chrome.tabs`, `chrome.storage`, `chrome.idle`, `chrome.webNavigation`, `chrome.action`
- Pure CSS (no frameworks or build tools)

## License

MIT
