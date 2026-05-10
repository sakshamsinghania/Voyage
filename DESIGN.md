<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Voyage
description: AI agent research platform for technical users
---

# Design System: Voyage

## 1. Overview

**Creative North Star: "The Signal Engine"**

Voyage processes noise and returns signal. Every design decision serves that function: surfaces recede so output commands attention, chrome exists only to hold the work, and interaction feedback is immediate without being theatrical. The warmth is deliberate — this is not a cold machine. It is an instrument that reads as owned and trusted.

The palette is dark and warm, not cool and sterile. Typography is technical without being austere. Motion is responsive but never decorative. The system explicitly rejects the visual language of general-purpose AI assistants: centered chat bubbles, personality-driven empty states, gradient-text headers. It also rejects SaaS marketing conventions: purple-to-blue gradients, hero metric blocks, "🚀 10x your productivity" framing.

This is a tool for people who already know what they're doing. It defaults to density. Breathing room is earned, not given.

**Key Characteristics:**
- Dark, warm-amber-tinted surface: not cold, not pure black
- Single committed accent (amber-gold) across all interactive surfaces
- IBM Plex Sans for UI, IBM Plex Mono for agent output: the distinction is immediate
- Flat elevation by default: tonal steps convey depth, not shadows
- Motion is responsive feedback only: state changes, no choreography

## 2. Colors: The Amber Instrument Palette

Committed strategy: one warm amber tone anchors all interactive surfaces, carried across active states, focus rings, and selection. The committed color covers 30-40% of typical screen real estate through structural surfaces.

### Primary
- **Agent Amber** (`oklch(74% 0.16 75)` / [to be resolved to hex during implementation]): Active states, primary buttons, interactive links, focus rings, selected nav items. When amber appears, it means: actionable, active, or selected. No other use.

### Neutral
- **Void** (`oklch(10% 0.008 60)` / [to be resolved]): Root page background. The foundation layer.
- **Ground** (`oklch(15% 0.010 60)` / [to be resolved]): Main content area and panel surfaces. This is the committed warm tint covering the majority of screen area.
- **Surface** (`oklch(19% 0.010 60)` / [to be resolved]): Elevated panels, input backgrounds, cards when absolutely necessary.
- **Rim** (`oklch(24% 0.008 60)` / [to be resolved]): Borders and dividers only. Not decorative.
- **Quiet** (`oklch(64% 0.006 60)` / [to be resolved]): Secondary text, placeholders, metadata, timestamps.
- **Loud** (`oklch(93% 0.006 60)` / [to be resolved]): Primary text. Warm near-white, never cold, never pure.

### Named Rules
**The Warmth Rule.** Every surface carries a small but deliberate warm cast. No pure black, no pure white, no cool-grey neutral. The warmth prevents eye fatigue during long research sessions and distinguishes Voyage from cold dark AI tools.

**The One Signal Rule.** Amber appears only in the interactive layer. Actionable, active, or selected: amber. Informational, structural, passive: neutral. Never use amber for decoration or emphasis without interactive intent.

## 3. Typography

**Body Font:** IBM Plex Sans (with `system-ui, sans-serif` fallback)
**Mono Font:** IBM Plex Mono (with `ui-monospace, Menlo, monospace` fallback)

**Character:** IBM Plex was designed for information-dense environments. It reads as technical without reading as cold. The geometric construction gives it precision; the humanist inktraps prevent sterility. The mono companion makes agent output and code feel native, not bolted on.

### Hierarchy
- **Display** (weight 600, 3rem / 48px, line-height 1.0): Session titles, report headings. Rare on screen.
- **Headline** (weight 600, 2.25rem / 36px, line-height 1.1): Page-level section headings.
- **Title** (weight 500, 1.5rem / 24px, line-height 1.25): Panel titles, conversation headings, sidebar section labels.
- **Body** (weight 400, 1rem / 16px, line-height 1.65): Research output, prose, descriptions. Max line length 65ch.
- **Label** (weight 500, 0.75rem / 12px, line-height 1.0, letter-spacing 0.04em, uppercase): UI chrome, status indicators, timestamps, tool call labels, tags.

### Named Rules
**The Mono Rule.** Agent output, tool calls, data results, citations, and any machine-generated content renders in IBM Plex Mono. The boundary between human prose and machine output is always visible.

**The Scale Rule.** Adjacent hierarchy steps must differ by at least 1.25x in size or at least 100 in weight. Flat type scales are forbidden.

## 4. Elevation

Voyage uses tonal layering, not shadows. Depth is expressed through surface steps (Void to Ground to Surface) rather than box-shadow stacking. At rest, every surface is flat. Elevation is a state response, not a structural feature.

### Shadow Vocabulary

None by default. Tonal separation between Void, Ground, and Surface provides all necessary depth.

If a floating element requires a shadow (dropdown, tooltip, command palette): one shadow only, ambient and low-contrast, `0 4px 24px oklch(5% 0.005 60 / 0.6)`. Never stack shadows.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit at rest without shadows. When a panel, card, or element is active or focused, it shifts to the next tonal step. Hover states are tonal shifts. Shadow is reserved for truly floating elements, and only one value exists.

## 5. Components

No components yet. Re-run `/impeccable document` once component code exists. When that scan runs, document: primary button, ghost button, research input, agent output block, source citation chip, sidebar nav item, status badge.

## 6. Do's and Don'ts

### Do:
- **Do** use IBM Plex Mono for all agent output, tool traces, citations, and machine-generated content. The distinction is non-negotiable.
- **Do** use Agent Amber exclusively for interactive and active states. Its rarity is its power.
- **Do** express hierarchy through tonal surface steps, never through shadow stacking.
- **Do** cap body text at 65ch in research output panels. Dense information needs rhythm.
- **Do** use Label typography (12px / 500 / uppercase / tracked) for all UI chrome: status, timestamps, tags, panel identifiers.
- **Do** treat all transitions as state feedback: 120ms for micro-interactions, 200ms for panel transitions, expo ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Do** ensure every neutral carries a warm cast. Cool greys are prohibited.

### Don't:
- **Don't** replicate generic AI chat visual language: no centered input-box-as-primary-UI, no conversation bubble layout, no personality-forward empty states, no assistant avatars.
- **Don't** introduce SaaS startup conventions: no purple-to-blue gradients, no hero metric blocks (big number, small label, gradient accent), no "productivity" copy, no identical card grids.
- **Don't** use side-stripe borders (border-left or border-right greater than 1px as colored accents). Rewrite with background tints or remove entirely.
- **Don't** use gradient text (background-clip: text with gradient background). Solid colors only; emphasis through weight or scale.
- **Don't** animate for decoration: no scroll-driven entrances, no bounce or elastic easing, no choreographed sequences. Motion responds to user action only.
- **Don't** use pure black (`#000` or `oklch(0%)`) or pure white (`#fff` or `oklch(100%)`). Every value has a tint.
- **Don't** stack UI elements in identical card grids. Research results, sources, and agent traces need visual hierarchy through typography and spacing, not repeated stamped cards.
