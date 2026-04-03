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

## Known bugs / deferred
- **Layers button** — tapping the layers button on the map does nothing. Functionality not yet implemented. Deferred to Step 11 polish.

## Status
- Step 1 complete — `index.html` scaffold built and verified in Chrome mobile emulator.
- Step 2 complete — PWA files built. Push to GitHub Pages blocked pending token setup (see Step 2 acceptance criteria).
- Step 3 next.

## Next
**Step 3 — CycleWatch token + custom map style**

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

### Step 2 — GitHub Pages + PWA + add to iPhone home screen ✅ (partial)

Files built: `manifest.json`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`. PWA meta tags and sw registration added to `index.html`.

Push to GitHub Pages is blocked: GitHub Push Protection flags the public `pk.*` Mapbox token as a secret. Resolution: create a dedicated CycleWatch token with URL restriction (Step 3), then bypass or the restriction eliminates the block.

**Dev workflow for all subsequent steps:**
1. Edit files on desktop
2. `git commit -am "..." && git push`
3. Wait ~30 seconds for GitHub Pages to deploy
4. Refresh on iPhone (or relaunch from home screen icon)

**Acceptance criteria:**
- [ ] App is live at `https://joniam.github.io/cyclewatch/`
- [ ] Visiting URL in iPhone Safari → Share → Add to Home Screen installs with CycleWatch icon
- [ ] Launches fullscreen with no Safari address bar
- [ ] Theme colour (`#0058bc`) appears in the iOS status bar
- [ ] App shell loads from cache when offline (UI visible, map tiles won't load — expected)
- [ ] A code change pushed to GitHub is visible on iPhone after ~30s + refresh

---

### Step 3 — CycleWatch token + custom map style

**Token setup (complete the CycleWatch token):**
1. In Mapbox dashboard, finish configuring the CycleWatch token:
   - Public scopes: STYLES:TILES, STYLES:READ, FONTS:READ, DATASETS:READ, VISION:READ
   - Secret scopes: USER-FEEDBACK:READ, USER-FEEDBACK:WRITE
   - Allowed URL: `https://joniam.github.io`
2. Paste the new `pk.*` token — replace the one currently in `index.html`
3. Add `const FEEDBACK_TOKEN = MAPBOX_TOKEN` (same token, both scopes on one token)

**Custom map style via DevKit:**
1. `style_builder_tool` — generate a clean, cycling-focused light style:
   - Base: `standard`, `lightPreset: day`
   - Reduce POI label density to 2
   - Tint water to match surface palette
   - Hide 3D buildings (performance + clarity on mobile)
2. `create_style_tool` — save the style
3. `validate_style_tool` — confirm no spec errors
4. `optimize_style_tool` — strip unused layers
5. `check_color_contrast_tool` — verify secondary (#bc000a) and tertiary (#745b00) on white meet WCAG AA
6. `retrieve_style_tool` — get the saved style URL for embedding

**Then push to GitHub Pages** — token is now URL-restricted so Push Protection bypass is safe.

**Acceptance criteria:**
- [ ] CycleWatch token URL-restricted to `https://joniam.github.io`
- [ ] Custom style saved and retrievable; style URL in `index.html` comment
- [ ] Style validates with zero errors
- [ ] Both incident colours pass WCAG AA contrast check
- [ ] App live at `https://joniam.github.io/cyclewatch/`

---

### Step 4 — Live map with geolocation

Embed Mapbox GL JS map into the 55% canvas:
- Request `navigator.geolocation` on load; center map on user position
- Fallback center: London (`[-0.118, 51.509]`, zoom 13) if permission denied or timeout
- Add floating control cluster (top-right): recenter button, layers button — matching Stitch design
- Disable default Mapbox attribution UI; add minimal custom attribution

**Acceptance criteria:**
- [ ] Map renders using the custom style
- [ ] On permission grant: map centers on device location within 3 seconds
- [ ] On permission deny: map falls back to London gracefully, no error thrown
- [ ] Floating buttons render as frosted-glass circles, tapping recenter re-centres map
- [ ] No Mapbox GL errors in console

---

### Step 5 — Incident data layer (localStorage + Feedback API)

Implement data helpers:
- `loadIncidents()` — read + parse from localStorage; returns all records
- `saveIncidents(arr)` — serialise to localStorage
- `addIncident(incident)` — append + save to localStorage; returns the record
- `updateIncident(id, patch)` — merge patch + save
- `submitToFeedbackAPI(incident)` — POST to Feedback API; updates record with `feedbackId` on success
- Seed 3 hard-coded demo incidents at first load (if localStorage is empty; not submitted to API)

Data model:
```js
{
  id: string,           // crypto.randomUUID() — local ID
  feedbackId: string,   // Mapbox feedback_id, populated after API submission
  feedbackStatus: string, // 'received' | 'fixed' | 'reviewed' | 'out_of_scope' | null
  type: 'accident' | 'closure' | 'hazard' | 'construction',
  mapboxCategory: string, // Mapbox API category value used on submit
  lat: number,
  lng: number,
  note: string,
  streetName: string,   // populated async via reverse geocode
  timestamp: number,    // Date.now()
  isOwn: boolean
}
```

**Acceptance criteria:**
- [ ] Demo incidents persist across page reloads
- [ ] `addIncident` / `updateIncident` round-trip correctly (verify in console)
- [ ] `submitToFeedbackAPI` POSTs correctly and stores returned `feedbackId`

---

### Step 6 — Incident markers on map

Render incidents from localStorage as markers:
- Custom HTML element: 32px circle, white border, icon inside
- Red (`#bc000a`) for `accident` and `closure`; amber (`#745b00`) for `hazard` and `construction`
- Icons: `car_crash` (accident), `block` (closure), `error` (hazard), `construction` (construction) — Material Symbols filled
- Markers added after map `load` event; refresh when incidents change

**Acceptance criteria:**
- [ ] All 3 demo incidents appear as correct-colour pins on map load
- [ ] Red and amber pins visually match the Stitch `screen.png` reference
- [ ] Tapping a marker does not throw errors (click handler stubbed)

---

### Step 7 — Incident feed (Nearby tab)

Render the Activity feed below the map:
- Cards sorted newest-first
- Each card: type icon, incident type label, street name, severity badge, distance chip, time-ago chip
- Distance: Haversine from current user position
- Time-ago: updates every 30 seconds
- Severity: `CRITICAL` (red) for accident/closure; `MODERATE` (amber) for hazard/construction
- Empty state: "No incidents nearby"
- No dividers — tonal card backgrounds only

**Acceptance criteria:**
- [ ] 3 demo incidents render as cards matching Stitch design exactly
- [ ] Distance and time-ago populate correctly
- [ ] Cards sorted newest-first
- [ ] Empty state renders when list is empty
- [ ] No 1px borders visible anywhere in the feed

---

### Step 8 — Report screen (UI only)

Based on `report-screen.png`. Tapping "+ Report" opens a near-full-screen sheet (map dimmed behind).

Layout:
- "Report an Incident" title
- Location line: pin icon + reverse-geocoded address of map centre
- "SELECT INCIDENT TYPE" — all-caps label
- 2×2 tile grid:
  | Tile | Colour | Icon | Subtitle |
  |---|---|---|---|
  | Accident | red | `car_crash` | "Requires medical/police" |
  | Closure | red | `block` | "Road or path blocked" |
  | Hazard | amber | `error` | "Glass, oil, or debris" |
  | Construction | amber | `construction` | "Active works ahead" |
- "ADDITIONAL DETAILS" — all-caps label
- Textarea (optional note)
- "Submit Report" — full-width primary button, disabled until type selected
- "Cancel" — plain text link

Crosshair fixed at map centre so user can pan to exact location before submitting.

**Acceptance criteria:**
- [ ] Sheet opens with slide-up transition, map pannable behind
- [ ] Location line populates from map centre on open; updates on pan
- [ ] One tile selectable at a time; selected state uses type colour
- [ ] Submit disabled until type selected
- [ ] Cancel resets all state
- [ ] Visual match to `report-screen.png` at 375px

---

### Step 9 — Submit report flow (localStorage + Feedback API)

On "Submit Report":
1. Capture `map.getCenter()` as incident coords
2. Write to localStorage immediately (`feedbackId: null`, `isOwn: true`)
3. Dismiss screen; pin appears on map; card added to feed
4. Reverse geocode async → update `streetName` in localStorage and re-render card in-place
5. POST to Feedback API async → on success, update record with `feedbackId` + `feedbackStatus: 'received'`

If API call fails: report stays in localStorage with `feedbackId: null`. No retry in V1 — surface a subtle error state on the card.

**Acceptance criteria:**
- [ ] Pin appears on map within 200ms of submit
- [ ] Card appears immediately with "—" street name placeholder
- [ ] Street name populates without layout shift
- [ ] `feedbackId` populates on card after API response (visible in Mine tab)
- [ ] Report survives page reload
- [ ] End-to-end submit in under 10 seconds

---

### Step 10 — Mine tab

- Shows only `isOwn: true` incidents, newest-first
- Status badges: sourced from `feedbackStatus` — `received` (blue), `fixed` (green), `reviewed` (muted), `out_of_scope` (muted), `null` (grey "Pending")
- Full history — no age cutoff
- Empty state: "Your reports will appear here"

**Acceptance criteria:**
- [ ] Tab switch instant, no flicker
- [ ] Only own reports shown
- [ ] Status badges reflect `feedbackStatus` correctly
- [ ] Updates live on new submission
- [ ] Empty state shown before first submission

---

### Step 11 — Final polish & validation

- Visual audit against both Stitch references on physical iPhone
- `optimize_style_tool` re-run after any mid-build style changes
- `validate_geojson_tool` on any GeoJSON added to map source
- Test tap targets on iPhone 14 and iPhone 14 Pro Max
- Confirm `MAPBOX_TOKEN` appears exactly once in the codebase

**Acceptance criteria:**
- [ ] Visual match to both Stitch references on physical iPhone
- [ ] Zero console errors (check via Safari Web Inspector)
- [ ] Token appears exactly once
- [ ] All historical reports visible in Mine tab after reload
- [ ] End-to-end submit in under 10 seconds on physical iPhone

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
