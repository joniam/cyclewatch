# CycleWatch

## Project
A lightweight mobile web app for cyclists to report and discover road incidents nearby. Single `index.html`, no frameworks, no build tools. Cyclists can drop a pin, pick an incident type, and submit a report in under 10 seconds. Reports are submitted to the **Mapbox Feedback API** and mirrored in localStorage. Hosted on GitHub Pages, installable as a home screen app via PWA.

## Stack
- Vanilla JS — no React, no Vue, no framework
- Single `index.html` with all CSS and JS inline; `manifest.json`, `sw.js`, and icons alongside it
- Tailwind CSS via CDN (design tokens inline), Inter + Material Symbols via Google Fonts
- Mapbox GL JS v3 via CDN — map rendering, markers, reverse geocoding
- **Mapbox Feedback API** (`POST /user-feedback/v1/feedback`) — authoritative store for submitted reports
- localStorage — mirrors API submissions; used for instant UI updates and offline resilience
- GitHub Pages — HTTPS hosting, deploy on every push to `main`
- PWA — installable via Safari "Add to Home Screen", standalone display mode
- Mapbox MCP DevKit — used to create and validate the custom map style, manage tokens

## Tokens
Two tokens are needed:

| Token | Scope | Purpose |
|---|---|---|
| `MAPBOX_TOKEN` (pk.*) | styles:read, tiles:read, fonts:read | Map rendering, geocoding |
| `FEEDBACK_TOKEN` (pk.* with user-feedback:write) | user-feedback:write | Submitting incident reports to Feedback API |

**CycleWatch-specific token** (with URL restriction to `https://joniam.github.io`):
- Created in Mapbox dashboard with public scopes + `user-feedback:write`
- Used for both map rendering and feedback submission
- Never commit a `sk.*` token to a public repo

## Feedback API
**Endpoint:** `POST https://api.mapbox.com/user-feedback/v1/feedback?access_token=TOKEN`

**Request body:**
```json
{
  "feedback": "string — incident description incl. type",
  "lat": 51.509,
  "lon": -0.118,
  "category": "string — Mapbox incident sub-type"
}
```

**CycleWatch → Mapbox category mapping:**
| CycleWatch type | Mapbox category | Colour |
|---|---|---|
| accident | `Road Hazard` | red |
| closure | `Road Closure` | red |
| hazard | `Road Hazard` | amber |
| construction | `Construction` | amber |

**Response:** includes `id` (feedback_id), `status` (`received` → `fixed` / `reviewed` / `out_of_scope`)

**Note:** category string values accepted by the POST endpoint are not yet confirmed — need to test `Road Hazard` vs `road_hazard` vs `road_incident_issue` on first submit.

## Known bugs / polish needed (fix as we go, not end-stage)
- **Layers button** — tapping does nothing. Deferred to final polish.
- **Header vertical rhythm** — safe-area padding is above the text only; content should be vertically centred within the full header height.
- **PWA bootstrap update** — clearing Safari website data is the only way to force-update a stale first install. Tap-wordmark works for all subsequent updates.

## Status
- Step 1 ✅ — Scaffold built and verified.
- Step 2 ✅ — App live at `https://joniam.github.io/cyclewatch/`. PWA installs, runs standalone, caches offline. Token setup screen collects and validates both tokens (stored in localStorage only). Location persists across loads. Build number in header; tap-wordmark applies SW updates.
- Step 3 ✅ — Two-step report screen: pick location on full map with crosshair → confirm → form sheet slides up. Recenter button fixed. Address line uses `edit_location_alt` icon, wraps up to 2 lines.
- Step 4 next — Incident data layer.

## Next
**Step 4 — Incident data layer (localStorage + Feedback API).**

## Known issues / decisions

### Code commenting standard
Only comment when there's a decision, a trap, or a non-obvious "why this instead of the obvious thing." Three categories worth capturing:
- **Landmines** — things that will break if changed without understanding the consequences (e.g. service worker cache keys, Mapbox event timing)
- **Tradeoffs** — why a simpler/more obvious approach was rejected (e.g. "Haversine not Mapbox distance API — avoids a network call per card render")
- **Mapbox/browser gotchas** — API quirks that aren't in the docs and cost time to discover

Do not comment what the code does — only why it does it that way.

- **Feedback API is authoritative** — reports POST to `user-feedback/v1/feedback` on submit. localStorage mirrors the submission for instant UI and offline resilience. Mine tab reads from localStorage; status updates poll the API by feedback_id.
- **Community sharing via Feedback API** — all submissions go to Mapbox's pipeline. Nearby tab shows own reports + seeded demo data (the API has no geographic query endpoint for reading others' reports).
- **No report expiry** — all reports are kept permanently. Mine tab shows full history regardless of age.
- **Incident types** — Accident, Closure, Hazard, Construction. Map to Mapbox Feedback API categories (Road Hazard, Road Closure, Construction). Accident and Hazard both map to Road Hazard; type is preserved in the `feedback` text and localStorage.
- **Tailwind via CDN** — consistent with how Mapbox GL JS is loaded; no build step required.
- **Dev workflow** — edit files → `git commit` → `git push` → ~30s → refresh on iPhone. GitHub Pages auto-deploys from `main`.

---

## Build plan

### Step 1 — Project scaffold & design system shell ✅

Create `index.html` with:
- Tailwind CDN + config block (all design tokens from Stitch)
- Inter + Material Symbols from Google Fonts
- Mapbox GL JS v3 CDN link + CSS
- `const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE'` at top of JS
- Static header (CycleWatch wordmark + "+ Report" button)
- Bottom nav shell (Nearby / Mine tabs, glassmorphism)
- Map canvas placeholder (55% viewport height)
- Feed sheet placeholder (45% viewport height, rounded-t-3xl)

**Acceptance criteria:**
- [x] `index.html` opens in Chrome mobile emulator (375px) with no console errors
- [x] Header renders with glassmorphism, "+ Report" button in primary blue
- [x] Bottom nav renders with glassmorphism, correct icons
- [x] 55/45 layout visible, no overflow or scroll bleed
- [x] All Tailwind tokens resolve correctly (spot-check: primary = #0058bc)

---

### Step 2 — GitHub Pages + PWA + add to iPhone home screen ✅

**Acceptance criteria:**
- [x] App is live at `https://joniam.github.io/cyclewatch/`
- [x] Visiting URL in iPhone Safari → Share → Add to Home Screen installs with CycleWatch icon
- [x] Launches fullscreen with no Safari address bar
- [x] Theme colour (`#0058bc`) appears in the iOS status bar
- [x] App shell loads from cache when offline (UI visible, map tiles won't load — expected)
- [x] A code change pushed to GitHub is visible on iPhone after ~30s + tap wordmark to update

---

### Step 3 — Report screen UI ✅

Two-step flow (revised from original single-sheet design — the sheet covered the map, making location picking impossible):

**Step 1 — Pick location:** Tap "+ Report" → bottom nav hides, crosshair appears at map centre, compact location bar slides up from bottom with live reverse-geocoded address + "Confirm Location" button. Map stays fully visible and pannable.

**Step 2 — Form:** "Confirm Location" locks coords, hides crosshair, dims map, slides up form sheet with:
- Confirmed address line (`edit_location_alt` icon, wraps up to 2 lines) — tap to return to step 1
- 2×2 incident type tiles (Accident, Closure = red; Hazard, Construction = amber)
- Optional textarea
- Submit button (disabled until type selected)
- Cancel

**Acceptance criteria:**
- [x] Step 1 bar and step 2 sheet both animate with slide-up/down transitions
- [x] Map fully pannable during step 1; address updates live on pan
- [x] One tile selectable at a time; selected state uses type colour ring
- [x] Submit disabled until type selected
- [x] Cancel from either step resets all state and restores bottom nav
- [x] Tapping address in step 2 returns to step 1 preserving form state
- [x] Recenter button fixed (safe-area-inset-top added to top offset)

---

### Step 4 — Incident data layer (localStorage + Feedback API)

Data helpers:
- `loadIncidents()` — read + parse from localStorage
- `saveIncidents(arr)` — serialise to localStorage
- `addIncident(incident)` — append + save; returns record
- `updateIncident(id, patch)` — merge patch + save
- `submitToFeedbackAPI(incident)` — POST to Feedback API; updates record with `feedbackId`
- Seed 3 demo incidents on first load (not submitted to API)

Data model:
```js
{
  id: string,             // crypto.randomUUID()
  feedbackId: string,     // Mapbox feedback_id, populated after API submission
  feedbackStatus: string, // 'received' | 'fixed' | 'reviewed' | 'out_of_scope' | null
  type: 'accident' | 'closure' | 'hazard' | 'construction',
  mapboxCategory: string,
  lat: number,
  lng: number,
  note: string,
  streetName: string,     // populated async via reverse geocode
  timestamp: number,
  isOwn: boolean
}
```

**Acceptance criteria:**
- [ ] Demo incidents persist across page reloads
- [ ] `addIncident` / `updateIncident` round-trip correctly (verify in console)
- [ ] `submitToFeedbackAPI` POSTs correctly and stores returned `feedbackId`

---

### Step 5 — Submit report flow

On "Submit Report":
1. Capture `map.getCenter()` as incident coords
2. Write to localStorage immediately (`feedbackId: null`, `isOwn: true`)
3. Dismiss screen; pin appears on map; card added to feed
4. Reverse geocode async → update `streetName` in localStorage and re-render card
5. POST to Feedback API async → update record with `feedbackId` + `feedbackStatus: 'received'`

If API call fails: report stays with `feedbackId: null`. No retry in V1 — subtle error state on card.

**Acceptance criteria:**
- [ ] Pin appears on map within 200ms of submit
- [ ] Card appears immediately with "—" street name placeholder
- [ ] Street name populates without layout shift
- [ ] `feedbackId` populates after API response (visible in Mine tab)
- [ ] Report survives page reload
- [ ] End-to-end submit in under 10 seconds

---

### Step 6 — Incident markers on map

Custom HTML markers from localStorage:
- 32px circle, white border, icon inside
- Red (`#bc000a`) for accident/closure; amber (`#745b00`) for hazard/construction
- Icons: `car_crash`, `block`, `error`, `construction` (Material Symbols filled)
- Added after map `load` event; refresh when incidents change

**Acceptance criteria:**
- [ ] All demo incidents appear as correct-colour pins on map load
- [ ] Tapping a marker does not throw errors (click handler stubbed)

---

### Step 7 — Incident feed (Nearby tab)

Cards below the map, sorted newest-first. Each card: type icon, label, street name, severity badge, distance chip, time-ago chip. Distance via Haversine. Time-ago updates every 30s.

**Acceptance criteria:**
- [ ] Demo incidents render as cards matching Stitch design
- [ ] Distance and time-ago populate correctly
- [ ] Empty state: "No incidents nearby"

---

### Step 8 — Mine tab

Shows only `isOwn: true` incidents, newest-first. Status badges from `feedbackStatus`: `received` (blue), `fixed` (green), `reviewed`/`out_of_scope` (muted), `null` (grey "Pending").

**Acceptance criteria:**
- [ ] Only own reports shown
- [ ] Status badges correct
- [ ] Empty state: "Your reports will appear here"
- [ ] Updates live on new submission

---

### Step 9 — Final polish

- Custom map style via DevKit: base `standard`, `lightPreset: day`, reduce POI density, tint water, hide 3D buildings. Validate, optimise, WCAG AA contrast check for incident colours, swap style URL into `index.html`.
- Fix remaining known bugs (header rhythm, layers button)
- Visual audit against Stitch references on physical iPhone
- Zero console errors
- End-to-end submit under 10 seconds on device

---

## File output

```
CycleWatch/
├── index.html         # entire app
├── manifest.json      # PWA identity
├── sw.js              # service worker (offline shell cache)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── CLAUDE.md          # this file
└── README.md          # token setup + GitHub Pages deploy instructions
```

## Out of scope (V1)

- User accounts / auth
- Photo attachments
- Upvoting / report confirmation
- Push notifications
- Manual city search
- Reading other users' reports from the Feedback API (no geographic query endpoint)
- Report expiry — all reports kept indefinitely
- Retry logic for failed API submissions
