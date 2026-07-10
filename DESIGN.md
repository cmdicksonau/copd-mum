---
name: COPD Mobile Care (Premium Edition)
colors:
  background: '#F8FAFC'
  surface: '#FFFFFF'
  on-surface: '#090D16'
  on-surface-variant: '#64748B'
  outline: '#E2E8F0'
  primary: '#E37D32'
  on-primary: '#FFFFFF'
  primary-container: '#FFF7EE'
  on-primary-container: '#7A3E0C'
  error: '#C00000'
  on-error: '#FFFFFF'
  error-container: '#FFF5F5'
  on-error-container: '#7A1C1C'
  stable-green: '#2E4E16'
  stable-green-bg: '#F1F8E9'
  warning-amber: '#7A3E0C'
  warning-amber-bg: '#FFF8F0'
typography:
  display-lg:
    fontFamily: 'Satoshi'
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: '-0.02em'
  headline-md:
    fontFamily: 'Satoshi'
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: '-0.01em'
  body-base:
    fontFamily: 'Satoshi'
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-bold:
    fontFamily: 'Satoshi'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: '0'
  mono-base:
    fontFamily: 'JetBrains Mono'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
rounded:
  sm: 6px
  DEFAULT: 12px
  md: 16px
  lg: 24px
  full: 9999px
spacing:
  unit: 12px
  xs: 6px
  sm: 12px
  md: 20px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
---

# Design System: COPD Mobile Care (Premium Edition)

## 1. Visual Theme & Atmosphere

The visual atmosphere is **clinical, restrained, and warm** — like a modern, well-lit respiratory wellness clinic. It avoids the cold, corporate blue-heavy medical interfaces in favor of soft, slate-tinted canvas structures and an organic warm accent.

The density is balanced for clarity and age-related visual fatigue:
- **Density:** Daily App Balanced (5/10). Generous spacing and padding around elements ensures clinical information can be processed without cognitive overload.
- **Variance:** Offset Asymmetry (7/10). Rejects boring centered templates; uses asymmetric grids, split-screens, and left-aligned headers to feel crafted and premium.
- **Motion:** Tactile Micro-Motion (6/10). Interactions are animated using physical dampening parameters to feel substantial.

## 2. Color Palette & Roles

The color values are calibrated to HSL ranges that guarantee AAA/AA accessibility standards.
- **Canvas Base** (#F8FAFC) — Slate-50, a soft, anti-glare primary background surface.
- **Pure Surface** (#FFFFFF) — Card containers and surface panels.
- **Charcoal Ink** (#090D16) — Slate-950 depth for primary text, headings, and active values.
- **Muted Steel** (#64748B) — Slate-500 for secondary support text, captions, and metadata.
- **Whisper Border** (#E2E8F0) — Slate-200 for hairline outline separating views and tables.
- **Terracotta Orange** (#E37D32) — Calibrated brand accent (saturation 76%) for primary CTAs, active indicators, and focus rings.

### Clinical Status Indicators (Low-saturation, semantic roles):
- **Stable Green** (#2E4E16) on Soft Lime (#F1F8E9) — Patient telemetry is within safe limits.
- **Warning Amber** (#7A3E0C) on Soft Warm Orange (#FFF8F0) — Telemetry shows mild deviations.
- **Emergency Red** (#C00000) on Soft Crimson (#FFF5F5) — Telemetry shows critical readings.

## 3. Typography Rules

- **Display/Headlines:** Satoshi — Track-tight, controlled scale, weight-driven hierarchy to avoid screaming headers.
- **Body Copy:** Satoshi — Relaxed leading, limited to 65 characters per line to guarantee readability.
- **Monospace:** JetBrains Mono — Used for all patient telemetry values (SpO2, pulse, respiration rate), timestamps, dates, and dashboard numbers.
- **High-Density Numbers:** All metrics, numerical data, and telemetry statistics must use JetBrains Mono for clinical alignment and alignment precision.
- **Banned:** Inter is strictly banned. Generic system sans-serifs and generic serifs (Times New Roman, Georgia, Garamond) are banned.

## 4. Component Stylings

* **Buttons:** Flat surfaces, no outer glow or neon shadows. Tactile push feedback: active states translate 1px down (translate-y-[1px]) and scale to 0.98. Accent fill for primary, Whisper Border outline for secondary. Tap targets minimum 48px to accommodate motor-tremors.
* **Cards:** Rounded corners (24px / 1.5rem). Diffused whisper shadow tinted to background hue. Cards are used only when elevation communicates hierarchy. For high-density screens, replace cards with border-top dividers or negative space.
* **Inputs:** Labels sit above inputs; helper text sits below. Focus state applies a thick Slate border and accent focus ring. No floating labels. Toggle switches feature oversized touch targets.
* **Loaders:** Skeletal templates matching the exact element dimensions. Circular loading progress loops are banned.
* **Empty States:** Composed compositions indicating how to populate data.

## 5. Layout Principles

- **Inline Image Typography:** Embed small, contextual photos or illustrations directly between words in the headline. Images sit inline at type-height, rounded (12px), acting as visual punctuation.
- **Asymmetric Structure:** Centered Hero layouts are banned. Force left-aligned content or split-screens with asymmetric whitespace.
- **CTA Restraint:** Maximum one primary CTA. No secondary "Learn more" links.
- **No Overlapping:** Elements never overlay each other. Absolute-positioned stacking is banned. Every element occupies its own clean spatial zone.
- **Structural Grids:** Grid-first responsive architecture. The generic "3 equal cards horizontally" feature row is banned; use 2-column Zig-Zag layouts or asymmetric grids.
- **Heights:** Full viewport layouts must use min-h-[100dvh] to eliminate Safari mobile viewport resizing jumps.
- **Responsive Collapse:** Mobile-first collapse. Spacing gaps scale via `clamp()`.

## 6. Motion & Interaction

- **Spring Physics:** All transitions use standard clinical spring physics: `stiffness: 100, damping: 20` for a weighted, premium feel. No linear easing.
- **Perpetual Micro-Interactions:** The active telemetry badge features a soft, infinite loop breathing state (shimmering opacity from 0.4 to 1.0 every 2.0s).
- **Staggered Orchestration:** List elements mount via CSS delay cascades to orchestrate visual entries.
- **Performance & Hardware Acceleration:** Animations must be restricted to transform and opacity. Never animate top, left, width, or height.

## 7. Anti-Patterns (Banned)

- **NO** emojis anywhere in the interface.
- **NO** Inter font family.
- **NO** generic serif fonts.
- **NO** pure black (#000000).
- **NO** neon glows, outer button shadows, or saturated neon text gradients.
- **NO** 3-column equal card layouts.
- **NO** generic placeholder names (use real patient context or generic labels like [patient-name] or [value]).
- **NO** fake round numbers or fabricated data/statistics. If real data is not available, use clear placeholder labels like [metric] instead of making up numbers (e.g. no fake "99.9% uptime" or "100% stable" labels).
- **NO** fake system/metric sections.
- **NO** LABEL // YEAR formatting (e.g. no "SYSTEM // 2026").
- **NO** AI copywriting clichés ("Seamlessly elevate", "Unleash next-gen", "Next-Gen respiratory management"). Use simple active voice.
- **NO** filler UI text: "Scroll to explore", "Swipe down", scroll arrows, or bouncing chevrons.
- **NO** broken Unsplash placeholders.
- **NO** centered Hero sections.
