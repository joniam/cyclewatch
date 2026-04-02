# CycleWatch — Build Brief for Claude Code

## What we're building

A lightweight mobile web app for cyclists to report and discover road incidents nearby. No frameworks, no build tools — a single HTML file that runs in Chrome.

## Problem

Cyclists encounter road hazards, closures, construction, and accidents that general navigation apps don't surface usefully for cycling. There's no quick, low-friction way to report something you just encountered, or to see what other cyclists have flagged nearby before you head out.

## User

Urban cyclist on a mobile phone, moving through the city. Speed of interaction is critical — reporting should take under 10 seconds.

---

## Core flows

### Discover
- On load, map centers on the user's location (browser geolocation)
- Incidents appear as map pins, color-coded by type: closures = red, hazards/construction = amber
- A scrollable feed below the map lists incidents sorted by recency, showing distance, incident type, and street name (reverse geocoded)
- Feed has two tabs: **Nearby** (all incidents) and **Mine** (user's own submissions)

### Report
- Tapping "+ Report" opens a bottom sheet over the map
- User drags a pin to the exact location
- Picks an incident type: Road hazard, Road closure, Accident, Construction
- Optionally adds a short text note
- Taps Submit — pin drops onto the map immediately

### Mine tab
- Shows the user's own past submissions
- Each report shows status: pending sync, submitted, or resolved
- Reports expire and are hidden after 24 hours

---

## Data strategy

Use a **dual-write pattern**:

1. On submission, write immediately to `localStorage` (so Mine tab works instantly and offline)
2. Also fire the report to the Mapbox Feedback API in parallel
3. If the API call fails, flag the report as `pending_sync` in localStorage
4. On next app load, retry any `pending_sync` reports

This means the app is fully functional offline and syncs when connectivity is available.

---

## APIs

- **Mapbox GL JS v3** — map rendering, markers, layers
- **Mapbox Geocoding API** — reverse geocode the dropped pin location to get a human-readable street name for the feed
- **Mapbox Feedback API** — submit and retrieve incident reports

---

## Tech stack

- Vanilla JS only — no React, no Vue, no framework
- Single `index.html` file with all CSS and JS inline
- Mobile-first CSS (375px base width)
- Mapbox GL JS loaded via CDN

---

## Project structure

```
cyclewatch/
├── index.html       # entire app lives here
└── README.md        # setup notes and token instructions
```

---

## Mapbox MCP DevKit — required setup before coding

This project uses the Mapbox MCP DevKit, which gives Claude Code direct access to Mapbox developer APIs (token management, style tools, GeoJSON validation, coordinate utilities, and more).

**Before writing any code**, confirm the DevKit is available by attempting to list Mapbox tools. If it is not accessible, stop and surface the issue rather than proceeding without it.

### Install the DevKit (if not already configured)

The simplest setup uses the hosted endpoint with OAuth — no token management required:

Add this to `.mcp.json` in the project root (project-level) or `~/.claude.json` (user-level):

```json
{
  "mcpServers": {
    "mapbox-devkit": {
      "url": "https://mcp-devkit.mapbox.com/mcp"
    }
  }
}
```

On first connection you'll be prompted to complete an OAuth flow in the browser.

Alternatively, install via the CC CLI:

```bash
claude mcp add mapbox-devkit npx @mapbox/mcp-devkit-server -e MAPBOX_ACCESS_TOKEN=<YOUR_TOKEN>
```

### Confirm access before proceeding

At the start of the session, CC should verify the DevKit is reachable and list the available tools. Only proceed with building once this is confirmed.

---

## Token setup

Define the Mapbox token as a constant at the top of the JS in `index.html`:

```js
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
```

All Mapbox SDK and API calls should reference this constant. Do not hardcode the token anywhere else in the file.

---

## V1 scope boundaries

- No user accounts or authentication
- No photo attachments
- No upvoting or confirmation of reports
- No push notifications
- Reports older than 24 hours are hidden automatically
- Location is browser geolocation only — no manual city search

---

## UI notes

- Primary action button: "+ Report" in the top-right of the header
- Report sheet: bottom sheet pattern, slides up over the map
- Incident type selector: 2x2 grid of tappable tiles, selected state highlighted
- Feed items: incident type, street name, time ago, distance from current location
- Color coding: red for Road closure and Accident, amber for Road hazard and Construction
- The map should take roughly 55% of the viewport height, feed takes the rest
