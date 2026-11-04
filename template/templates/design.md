# Design System & UI Specifications: {{PROJECT_NAME}}

This document defines the canonical design tokens, typography scale, spacing grid, elevation levels, and component states for **{{PROJECT_NAME}}**. Frontend engineers and AI implementation subagents must reference these tokens rather than inventing arbitrary colors, font sizes, or spacing values.

---

## 0. UI Design Dials (1–10 Scale)

Frontend implementation subagents must tune typography, spacing, and animations according to these project dials:
- **`DESIGN_VARIANCE`**: `[1-10]` (1 = Strict corporate uniformity / high predictability; 10 = High editorial flair, bespoke asymmetric layouts) — *Default: `4` for B2B, `8` for Studio / Creative*
- **`MOTION_INTENSITY`**: `[1-10]` (1 = Static / instant transitions only; 10 = Fluid spring physics, staged stagger entrances, micro-interactions) — *Default: `2` for B2B, `7` for Games / Consumer*
- **`VISUAL_DENSITY`**: `[1-10]` (1 = Spacious luxury/editorial whitespace; 10 = Compact, data-dense dashboards and tabular views) — *Default: `6`*

---

## 1. Color Palette & Semantic Tokens

### Brand & Core Theme Colors
| Token / Name | Hex / Value | Usage & Role |
| :--- | :--- | :--- |
| **Background / Canvas** | `#[HEX]` | Primary page background surface |
| **Surface Container** | `#[HEX]` | Cards, panels, and elevated containers |
| **Primary** | `#[HEX]` | Primary CTAs, active states, and key highlights |
| **On-Primary** | `#[HEX]` | Text/icon color on primary background |
| **Secondary** | `#[HEX]` | Secondary actions, headings, high-contrast text |
| **Muted / Outline** | `#[HEX]` | Subtle borders, dividers, and secondary containers |
| **Success / Normal** | `#[HEX]` | Confirmation states, healthy metrics, positive badges |
| **Warning / Caution** | `#[HEX]` | Non-fatal alerts, expiring states, cautions |
| **Error / Urgent** | `#[HEX]` | Validation errors, critical failures, destructive actions |

---

## 2. Typography Scale

- **Heading Font Family**: `[Font Name]` (e.g. Inter, Geist, Plus Jakarta Sans)
- **Body Font Family**: `[Font Name]`
- **Monospace Font Family**: `[Font Name]` (e.g. JetBrains Mono, Fira Code)

| Token | Size (Desktop / Mobile) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| `headline-lg` | `36px` / `28px` | `700` (Bold) | `1.15` | `-0.02em` |
| `headline-md` | `28px` / `22px` | `600` (SemiBold) | `1.25` | `-0.01em` |
| `headline-sm` | `20px` / `18px` | `600` (SemiBold) | `1.3` | `0` |
| `body-lg` | `18px` | `400` (Regular) | `1.55` | `0` |
| `body-md` | `15px`–`16px` | `400` (Regular) | `1.5` | `0` |
| `body-sm` | `13px`–`14px` | `400` (Regular) | `1.4` | `0` |
| `label-badge` | `11px`–`12px` | `600` (SemiBold) | `1.2` | `0.04em` |

---

## 3. Layout & Spacing Grid

- **Base Spacing Unit**: `4px` / `8px` (`0.25rem` / `0.5rem`) grid for internal component padding and gaps.
- **Desktop Container**: Max-width `1280px` (`container-max`), `24px` gutter, `32px`–`64px` outer margin.
- **Mobile Container**: Fluid, `16px`–`20px` outer padding.
- **Touch Target Minimum**: `44px` on mobile/tablet viewports.

---

## 4. Elevation, Borders & Corner Radius

### Elevation Levels
1. **Level 0 (Base)**: Flat surface background.
2. **Level 1 (Cards / Containers)**: Subtle border (`1px solid`) + soft ambient shadow.
3. **Level 2 (Modals / Popovers / Sticky Headers)**: Pronounced ambient shadow + optional `backdrop-filter: blur(...)`.

### Border Radius Scale
- **Small (`sm`)**: `4px` (`0.25rem`) — Chips, badges, small tags
- **Default (`DEFAULT` / `md`)**: `8px` (`0.5rem`) — Inputs, standard buttons, controls
- **Large (`lg`)**: `12px`–`16px` (`0.75rem`–`1.0rem`) — Primary cards and feature modules
- **Full (`full`)**: `9999px` — Pills, avatars, circular icon buttons
- **Borders**: Prefer `1px solid` translucent borders over heavy drop shadows.

---

## 5. Core Component Guidelines

- **Buttons**:
  - *Primary*: High-contrast brand CTA fill, clear `:hover` and `:focus-visible` states.
  - *Secondary / Ghost*: `1px` border or subtle surface tint on hover.
- **Form Inputs**:
  - Clear focus ring, accessible `<label>` associations, and inline validation states (`:user-invalid` / `aria-invalid`).
- **Cards & Interactive Modules**:
  - Generous internal padding (`>= 20px`), consistent border radius, and zero cumulative layout shift (CLS) on media load.

---

## 6. Available Design System Presets

Adopt or adapt one of Chassi's ready-to-use design system presets in `templates/design-systems/`:
- **[`Linear Dark`](file:///templates/design-systems/linear-dark.md)**: Modern cybernetic, dark-mode first, keyboard-driven productivity & developer tools.
- **[`B2B Clean`](file:///templates/design-systems/b2b-clean.md)**: High-trust corporate SaaS, admin dashboards, data tables, and tabular reporting.
- **[`Editorial Bold`](file:///templates/design-systems/editorial-bold.md)**: Publishing, media, high-contrast serif typography, and bold creative statements.
- **[`Clinical Clean`](file:///templates/design-systems/clinical-clean.md)**: Healthcare, data platforms, medical, sterile, high-legibility, and high-trust.
- **[`Warm Approachable`](file:///templates/design-systems/warm-approachable.md)**: Warm, approachable, rounded, consumer mobile, community & wellness.
- **[`Studio Obsidian`](file:///templates/design-systems/studio-obsidian.md)**: Dark studio craft, warm obsidian surfaces, brushed brass accents, and spatial stage interaction.

