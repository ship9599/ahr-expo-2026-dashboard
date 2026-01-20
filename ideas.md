# AHR Expo 2026 Dashboard - Design Brainstorming

## Project Context
A comprehensive, data-dense dashboard for tracking AHR Expo 2026 in Las Vegas. The dashboard aggregates broker-hosted events, company exhibitors, calendar entries, and email communications. Users need to drill down from high-level summaries into granular details with filtering, sorting, and direct links to source materials.

---

<response>
<text>
**Design Movement**: Brutalist Data Visualization

**Core Principles**:
1. **Radical Honesty**: Raw data tables, monospace fonts, stark borders—no decorative flourishes
2. **Information Density**: Maximum data per screen with aggressive use of tabs, accordions, and collapsible sections
3. **Functional Typography**: IBM Plex Mono for data, Archivo Black for headers—emphasizing readability over elegance
4. **Utilitarian Color**: Grayscale base with high-contrast accent colors (electric yellow, safety orange) only for critical actions

**Color Philosophy**: 
Black (#0A0A0A) background, white (#FAFAFA) text, with yellow (#FFD700) for primary actions and orange (#FF4500) for alerts. No gradients, no softness—pure contrast for maximum legibility in data-heavy contexts.

**Layout Paradigm**: 
Terminal-inspired grid with fixed-width columns. Left sidebar for navigation filters (big button style), main area split into stacked data tables with sticky headers. No cards, no rounded corners—everything is rectangular and aligned to a strict 8px grid.

**Signature Elements**:
1. ASCII-style dividers between sections (═══, ───)
2. Monospace data tables with zebra striping
3. Brutalist "chip" filters with sharp edges and bold text

**Interaction Philosophy**: 
Instant feedback with no animations—clicks change state immediately. Hover states are simple background inversions (black→white, white→black). Keyboard shortcuts displayed inline.

**Animation**: 
Zero animation. State changes are instantaneous. Loading states show static "LOADING..." text in monospace.

**Typography System**:
- Headers: Archivo Black, 32px/24px/18px
- Body: IBM Plex Mono, 14px regular
- Data tables: IBM Plex Mono, 12px
- All caps for section labels
</text>
<probability>0.08</probability>
</response>

<response>
<text>
**Design Movement**: Neo-Memphis Data Dashboard

**Core Principles**:
1. **Playful Geometry**: Asymmetric layouts with rotated elements, overlapping panels, and unexpected angles
2. **Bold Color Blocking**: Saturated primary colors (cyan, magenta, yellow) used in large blocks, not just accents
3. **Layered Depth**: Exaggerated shadows and z-index stacking to create a collage-like effect
4. **Organic Data Flow**: Data sections flow diagonally or in zigzag patterns rather than traditional grids

**Color Philosophy**: 
Vibrant palette—cyan (#00D9FF), magenta (#FF006E), yellow (#FFBE0B), black (#1A1A1A), and cream (#FFF8E7). Colors are used in large, unapologetic blocks. Each data category gets its own color identity.

**Layout Paradigm**: 
Diagonal split-screen with a 15° tilt. Main dashboard area uses a Bento-box layout with varying cell sizes. Filters appear as floating "sticky notes" that can be repositioned. No traditional header—navigation is embedded within the content flow.

**Signature Elements**:
1. Thick, hand-drawn-style borders (8px solid) around data panels
2. Rotated text labels at 5-10° angles
3. Oversized, geometric drop shadows (offset 12px, no blur)

**Interaction Philosophy**: 
Bouncy, spring-based animations on all interactions. Buttons "squash" when clicked. Panels slide in from unexpected angles. Micro-interactions feel playful and surprising.

**Animation**: 
Spring physics (react-spring) for all transitions. Panels bounce into view with overshoot. Hover states scale elements by 1.05x with a 200ms spring. Loading states use a rotating geometric shape (triangle, square, pentagon sequence).

**Typography System**:
- Headers: Space Grotesk Bold, 48px/32px/24px
- Subheaders: Space Grotesk Medium, 20px
- Body: Inter Regular, 16px
- Data labels: JetBrains Mono, 14px
- Mix of uppercase and sentence case for dynamic rhythm
</text>
<probability>0.06</probability>
</response>

<response>
<text>
**Design Movement**: Financial Terminal Aesthetic (Bloomberg/Reuters-inspired)

**Core Principles**:
1. **Professional Density**: Multi-panel layout with live data streams, ticker-style updates, and compact information architecture
2. **Hierarchical Clarity**: Clear visual hierarchy through size, weight, and color—critical data is always prominent
3. **Functional Minimalism**: Every pixel serves a purpose; no decorative elements
4. **Instant Scannability**: Users should locate any data point within 2 seconds

**Color Philosophy**: 
Dark slate background (#0F1419), muted cyan (#4A9EFF) for primary data, amber (#FFA500) for warnings, green (#00C853) for positive indicators, red (#FF3B30) for alerts. Inspired by financial terminals—colors convey meaning, not aesthetics.

**Layout Paradigm**: 
Multi-column dashboard with resizable panels. Left: navigation and filters (25% width). Center: primary data grid (50%). Right: detail pane and quick actions (25%). All sections have independent scroll. Top bar shows global stats and search.

**Signature Elements**:
1. Tabular data with inline sparklines showing trends
2. "Ticker tape" style horizontal scroll for recent updates
3. Monospace numbers with right-alignment for easy comparison

**Interaction Philosophy**: 
Efficiency-first. Click to expand, right-click for context menus, keyboard shortcuts for power users. Hover reveals tooltips with extended metadata. All actions are reversible and logged.

**Animation**: 
Subtle, fast transitions (100-150ms ease-out). New data rows fade in with a brief highlight flash. Panel resizing is smooth but quick. Loading states show a thin progress bar at the top of each section.

**Typography System**:
- Headers: Inter SemiBold, 20px/16px
- Body: Inter Regular, 14px
- Data/numbers: SF Mono, 13px (tabular-nums for alignment)
- Labels: Inter Medium, 12px uppercase with letter-spacing
- Strict hierarchy: only 4 font sizes across the entire interface
</text>
<probability>0.09</probability>
</response>

---

## Selected Approach

**Financial Terminal Aesthetic** - This design philosophy perfectly matches the user's requirements for a high-density, Excel-like dashboard with drill-down capabilities. The professional, data-first approach ensures maximum information density while maintaining clarity and scannability.
