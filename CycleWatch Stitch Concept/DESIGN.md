# The Design System: Editorial Precision for the Modern Cyclist

## 1. Overview & Creative North Star: "The Kinetic Sanctuary"
The Creative North Star for this design system is **The Kinetic Sanctuary**. In the high-velocity, high-risk environment of urban cycling, the app must serve as a calm, authoritative, and ultra-legible co-pilot. This is not a "utility" app; it is a premium digital instrument.

We break the "standard template" look by utilizing **intentional asymmetry** and **tonal layering**. While most apps rely on rigid grids and heavy borders, this system uses expansive white space and "ghost" containers to create a sense of breath. We treat the UI as an editorial layout—where safety information isn't just displayed, it is *curated*.

**Key Philosophy:**
*   **Aero-Dynamics:** UI elements should feel light and frictionless, using large radii (`xl`: 3rem) to mimic the organic curves of high-end carbon frames.
*   **Depth without Weight:** Hierarchy is established through frosted glass and background shifts, never through heavy shadows or lines.

---

## 2. Colors: Tonal Atmosphere
Our palette moves beyond simple "Light Mode." We use a sophisticated spectrum of whites and cool grays to define importance.

### Color Tokens
*   **Primary (Performance Blue):** `#0058bc` — Used for active navigation and primary "Go" states.
*   **Secondary (Safety Red):** `#bc000a` — Reserved strictly for critical accidents or road closures. Use with `secondary_container` (`#e2241f`) for high-impact alerts.
*   **Tertiary (Hazard Amber):** `#745b00` — Used for caution, road debris, or weather warnings.
*   **Neutral Surfaces:** From `surface` (`#faf9fe`) to `surface_container_highest` (`#e3e2e7`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts. To separate a map view from a statistics card, place a `surface_container_lowest` (`#ffffff`) card onto a `surface_container_low` (`#f4f3f8`) background.

### Signature Textures: The Glass & Gradient Rule
To achieve a premium native iOS feel, all top-level navigation headers and bottom tab bars must use **Glassmorphism**:
*   **Background:** `surface` at 70% opacity.
*   **Effect:** `backdrop-blur: 20px`.
*   **CTAs:** Use a subtle linear gradient from `primary` (`#0058bc`) to `primary_container` (`#0070eb`) to give buttons a "liquid" depth that feels tactile and high-end.

---

## 3. Typography: Editorial Authority
We use **Inter** to mimic the precision of SF Pro, prioritizing legibility at high speeds.

*   **Display (The Overview):** `display-lg` (3.5rem) is used for singular, high-impact data points like "Current Speed" or "Safety Score."
*   **Headline (The Narrative):** `headline-md` (1.75rem) handles screen titles with aggressive tracking (-0.02em) to feel "tight" and professional.
*   **Body (The Guidance):** `body-lg` (1rem) for turn-by-turn instructions.
*   **Labels (The Metadata):** `label-md` (0.75rem) in all-caps with +0.05em tracking for secondary data like "Elapsed Time."

**Hierarchy Note:** Always pair a `display-lg` metric with a `label-md` descriptor. The extreme contrast in scale creates an "editorial" look that standard apps lack.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use the **Layering Principle** to create a physical sense of space.

*   **The Stack:**
    1.  **Base:** `surface` (`#faf9fe`)
    2.  **Sectioning:** `surface_container_low` (`#f4f3f8`)
    3.  **Interactive Cards:** `surface_container_lowest` (`#ffffff`)
*   **Ambient Shadows:** If an element must float (e.g., a "Report Hazard" FAB), use a shadow with a 32px blur, 4% opacity, tinted with `primary_fixed_dim`. It should feel like a soft glow, not a shadow.
*   **Ghost Borders:** For accessibility on map overlays, use `outline_variant` at **15% opacity**. This provides a "suggestion" of a boundary without interrupting the visual flow.

---

## 5. Components: The Premium Toolkit

### Buttons (The Kinetic Radius)
*   **Primary:** `xl` (3rem) corner radius. Use the signature Blue gradient. Height: 60px for easy thumb-tap during rides.
*   **Secondary/Ghost:** No fill. Use `outline_variant` at 20% opacity.
*   **States:** On press, scale the button down to 96% to provide haptic visual feedback.

### Segmented Controls (The iOS Toggle)
*   Used for switching views (e.g., "Map" vs "List").
*   **Container:** `surface_container_high` with `full` (9999px) radius.
*   **Active Indicator:** `surface_container_lowest` with a very soft ambient shadow.

### Cards & Lists (Zero-Divider Rule)
*   **Lists:** Forbid the use of divider lines. Separate list items using `spacing.4` (1rem) of vertical white space or by nesting each item in its own `surface_container_low` card with an `md` (1.5rem) radius.
*   **Data Cards:** Use `surface_container_highest` for "Danger" zones and `surface_container_lowest` for "Safe" zones.

### Cycling-Specific Components
*   **The Hazard Banner:** A full-bleed frosted glass banner at the top of the screen using `secondary_container` (Red) at 80% opacity with white text.
*   **The Map Float:** A cluster of circular buttons (`full` radius) for "Recenter," "Zoom," and "Report," appearing to float on a single sheet of glass.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Align high-level stats to the left and secondary metadata to the right to create a dynamic visual path.
*   **Embrace White Space:** If a screen feels "busy," increase the spacing from `spacing.4` to `spacing.8`.
*   **Prioritize Thumb Zones:** Keep all critical safety actions in the bottom 30% of the screen.

### Don't:
*   **Don't use pure black:** Use `on_surface` (`#1a1b1f`) for text to maintain a premium, soft-contrast look.
*   **Don't use 1px lines:** They create "visual noise" that distracts a rider. Use tonal shifts instead.
*   **Don't use standard "Material" shadows:** They look dated. Stick to tonal layering and ultra-diffused ambient glows.