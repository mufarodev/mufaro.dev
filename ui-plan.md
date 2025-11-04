mufaro.dev — Cozy Grain Monomaterial UI Plan

Project Overview

- Purpose: Elevate the portfolio to a premium, cozy experience while reducing visual clutter and keeping a single, unified “soft‑matte” material.
- Target Users: Hiring managers and collaborators who want fast signals with optional depth.
- Key Features: Minimal hero, slim credibility strip, calm timeline, distinctive projects grid with quick-actions underbar, presence/activity cards, anchored contact CTA.

User Experience Design

User Flows

- Primary: Hero → Credibility Strip → Timeline → Projects → Activity → Contact.
- Branches:
  - Timeline chip expand/collapse for details.
  - Project card: open detail sheet; underbar links (Live • Repo).
  - Contact CTA: jump to footer; optional modal.
- Success paths: User scans narrative, validates credibility, inspects 1–2 projects, reaches out.
- Error paths: Activity data unavailable → show graceful skeletons/empty states; project asset fails → fallback thumbnail.

Information Architecture

- Header: logo/wordmark, anchor pills (About, Projects, Activity, Contact), motion toggle (respects reduced motion), theme noise toggle.
- Sections:
  1. Hero (minimal)
  2. Credibility Strip (thin chips)
  3. Journey Timeline
  4. Projects Showcase
  5. Live Activity
  6. Contact Footer
- Footer: socials and email reiteration.

Interaction Patterns

- One material everywhere (soft‑matte). Differentiation via scale, spacing, hairline rules, and tiny accent dots.
- Hover lift 2px; press sink 1px; 120–160ms ease-out.
- Focus rings use subtle amber; otherwise rely on soft box-shadows, not glows.
- Section reveals: fade + translateY(8–10px), stagger 80–120ms; disabled for reduced motion.

Visual Design System

Color Palette (HSL tokens; warm charcoal + amber)

- Background: 24 14% 7%
- Card: 24 12% 9%
- Border: 24 10% 18% (1px)
- Foreground: 36 30% 92%
- Muted: 24 8% 14%; Muted-foreground: 36 16% 72%
- Primary (Amber): 34 92% 65%; Primary-foreground: 24 16% 10%
- Accent (Subtle amber lines/dots): 34 80% 58%
- Ring: 34 85% 60%
- Success/Error/Warning: Tailwind emerald/red/amber at low saturation; keep subtle on dark.

Usage

- Amber only for CTA, highlights, focus rings, tiny separators/dots.
- Hairline luminous rules replace heavy dividers.

Typography

- Display: Instrument Serif (H1/H2, hero lead).
  - H1: 56–64, lh ~1.05, tracking -0.5 to -0.75
  - H2: 36–44, lh ~1.1, tracking -0.25
  - Lead: 20–22, lh ~1.5
- Body/UI: Inter (keep current).
  - Body: 16–18, lh ~1.6
  - Labels/Chips: 12–13, uppercase, letter-spacing +0.5
- Numerals: Inter with tabular lining figures for stats/chips.
- Optional Inter tweaks: enable slashed zero for code, tighten headings by -0.5 letter-spacing, slightly increase word-spacing on long paragraphs (+0.5px) for calm rhythm.

Spacing & Layout

- Base spacing: 4px scale; key steps 12/16/24/32/48/64/96.
- Section rhythm: 96 top/bottom hero, 64 between sections.
- Container: 1120px max desktop; 90vw tablet; padded edge-to-edge mobile.
- Radius: 16–18 on cards; chips 14; buttons 12.

Component Styling

- Material: soft‑matte with:
  - Border: 1px translucent
  - Inner shadow: very low contrast
  - Top-left keylight: subtle box-shadow highlight
  - Card grain overlay: 4–6% opacity
- Shadows:
  - Rest: none
  - Hover: 0 6px 14px rgba(0,0,0,0.35) + soft keylight
  - Active: 0 2px 6px rgba(0,0,0,0.4)
- Glows: only for focus ring and primary CTA underglow; keep faint.

Noise System

- Canvas grain: fine film-grain, 9% opacity, ultra-slow drift (8–12s cycle), disabled with reduced motion.
- Card grain: tighter pattern, 4–6% opacity; static (no drift).

Component Architecture

Header

- Purpose: Top navigation and preferences.
- Location: Sticky top.
- Visual: Slim matte bar; tiny amber dot indicating active section.
- Content: Logo, anchor pills, motion toggle, noise toggle.
- Props: activeSection, reducedMotion, noiseIntensity.
- Interactions: Keyboard focus across pills; toggles update store.
- State: activeSection derived from scroll spy; preferences in global store.
- Events: navigate(section), prefsChanged.
- Responsive: Collapsible pill row to horizontal scroll on mobile.
- Accessibility: aria-current for active; role="navigation".

Hero Section (Minimal)

- Purpose: Introduce identity succinctly.
- Visual: Large Instrument Serif name; faint grid mask behind name; one-line purpose; CTA pair; compact socials; bottom scroll chip.
- Content: greeting, name, purpose, buttons, socials.
- Props: headline, subline, ctas[], socials[].
- Interactions: CTA click; keyboard focus order: headline → CTAs → socials → scroll chip.
- State: none local.
- Events: ctaClick(type), scrollPrompt.
- Responsive: Centered mobile; two-line H1 break allowed; padding increases on desktop.
- Accessibility: semantic h1; descriptive aria-labels on CTAs.

Credibility Strip (Slim)

- Purpose: Quick trust signals without cluttering hero.
- Visual: Low-height chip row with tiny icons and numbers; hairline separators with amber dots.
- Content: years, projects shipped, OSS contributions.
- Props: items[] (label, value, icon, href?).
- Interactions: hover reveals micro-tooltip label; click optional deep link.
- State: none.
- Events: statClick(key).
- Responsive: Wrap to 2 rows on small screens with adequate spacing.
- Accessibility: aria-live="off"; each chip role="button" if clickable, else plain.

Timeline Rail

- Purpose: Communicate journey clearly.
- Visual: Single matte rail; step chips; expand inline on same surface; sliding hairline divider when opened.
- Content: nodes with period, title, short description, optional link.
- Props: milestones[].
- Interactions: click/enter to expand; arrow keys to move focus between nodes.
- State: expandedId (local).
- Events: milestoneOpen(id), milestoneClose(id).
- Variants: compact (mobile), extended (desktop).
- Accessibility: buttons with aria-expanded and aria-controls; roving tabindex.

Projects Showcase

- Purpose: Highlight selected work.
- Visual: Asymmetric grid on desktop (1 featured large + 2–3 standard); card thumbnails with film grain; quick-actions appear as a slim underbar on hover/focus.
- Content: project cards (thumb, title, tags).
- Props: projects[]; featuredId?.
- Interactions: hover shows underbar actions (Live • Repo); click opens detail sheet; keyboard-accessible.
- State: none local; selection via global store.
- Events: openProject(projectId), actionClick(type, projectId).
- Responsive: 1-up stacked mobile → 2-up tablet → asymmetric grid desktop.
- Accessibility: list semantics; buttons have labels; focus trap only inside detail sheet.

Project Detail Sheet (Matte)

- Purpose: Deeper project view without leaving page.
- Visual: Right-anchored matte sheet; same material; hairline top/left edge highlight; no glass.
- Content: title, role, stack chips, summary, screenshots carousel, primary links.
- Props: project details.
- Interactions: ESC/backdrop to close; drag from edge on touch (optional).
- State: open boolean; selectedProject in global store.
- Events: close, navigateNext/Prev.
- Responsive: Full-screen overlay on mobile; side sheet on desktop.
- Accessibility: role="dialog", aria-modal, labelledby; focus trap; restore focus on close.

Activity Panel

- Purpose: Show live presence without noise.
- Visual: Same card style; very soft tint sampled from album/track artwork; minimal progress bar.
- Content: music and “currently working on” status.
- Props: music, status.
- Interactions: none beyond links.
- State: local timer for elapsed; external polling interval.
- Events: none.
- Accessibility: polite live region for now playing text updates.

Contact Footer

- Purpose: Strong, friendly CTA.
- Visual: Matte slab; subtle top-edge highlight; CTA button with faint underglow; secondary text links.
- Content: headline, email, socials.
- Props: email, links[].
- Interactions: click copies email or opens mailto; optional modal form.
- State: copied feedback state 1.5s.
- Events: contactClick(type).
- Accessibility: clear button labels; high-contrast focus ring.

Component Hierarchy
App
├─ Layout
│ ├─ header-bar
│ └─ site-footer
├─ Home
│ ├─ hero-section
│ ├─ credibility-strip
│ ├─ timeline-rail
│ ├─ projects-showcase
│ │ └─ project-card
│ ├─ project-detail-sheet
│ └─ activity-panel
└─ Shared
├─ soft-button
├─ matte-card
├─ chip
├─ icon-dot-separator
├─ scroll-chip
└─ preference-toggles

Data Flow & State Management

Application State (global store)

- uiPrefs: { reducedMotion, noiseIntensity: 0.09, themeWarmth: 'amber-slight' }
- nav: { activeSection }
- selectedProject: project | null

Local State

- timeline-rail: expandedId
- project-detail-sheet: open, local carousel index
- activity-panel: lastUpdated timestamp; polling timer

Reactive Dependencies

- activeSection derived from IntersectionObserver marks.
- reducedMotion affects animation durations and disables grain drift.
- noiseIntensity controls grain opacity on canvas/cards.

Animation & Transitions

Global

- Default ease: easeOut for hover/press; easeInOut for entrances.
- Duration: 120–160ms interactions; 180–240ms entrances.

Per element

- Hero heading: subtle opacity 0→1 and y 8→0 on mount; once per visit.
- CTA hover: translateY(-2px); active translateY(-1px); box-shadow intensifies slightly.
- Credibility chips: fade + y 6→0 stagger 80ms.
- Timeline expand: height auto with opacity 0→1; hairline divider slides from left 200ms.
- Project underbar: slide up 6px + fade 120ms; delay 40ms from hover intent.
- Project sheet: slide in from right 24px with spring (stiffness 150, damping 18); backdrop 0→0.5 in 160ms.
- Grain drift: background-position animates over 8–12s; disabled if reduced motion.

Responsive Design Strategy

Breakpoints

- Mobile <640px, Tablet 640–1024px, Desktop >1024px.

Behaviors

- Header pills become scrollable row on mobile.
- Hero centers with single-column stack on mobile; CTAs full-width.
- Credibility strip wraps to 2 rows on small screens.
- Timeline becomes vertical list; expand pushes content down.
- Projects: 1-up mobile, 2-up tablet, asymmetric desktop grid.
- Detail sheet: full-screen mobile; side sheet desktop.

Accessibility Considerations

- Color contrast AA minimum on the dark theme; ensure amber on charcoal meets contrast for small text (adjust luminosity if needed).
- Roving tabindex for timeline chips; arrow-key navigation.
- Dialog focus trapping with return-to-origin focus.
- Prefers-reduced-motion respected globally; provide explicit Motion toggle.
- Semantic landmarks: header, main, footer; sections with aria-labels.
- Hit target sizes ≥ 40px touch.

Edge Cases & Error States

- Activity fetch fail: show muted card with “Can’t load right now” and retry action.
- No projects: present a friendly empty state card.
- Images fail: fallback thumbnail with project initials.
- Long titles/tags: truncate with sensible max lines; show full text in title attribute.
- Offline: mark activity “Offline” and pause polling.

Implementation Roadmap

Phase 1: Foundation

- Tokens: colors, shadows, radii, grain assets/toggles, typography (Instrument Serif + Inter).
- Layout: header-bar, hero-section (minimal), credibility-strip.
- Global stores: uiPrefs, nav, selectedProject; intersection-based activeSection.

Phase 2: Core Sections

- timeline-rail with inline expand.
- projects-showcase with project-card underbar actions.
- project-detail-sheet (matte, not glass) with carousel.
- activity-panel with server-side load + client polling.

Phase 3: Polish and Performance

- Motion tuning and reduced-motion paths.
- Image optimization and lazy loading.
- Accessibility audit and keyboard flows.
- Microcopy pass; empty/error states.
- Fine-tune noise intensity slider and warmth if desired.

Notes on Inter tweaks

- Enable tabular-nums for stats.
- Slight heading tracking tighten (-0.5) and label tracking widen (+0.5).
- Prefer 17–18px body on desktop for “cozy” reading.
- Consider Inter slant axis at -6 to -8 for italic styles if desired; keep normal for UI.

If you want, I can now update your existing ui-plan.md with this plan.
